import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, required: true }, // mime type
  uploadDate: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ['pendiente', 'en progreso', 'terminado'], default: 'pendiente' },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  files: [fileSchema],
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);
export default Task;
