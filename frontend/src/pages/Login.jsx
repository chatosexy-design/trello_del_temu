import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { loginWithGoogle, user, mongoUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && mongoUser) {
      navigate('/');
    }
  }, [user, mongoUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-primary mb-2 italic">Trello Del Temu</h1>
        <p className="text-secondary mb-8">El gestor de tareas para equipos escolares que sí funciona.</p>
        
        <button 
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 py-3 px-6 rounded-lg font-semibold hover:bg-slate-50 transition-all shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" className="w-6 h-6" />
          <span>Iniciar sesión con Google</span>
        </button>
        
        <div className="mt-8 text-xs text-secondary uppercase tracking-widest border-t border-slate-100 pt-8">
          Colaboración Simplificada
        </div>
      </div>
    </div>
  );
};

export default Login;
