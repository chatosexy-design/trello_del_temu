import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import crypto from 'crypto';

export const createWorkspace = async (req, res) => {
  const { name } = req.body;
  const ownerId = req.user._id;

  try {
    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    const workspace = await Workspace.create({
      name,
      owner: ownerId,
      members: [ownerId],
      inviteCode
    });

    // Update user's workspaces
    await User.findByIdAndUpdate(ownerId, { $push: { workspaces: workspace._id } });

    res.status(201).json(workspace);
  } catch (error) {
    console.error('Error creating workspace:', error);
    res.status(500).json({ message: 'Error creating workspace' });
  }
};

export const joinWorkspace = async (req, res) => {
  const { inviteCode } = req.body;
  const userId = req.user._id;

  try {
    const workspace = await Workspace.findOne({ inviteCode });
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    if (workspace.members.includes(userId)) {
      return res.status(400).json({ message: 'You are already a member' });
    }

    workspace.members.push(userId);
    await workspace.save();

    await User.findByIdAndUpdate(userId, { $push: { workspaces: workspace._id } });

    res.status(200).json(workspace);
  } catch (error) {
    console.error('Error joining workspace:', error);
    res.status(500).json({ message: 'Error joining workspace' });
  }
};

export const getMyWorkspaces = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('workspaces');
    res.status(200).json(user.workspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    res.status(500).json({ message: 'Error fetching workspaces' });
  }
};

export const getWorkspaceById = async (req, res) => {
  const { id } = req.params;
  try {
    const workspace = await Workspace.findById(id).populate('members');
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    res.status(200).json(workspace);
  } catch (error) {
    console.error('Error fetching workspace:', error);
    res.status(500).json({ message: 'Error fetching workspace' });
  }
};
