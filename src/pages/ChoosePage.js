import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ChoosePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return navigate('/');
    if (user.role === 'admin' || user.role === 'subadmin') navigate('/tree');
    else navigate('/dashboard');
  }, [user, navigate]);

  return null;
}
