import express from 'express';
import { createTask, getWorkspaceTasks, getWorkspaceRelations, updateTaskStatus } from '../controllers/taskController.js';
import { verifyToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', upload.array('files'), createTask);
router.get('/workspace/:workspaceId', getWorkspaceTasks);
router.get('/workspace/:workspaceId/relations', getWorkspaceRelations);
router.patch('/:id/status', updateTaskStatus);

export default router;
