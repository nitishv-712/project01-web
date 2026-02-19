import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import ChoosePage from './pages/ChoosePage';
import TreePage from './pages/TreePage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

function RedirectIfLoggedIn({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/choose" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <RedirectIfLoggedIn><AuthPage /></RedirectIfLoggedIn>
          } />
          <Route path="/choose" element={
            <ProtectedRoute><ChoosePage /></ProtectedRoute>
          } />
          <Route path="/tree" element={
            <ProtectedRoute allowedRoles={['admin', 'subadmin']}><TreePage /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['user']}><DashboardPage /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
