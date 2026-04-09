import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ArrowLeft, Users, Settings, Plus, RefreshCw, Share2 } from 'lucide-react';
import ReactFlow, { 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import UserNode from '../components/UserNode';
import TaskModal from '../components/TaskModal';
import TaskViewModal from '../components/TaskViewModal';

const nodeTypes = {
  userNode: UserNode,
};

const WorkspaceDetail = () => {
  const { id } = useParams();
  const { user, mongoUser } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [relations, setRelations] = useState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [selectedUserForTask, setSelectedUserForTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const token = await user.getIdToken();
    try {
      const [wsRes, tasksRes, relsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/workspaces/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/tasks/workspace/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/tasks/workspace/${id}/relations`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setWorkspace(wsRes.data);
      setTasks(tasksRes.data);
      setRelations(relsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching workspace data:', error);
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Transform workspace members and tasks into nodes and edges
  useEffect(() => {
    if (!workspace) return;

    const initialNodes = workspace.members.map((member, index) => ({
      id: member._id,
      type: 'userNode',
      position: { x: 300 * (index % 3), y: 350 * Math.floor(index / 3) },
      data: { 
        user: member, 
        tasks: tasks.filter(t => t.assignedTo._id === member._id),
        onAddTask: (u) => setSelectedUserForTask(u),
        onShowTask: (t) => setSelectedTask(t)
      },
    }));

    // Create unique edges from relations
    const uniqueEdges = [];
    const edgeMap = new Map();

    relations.forEach(rel => {
      const edgeId = `e-${rel.origin._id}-${rel.destination._id}`;
      const reverseEdgeId = `e-${rel.destination._id}-${rel.origin._id}`;
      
      if (!edgeMap.has(edgeId) && !edgeMap.has(reverseEdgeId)) {
        edgeMap.set(edgeId, {
          id: edgeId,
          source: rel.origin._id,
          target: rel.destination._id,
          label: 'Colaboración',
          animated: true,
          style: { stroke: '#2563eb', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#2563eb' },
          data: { task: rel.taskId }
        });
      }
    });

    setNodes(initialNodes);
    setEdges(Array.from(edgeMap.values()));
  }, [workspace, tasks, relations, setNodes, setEdges]);

  const onEdgeClick = useCallback((event, edge) => {
    if (edge.data?.task) {
      setSelectedTask(edge.data.task);
    }
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold animate-pulse">Cargando tablero...</p>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-slate-400 hover:text-primary transition-all p-2 hover:bg-slate-50 rounded-xl">
            <ArrowLeft size={24} />
          </Link>
          <div className="h-10 w-[1px] bg-slate-100 mx-2"></div>
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              {workspace.name}
              <span className="text-xs font-bold bg-blue-50 text-primary px-2 py-0.5 rounded-full border border-blue-100">ESPACIO</span>
            </h1>
            <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
              <div className="flex items-center gap-1 font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                <Share2 size={12} />
                {workspace.inviteCode}
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1 font-semibold">
                <Users size={14} />
                <span>{workspace.members.length} miembros</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex -space-x-3 items-center">
            {workspace.members.slice(0, 5).map((member) => (
              <img 
                key={member._id} 
                src={member.photo} 
                alt={member.name} 
                className="w-10 h-10 rounded-full border-4 border-white shadow-sm hover:translate-y-[-2px] transition-transform cursor-pointer"
                title={member.name}
              />
            ))}
            {workspace.members.length > 5 && (
              <div className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                +{workspace.members.length - 5}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={fetchData}
              className="p-3 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-xl transition-all"
              title="Actualizar Tablero"
            >
              <RefreshCw size={20} />
            </button>
            <button className="p-3 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-xl transition-all">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative bg-slate-100">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={1.5}
          className="bg-slate-100"
        >
          <Background color="#cbd5e1" gap={20} size={1} />
          <Controls className="bg-white border-slate-200 shadow-xl rounded-xl overflow-hidden" />
        </ReactFlow>

        {/* Legend */}
        <div className="absolute bottom-6 right-6 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white shadow-xl flex gap-6 z-20">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Colaboración Activa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Pendientes</span>
          </div>
        </div>
      </main>

      <TaskModal 
        isOpen={!!selectedUserForTask}
        onClose={() => setSelectedUserForTask(null)}
        assignedTo={selectedUserForTask}
        workspaceId={id}
        onSuccess={fetchData}
        members={workspace.members}
      />

      <TaskViewModal 
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
      />
    </div>
  );
};

export default WorkspaceDetail;
