import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  photo: { type: String },
  workspaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
