import Task from '../models/Task.js';
import Relation from '../models/Relation.js';
import { adminStorage } from '../config/firebase-admin.js';
import { v4 as uuidv4 } from 'uuid';

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

        await fileUpload.save(file.buffer, {
          metadata: { contentType: file.mimetype },
        });

        const [url] = await fileUpload.getSignedUrl({
          action: 'read',
          expires: '03-09-2491', // Long term
        });

        return {
          name: file.originalname,
          url,
          type: file.mimetype,
        };
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
  console.log(`[Backend:addFilesToTask] Cantidad de archivos: ${files?.length || 0}`);

  if (!files || files.length === 0) {
    console.error(`[Backend:addFilesToTask] No se recibieron archivos`);
    return res.status(400).json({ message: 'No se recibieron archivos en la petición' });
  }

  try {
    const bucket = adminStorage.bucket();
    console.log(`[Backend:addFilesToTask] Bucket obtenido: ${bucket.name}`);

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const fileName = `${uuidv4()}_${file.originalname}`;
        const fileUpload = bucket.file(`evidences/${fileName}`);
        
        console.log(`[Backend:addFilesToTask] Subiendo archivo: ${fileName} (${file.mimetype}, ${file.size} bytes)`);

        await fileUpload.save(file.buffer, {
          metadata: { contentType: file.mimetype },
        });

        console.log(`[Backend:addFilesToTask] Generando Signed URL para: ${fileName}`);
        const [url] = await fileUpload.getSignedUrl({
          action: 'read',
          expires: '03-09-2491',
        });

        return {
          name: file.originalname,
          url,
          type: file.mimetype,
        };
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
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    console.log(`[Backend:addFilesToTask] Archivos añadidos con éxito. Total de archivos ahora: ${task.files.length}`);
    res.status(200).json(task);
  } catch (error) {
    console.error('[Backend:addFilesToTask] Error completo:', error);
    res.status(500).json({ 
      message: 'Error al procesar archivos en el servidor',
      error: error.message 
    });
  }
};
