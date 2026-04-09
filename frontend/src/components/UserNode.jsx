import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const UserNode = ({ data }) => {
  const { user, tasks, onAddTask, onShowTask, onShowUserTasks } = data;

  const getStatusCount = (status) => {
    return tasks.filter(t => t.status === status).length;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 min-w-[280px] overflow-hidden hover:shadow-2xl transition-all group">
      <Handle type="target" position={Position.Top} className="w-4 h-4 bg-primary border-4 border-white" />
      
      <div className="p-5 border-b border-slate-50 bg-slate-50/50">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => onShowUserTasks(user, tasks)}
            className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
            title="Ver lista de tareas"
          >
            <div className="relative">
              <img src={user.photo} alt={user.name} className="w-12 h-12 rounded-full border-2 border-primary shadow-sm" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-primary transition-colors">{user.name}</h3>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Integrante</p>
            </div>
          </button>
          <button 
            onClick={() => onAddTask(user)}
            className="p-2 bg-primary text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
            title="Añadir Tarea"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white p-2 rounded-xl border border-slate-100 text-center shadow-sm group-hover:bg-amber-50 group-hover:border-amber-100 transition-colors">
            <div className="text-xs font-bold text-amber-600 mb-1">PEND</div>
            <div className="text-lg font-black text-slate-800">{getStatusCount('pendiente')}</div>
          </div>
          <div className="bg-white p-2 rounded-xl border border-slate-100 text-center shadow-sm group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
            <div className="text-xs font-bold text-blue-600 mb-1">PROG</div>
            <div className="text-lg font-black text-slate-800">{getStatusCount('en progreso')}</div>
          </div>
          <div className="bg-white p-2 rounded-xl border border-slate-100 text-center shadow-sm group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
            <div className="text-xs font-bold text-emerald-600 mb-1">LISTO</div>
            <div className="text-lg font-black text-slate-800">{getStatusCount('terminado')}</div>
          </div>
        </div>
      </div>

      <div className="p-3 max-h-[200px] overflow-y-auto space-y-2 bg-white">
        {tasks.length > 0 ? tasks.map((task) => (
          <button 
            key={task._id}
            onClick={() => onShowTask(task)}
            className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-primary hover:bg-slate-50 transition-all flex items-center justify-between group/task"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              {task.status === 'terminado' ? <CheckCircle2 size={14} className="text-emerald-500" /> : 
               task.status === 'en progreso' ? <Clock size={14} className="text-blue-500" /> : 
               <AlertCircle size={14} className="text-amber-500" />}
              <span className="text-sm font-bold text-slate-700 truncate">{task.title}</span>
            </div>
            <div className="flex -space-x-1 opacity-0 group-hover/task:opacity-100 transition-opacity">
              {task.collaborators.slice(0, 2).map(c => (
                <img key={c._id} src={c.photo} className="w-4 h-4 rounded-full border border-white" />
              ))}
            </div>
          </button>
        )) : (
          <div className="p-6 text-center text-slate-300 italic text-sm border-2 border-dashed border-slate-50 rounded-xl">
            Sin tareas asignadas
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-4 h-4 bg-primary border-4 border-white" />
    </div>
  );
};

export default memo(UserNode);
