import Task from '../models/Task.js';
import Relation from '../models/Relation.js';
import { adminStorage } from '../config/firebase-admin.js';
import { v4 as uuidv4 } from 'uuid';

export const createTask = async (req, res) => {
  const { title, description, startDate, endDate, status, assignedTo, collaborators, workspace } = req.body;
  const files = req.files;

  if (!title || !description || !files || files.length === 0) {
    return res.status(400).json({ message: 'Título, descripción y al menos una evidencia son obligatorios' });
  }

  try {
    const bucket = adminStorage.bucket();
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const fileName = `${uuidv4()}_${file.originalname}`;
        const fileUpload = bucket.file(`evidences/${fileName}`);
        
        await fileUpload.save(file.buffer, {
          metadata: { contentType: file.mimetype },
        });

        // Make file public or get a signed URL (for simplicity, we'll use a public-like approach or signed URL)
        // For this demo, we'll just get a signed URL valid for a long time
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
    );

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

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task' });
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
    const task = await Task.findByIdAndUpdate(id, { status }, { new: true });
    res.status(200).json(task);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Error updating task status' });
  }
};
