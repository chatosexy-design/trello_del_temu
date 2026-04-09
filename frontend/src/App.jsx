import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import WorkspaceList from './pages/WorkspaceList';
import WorkspaceDetail from './pages/WorkspaceDetail';

const ProtectedRoute = ({ children }) => {
  const { user, mongoUser, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold">Cargando perfil...</p>
      </div>
    </div>
  );
  if (!user || !mongoUser) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <WorkspaceList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/workspace/:id" 
            element={
              <ProtectedRoute>
                <WorkspaceDetail />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
