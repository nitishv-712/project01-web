import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{ maxWidth: 500, margin: '60px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, borderBottom: '1px solid #ddd', paddingBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        <button onClick={handleLogout} style={{ padding: '7px 16px', background: '#fff', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      <p>Hi <strong>{user?.name}</strong>, you are logged in as a <strong>User</strong>.</p>
      <p style={{ color: '#555' }}>Email: {user?.email}</p>
      <p style={{ color: '#888', fontSize: 14 }}>
        You are assigned to a sub-admin. Your account is managed by them.
      </p>
    </div>
  );
}
