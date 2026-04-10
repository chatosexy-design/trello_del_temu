import { adminAuth } from '../config/firebase-admin.js';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    console.error("[Auth Middleware] No se recibió token en los headers");
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    console.log("[Auth Middleware] Verificando token de Firebase...");
    const decodedToken = await adminAuth.verifyIdToken(token);
    const { uid, email, name, picture } = decodedToken;
    console.log("[Auth Middleware] Token válido para:", email);

    // Find or create user in MongoDB
    let user = await User.findOne({ uid });
    if (!user) {
      console.log("[Auth Middleware] Creando nuevo usuario en MongoDB:", email);
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
    console.error('[Auth Middleware] ERROR DE VERIFICACIÓN:', error.code, error.message);
    res.status(403).json({ 
      message: 'Unauthorized', 
      error: error.message,
      code: error.code 
    });
  }
};
