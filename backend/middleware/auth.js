import { adminAuth } from '../config/firebase-admin.js';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const { uid, email, name, picture } = decodedToken;

    // Find or create user in MongoDB
    let user = await User.findOne({ uid });
    if (!user) {
      user = await User.create({
        uid,
        email,
        name: name || email.split('@')[0],
        photo: picture
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(403).json({ message: 'Unauthorized' });
  }
};
