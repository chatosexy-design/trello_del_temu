import React, { useState } from 'react';
import { Download, FileText, Image as ImageIcon, File, Calendar, Clock, User as UserIcon, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TaskViewModal = ({ isOpen, onClose, task, onUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  if (!isOpen || !task) return null;

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setUploadingFiles(true);
    setUploadProgress(0);
    setError('');

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const token = await user.getIdToken();
      await axios.post(`${import.meta.env.VITE_API_URL}/api/tasks/${task._id}/files`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });
      onUpdate();
    } catch (err) {
      console.error('Error uploading files:', err);
      if (err.response?.status === 413) {
        setError('Los archivos son demasiado grandes para Vercel (máx. 4.5MB en total)');
      } else {
        setError(err.response?.data?.message || 'Error al subir archivos. Intenta con un archivo más pequeño.');
      }
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setError('');
    setLoading(true);
    try {
      const token = await user.getIdToken();
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/tasks/${task._id}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate();
      onClose();
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.response?.data?.message || 'Error al actualizar el estado');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type) => {
    if (type.includes('image')) return <ImageIcon size={20} className="text-blue-500" />;
    if (type.includes('pdf')) return <FileText size={20} className="text-red-500" />;
    return <File size={20} className="text-slate-500" />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'en progreso': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'terminado': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[2000]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(task.status)}`}>
              {task.status}
            </div>
            <h2 className="text-xl font-bold text-slate-900 truncate max-w-md">{task.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <FileText size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[80vh]">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
              <AlertCircle size={20} />
              <p className="font-semibold text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Descripción</label>
            <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap">{task.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Calendar size={14} /> Fechas
                </label>
                <div className="space-y-1">
                  <p className="text-sm text-slate-600 flex justify-between">
                    <span>Inicio:</span> <span className="font-semibold">{task.startDate ? new Date(task.startDate).toLocaleDateString() : 'N/A'}</span>
                  </p>
                  <p className="text-sm text-slate-600 flex justify-between">
                    <span>Entrega:</span> <span className="font-semibold text-primary">{task.endDate ? new Date(task.endDate).toLocaleDateString() : 'N/A'}</span>
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <UserIcon size={14} /> Asignado a
                </label>
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl">
                  <img src={task.assignedTo.photo} alt="" className="w-8 h-8 rounded-full border border-white" />
                  <span className="text-sm font-bold text-slate-700">{task.assignedTo.name}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Users size={14} /> Colaboradores
                </label>
                <div className="flex flex-wrap gap-2">
                  {task.collaborators.length > 0 ? task.collaborators.map(collab => (
                    <div key={collab._id} className="flex items-center gap-2 bg-blue-50 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                      <img src={collab.photo} alt="" className="w-5 h-5 rounded-full" />
                      {collab.name}
                    </div>
                  )) : (
                    <p className="text-xs text-slate-400 italic">Sin colaboradores adicionales</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Clock size={14} /> Cambiar Estado
                </label>
                <div className="flex gap-2">
                  {['pendiente', 'en progreso', 'terminado'].filter(s => s !== task.status).map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={loading}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-primary hover:text-primary transition-all disabled:opacity-50 capitalize"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Clock size={14} /> Evidencias Adjuntas ({task.files.length})
              </label>
              <button 
                onClick={() => document.getElementById('addFileInput').click()}
                disabled={uploadingFiles}
                className="text-xs font-bold text-primary hover:text-blue-700 flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <ImageIcon size={14} />
                <span>+ Añadir Evidencia</span>
              </button>
              <input 
                id="addFileInput"
                type="file" 
                multiple 
                className="hidden" 
                onChange={handleFileUpload}
              />
            </div>

            {uploadingFiles && (
              <div className="mb-4">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>Subiendo archivos...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              {task.files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-blue-50 transition-colors overflow-hidden">
                      {file.type.includes('image') ? (
                        <img src={file.url} alt="" className="w-8 h-8 object-cover rounded" />
                      ) : getFileIcon(file.type)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 truncate max-w-[300px]">{file.name}</p>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">{file.type.split('/')[1]}</p>
                    </div>
                  </div>
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-primary/20"
                  >
                    <Download size={18} />
                    <span>Ver / Descargar</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={onClose} 
            className="w-full py-4 bg-white text-slate-600 font-bold border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cerrar Detalles
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskViewModal;
