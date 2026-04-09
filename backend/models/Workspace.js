import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  inviteCode: { type: String, unique: true }
}, { timestamps: true });

const Workspace = mongoose.model('Workspace', workspaceSchema);
export default Workspace;
