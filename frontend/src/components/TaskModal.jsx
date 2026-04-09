import React, { useState } from 'react';
import { X, Upload, FileText, Image as ImageIcon, File, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TaskModal = ({ isOpen, onClose, assignedTo, workspaceId, onSuccess, members }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('pendiente');
  const [collaborators, setCollaborators] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles([...files, ...selectedFiles]);
    setError('');
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const getFileIcon = (type) => {
    if (type.includes('image')) return <ImageIcon size={20} className="text-blue-500" />;
    if (type.includes('pdf')) return <FileText size={20} className="text-red-500" />;
    return <File size={20} className="text-slate-500" />;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title) return setError('El título es obligatorio');
    if (!description) return setError('La descripción es obligatoria');
    
    // Solo validar archivos si el estado es 'terminado'
    if (status === 'terminado' && files.length === 0) {
      return setError('No puedes marcar la tarea como terminada sin subir al menos una evidencia');
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);
    formData.append('status', status);
    formData.append('assignedTo', assignedTo._id);
    formData.append('workspace', workspaceId);
    formData.append('collaborators', JSON.stringify(collaborators));
    
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const token = await user.getIdToken();
      await axios.post(`${import.meta.env.VITE_API_URL}/api/tasks`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Error al crear la tarea. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[1000]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img src={assignedTo.photo} alt={assignedTo.name} className="w-10 h-10 rounded-full border-2 border-primary" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">Nueva Tarea para {assignedTo.name}</h2>
              <p className="text-sm text-slate-500">Completa los campos obligatorios para guardar.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-shake">
              <AlertCircle size={20} />
              <p className="font-semibold text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Título de la Tarea *</label>
              <input 
                type="text" 
                placeholder="Ej: Investigación de Mercado"
                className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Descripción *</label>
              <textarea 
                placeholder="Describe detalladamente lo que se debe hacer..."
                rows={3}
                className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Fecha de Inicio</label>
                <input 
                  type="date" 
                  className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Fecha de Entrega</label>
                <input 
                  type="date" 
                  className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Estado</label>
              <select 
                className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none bg-white"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="pendiente">Pendiente</option>
                <option value="en progreso">En Progreso</option>
                <option value="terminado">Terminado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Colaboradores</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {collaborators.map(collabId => {
                  const member = members.find(m => m._id === collabId);
                  return (
                    <div key={collabId} className="flex items-center gap-2 bg-blue-50 text-primary px-3 py-1.5 rounded-full text-sm font-semibold border border-blue-100">
                      <img src={member?.photo} alt="" className="w-5 h-5 rounded-full" />
                      {member?.name}
                      <button type="button" onClick={() => setCollaborators(collaborators.filter(id => id !== collabId))}>
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <select 
                className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none bg-white"
                onChange={(e) => {
                  if (e.target.value && !collaborators.includes(e.target.value)) {
                    setCollaborators([...collaborators, e.target.value]);
                  }
                }}
                value=""
              >
                <option value="">Añadir colaborador...</option>
                {members.filter(m => m._id !== assignedTo._id && !collaborators.includes(m._id)).map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Subir Evidencia {status === 'terminado' ? '*' : '(Opcional ahora)'}</label>
              <div 
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
                  ${files.length > 0 ? 'border-primary bg-blue-50/30' : status === 'terminado' ? 'border-red-200 bg-red-50/10 hover:border-red-400' : 'border-slate-200 hover:border-primary hover:bg-slate-50'}`}
                onClick={() => document.getElementById('fileInput').click()}
              >
                <input 
                  id="fileInput"
                  type="file" 
                  multiple 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center gap-3">
                  <div className={`p-4 rounded-full ${files.length > 0 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <Upload size={32} />
                  </div>
                  <p className="font-semibold text-slate-700">Haz click para subir archivos</p>
                  <p className="text-xs text-slate-400">PDF, Imágenes, Word, Excel, etc. (Máx 10MB)</p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {getFileIcon(file.type)}
                        <span className="text-sm font-medium text-slate-700 truncate">{file.name}</span>
                        <span className="text-xs text-slate-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeFile(index)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-4">
          {loading && uploadProgress > 0 && (
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-4 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-4 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Guardar Tarea
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
