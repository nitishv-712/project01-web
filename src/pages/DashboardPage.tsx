import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
    
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
          <p className="text-gray-700">
            Hi <span className="font-semibold text-gray-900">{user?.name}</span>, you are logged in as a{' '}
            <span className="font-semibold text-gray-900">User</span>.
          </p>
          <p className="text-gray-500 text-sm">Email: {user?.email}</p>
          <p className="text-gray-400 text-sm">
            You are assigned to a sub-admin. Your account is managed by them.
          </p>
        </div>
      </div>
    </div>
  );
}
