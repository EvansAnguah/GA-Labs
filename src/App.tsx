import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Editor from './pages/Editor';
import Login from './pages/Login';
import PublicPortfolio from './pages/PublicPortfolio';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/useAuthStore';

export default function App() {
  const { init } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
        } />
        <Route 
          path="/editor" 
          element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          } 
        />
        <Route path="/:slug" element={<PublicPortfolio />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
