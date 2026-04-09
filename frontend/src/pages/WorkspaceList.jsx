import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Plus, Users, Layout, LogOut } from 'lucide-react';

const WorkspaceList = () => {
  const { user, mongoUser, logout } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    const token = await user.getIdToken();
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/workspaces`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkspaces(response.data);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const token = await user.getIdToken();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/workspaces`, { name }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setName('');
      setShowCreate(false);
      fetchWorkspaces();
    } catch (error) {
      console.error('Error creating workspace:', error);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    const token = await user.getIdToken();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/workspaces/join`, { inviteCode }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInviteCode('');
      setShowJoin(false);
      fetchWorkspaces();
    } catch (error) {
      console.error('Error joining workspace:', error);
      alert('Código de invitación inválido o ya eres miembro.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Mis Espacios de Trabajo</h1>
            <p className="text-slate-500">Hola, {mongoUser?.name}. Selecciona un espacio para empezar.</p>
          </div>
          <div className="flex items-center gap-4">
            <img src={mongoUser?.photo} alt="Profile" className="w-10 h-10 rounded-full border-2 border-primary" />
            <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((ws) => (
            <Link 
              key={ws._id} 
              to={`/workspace/${ws._id}`}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                  <Layout size={24} />
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-sm">
                  <Users size={14} />
                  <span>{ws.members.length}</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">{ws.name}</h3>
              <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Código: {ws.inviteCode}</p>
            </Link>
          ))}

          <button 
            onClick={() => setShowCreate(true)}
            className="border-2 border-dashed border-slate-200 p-6 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-primary hover:text-primary transition-all bg-white/50"
          >
            <Plus size={32} />
            <span className="font-semibold">Crear Espacio</span>
          </button>

          <button 
            onClick={() => setShowJoin(true)}
            className="border-2 border-dashed border-slate-200 p-6 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-accent hover:text-accent transition-all bg-white/50"
          >
            <Users size={32} />
            <span className="font-semibold">Unirse a Espacio</span>
          </button>
        </div>

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-2xl max-w-sm w-full shadow-2xl">
              <h2 className="text-2xl font-bold mb-4">Nuevo Espacio</h2>
              <form onSubmit={handleCreate}>
                <input 
                  type="text" 
                  placeholder="Nombre del espacio..." 
                  className="w-full border border-slate-200 rounded-lg p-3 mb-6 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-3 text-slate-500 font-semibold hover:bg-slate-50 rounded-lg transition-colors">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Crear</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Join Modal */}
        {showJoin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-2xl max-w-sm w-full shadow-2xl">
              <h2 className="text-2xl font-bold mb-4">Unirse a Espacio</h2>
              <p className="text-slate-500 mb-6">Ingresa el código de invitación que te compartieron.</p>
              <form onSubmit={handleJoin}>
                <input 
                  type="text" 
                  placeholder="Código (ej: AB12CD34)..." 
                  className="w-full border border-slate-200 rounded-lg p-3 mb-6 outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent uppercase"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  required
                />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowJoin(false)} className="flex-1 py-3 text-slate-500 font-semibold hover:bg-slate-50 rounded-lg transition-colors">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors">Unirse</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceList;
