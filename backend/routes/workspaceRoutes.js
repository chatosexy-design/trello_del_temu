import express from 'express';
import { createWorkspace, joinWorkspace, getMyWorkspaces, getWorkspaceById } from '../controllers/workspaceController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', createWorkspace);
router.post('/join', joinWorkspace);
router.get('/', getMyWorkspaces);
router.get('/:id', getWorkspaceById);

export default router;
