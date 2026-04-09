import mongoose from 'mongoose';

const relationSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  origin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true }
}, { timestamps: true });

const Relation = mongoose.model('Relation', relationSchema);
export default Relation;
