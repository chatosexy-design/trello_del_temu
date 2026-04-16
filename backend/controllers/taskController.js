import Task from '../models/Task.js';
import Relation from '../models/Relation.js';
import { adminStorage } from '../config/firebase-admin.js';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

export const createTask = async (req, res) => {
  const { title, description, startDate, endDate, status, assignedTo, collaborators, workspace } = req.body;
  const files = req.files || [];

  console.log(`[Backend:createTask] Creando tarea: ${title}`);

  if (!title || !description) {
    return res.status(400).json({ message: 'Título y descripción son obligatorios' });
  }

  // VALIDACIÓN: Si el estado es 'terminado', debe tener al menos un archivo
  if (status === 'terminado' && files.length === 0) {
    return res.status(400).json({ message: 'No puedes marcar la tarea como terminada sin subir al menos una evidencia' });
  }

  try {
    const bucket = adminStorage.bucket();
    const uploadedFiles = files.length > 0 ? await Promise.all(
      files.map(async (file) => {
        const fileName = `${uuidv4()}_${file.originalname}`;
        const fileUpload = bucket.file(`evidences/${fileName}`);
        
        console.log(`[Backend:createTask] Subiendo evidencia: ${fileName}`);

        try {
          if (!file.buffer) {
            throw new Error(`El archivo ${file.originalname} no tiene contenido.`);
          }

          await fileUpload.save(file.buffer, {
            metadata: { 
              contentType: file.mimetype,
              metadata: { firebaseStorageDownloadTokens: uuidv4() }
            },
            resumable: false
          });

          const [url] = await fileUpload.getSignedUrl({
            action: 'read',
            expires: Date.now() + 1000 * 60 * 60 * 24 * 365,
            version: 'v4'
          });

          return {
            name: file.originalname,
            url,
            type: file.mimetype,
          };
        } catch (uploadError) {
          console.error(`[Backend:createTask] Error subiendo archivo ${file.originalname}:`, uploadError);
          // Fallback URL
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/evidences/${fileName}`;
          return {
            name: file.originalname,
            url: publicUrl,
            type: file.mimetype,
          };
        }
      })
    ) : [];

    const task = await Task.create({
      title,
      description,
      startDate,
      endDate,
      status,
      creator: req.user._id,
      assignedTo,
      collaborators: collaborators ? JSON.parse(collaborators) : [],
      files: uploadedFiles,
      workspace
    });

    // Create relations for visualization
    const collabList = collaborators ? JSON.parse(collaborators) : [];
    if (collabList.length > 0) {
      await Promise.all(
        collabList.map(async (collabId) => {
          await Relation.create({
            taskId: task._id,
            origin: assignedTo,
            destination: collabId,
            workspace
          });
        })
      );
    }

    console.log(`[Backend:createTask] Tarea creada con éxito: ${task._id}`);
    res.status(201).json(task);
  } catch (error) {
    console.error('[Backend:createTask] Error:', error);
    res.status(500).json({ 
      message: 'Error al crear la tarea',
      error: error.message 
    });
  }
};

export const getWorkspaceTasks = async (req, res) => {
  const { workspaceId } = req.params;
  try {
    const tasks = await Task.find({ workspace: workspaceId })
      .populate('creator assignedTo collaborators');
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

export const getWorkspaceRelations = async (req, res) => {
  const { workspaceId } = req.params;
  try {
    const relations = await Relation.find({ workspace: workspaceId })
      .populate('taskId origin destination');
    res.status(200).json(relations);
  } catch (error) {
    console.error('Error fetching relations:', error);
    res.status(500).json({ message: 'Error fetching relations' });
  }
};

export const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Si se intenta marcar como terminado, verificar evidencias
    if (status === 'terminado') {
      const task = await Task.findById(id);
      if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
      
      if (task.files.length === 0) {
        return res.status(400).json({ message: 'No puedes marcar la tarea como terminada sin subir al menos una evidencia' });
      }
    }

    const task = await Task.findByIdAndUpdate(id, { status }, { new: true });
    res.status(200).json(task);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Error updating task status' });
  }
};

export const addFilesToTask = async (req, res) => {
  const { id } = req.params;
  const files = req.files;

  console.log(`[Backend:addFilesToTask] Recibida solicitud para tarea: ${id}`);
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error(`[Backend:addFilesToTask] ID no válido: ${id}`);
    return res.status(400).json({ message: 'ID de tarea no válido' });
  }

  if (!files || files.length === 0) {
    console.error(`[Backend:addFilesToTask] No se recibieron archivos`);
    return res.status(400).json({ message: 'No se recibieron archivos en la petición' });
  }

  try {
    const bucket = adminStorage.bucket();
    if (!bucket) {
      throw new Error('No se pudo acceder al bucket de Firebase Storage. Verifica la configuración.');
    }
    
    console.log(`[Backend:addFilesToTask] Bucket obtenido: ${bucket.name}`);

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const fileName = `${uuidv4()}_${file.originalname}`;
        const fileUpload = bucket.file(`evidences/${fileName}`);
        
        console.log(`[Backend:addFilesToTask] Intentando subir archivo: ${fileName} (${file.mimetype})`);

        try {
          // Usar buffer si existe, si no, lanzar error claro
          if (!file.buffer) {
            throw new Error(`El archivo ${file.originalname} no tiene contenido (buffer vacío).`);
          }

          await fileUpload.save(file.buffer, {
            metadata: { 
              contentType: file.mimetype,
              metadata: {
                firebaseStorageDownloadTokens: uuidv4(),
              }
            },
            resumable: false // Desactivar resumable para archivos pequeños (más rápido en serverless)
          });
          console.log(`[Backend:addFilesToTask] Archivo guardado en Storage: ${fileName}`);
        } catch (uploadError) {
          console.error(`[Backend:addFilesToTask] Error en fileUpload.save:`, uploadError);
          throw new Error(`Error al guardar en Firebase Storage: ${uploadError.message}`);
        }

        console.log(`[Backend:addFilesToTask] Generando URL para: ${fileName}`);
        try {
          // Intentar obtener Signed URL con versión v4 que es más compatible
          const [url] = await fileUpload.getSignedUrl({
            action: 'read',
            expires: Date.now() + 1000 * 60 * 60 * 24 * 365, // 1 año desde ahora
            version: 'v4'
          });

          return {
            name: file.originalname,
            url,
            type: file.mimetype,
          };
        } catch (urlError) {
          console.error(`[Backend:addFilesToTask] Error en getSignedUrl:`, urlError);
          // Fallback: Si falla el signed URL, intentamos construir una URL pública básica 
          // (Nota: Esto solo funcionará si el bucket es público, pero ayuda a que no explote)
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/evidences/${fileName}`;
          console.log(`[Backend:addFilesToTask] Usando fallback URL: ${publicUrl}`);
          
          return {
            name: file.originalname,
            url: publicUrl,
            type: file.mimetype,
          };
        }
      })
    );

    console.log(`[Backend:addFilesToTask] Actualizando MongoDB para la tarea: ${id}`);
    const task = await Task.findByIdAndUpdate(
      id, 
      { $push: { files: { $each: uploadedFiles } } },
      { new: true }
    );

    if (!task) {
      console.error(`[Backend:addFilesToTask] Tarea no encontrada en MongoDB: ${id}`);
      return res.status(404).json({ message: 'Tarea no encontrada en la base de datos' });
    }

    console.log(`[Backend:addFilesToTask] Archivos añadidos con éxito. Total de archivos ahora: ${task.files.length}`);
    res.status(200).json(task);
  } catch (error) {
    console.error('[Backend:addFilesToTask] ERROR CRÍTICO:', error);
    res.status(500).json({ 
      message: error.message || 'Error interno al procesar los archivos',
      error: error.stack // Enviamos el stack para diagnóstico (quitar en producción real después)
    });
  }
};
