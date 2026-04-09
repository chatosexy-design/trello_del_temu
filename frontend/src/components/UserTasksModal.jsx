import React from 'react';
import { X, CheckCircle2, Clock, AlertCircle, FileText, ExternalLink } from 'lucide-react';

const UserTasksModal = ({ isOpen, onClose, user, tasks, onShowTask }) => {
  if (!isOpen || !user) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'terminado': return <CheckCircle2 size={18} className="text-emerald-500" />;
      case 'en progreso': return <Clock size={18} className="text-blue-500" />;
      default: return <AlertCircle size={18} className="text-amber-500" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'terminado': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'en progreso': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[1500]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <img src={user.photo} alt={user.name} className="w-12 h-12 rounded-full border-2 border-primary shadow-sm" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">Tareas de {user.name}</h2>
              <p className="text-sm text-slate-500 font-medium">Lista de actividades asignadas</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div 
                key={task._id}
                className="group relative bg-white border border-slate-200 rounded-2xl p-5 hover:border-primary hover:shadow-md transition-all cursor-pointer"
                onClick={() => onShowTask(task)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(task.status)}
                    <h3 className="font-bold text-slate-800 group-hover:text-primary transition-colors">{task.title}</h3>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusClass(task.status)}`}>
                    {task.status}
                  </div>
                </div>
                
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                  {task.description}
                </p>

                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-4 text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <FileText size={14} />
                      <span>{task.files.length} Evidencias</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Ver detalles</span>
                    <ExternalLink size={14} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-300">
              <div className="p-6 bg-slate-50 rounded-full mb-4">
                <FileText size={48} />
              </div>
              <p className="font-bold text-lg">No hay tareas aún</p>
              <p className="text-sm italic text-slate-400">Este usuario no tiene actividades asignadas.</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-white text-slate-600 font-bold border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors shadow-sm"
          >
            Cerrar Lista
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserTasksModal;
