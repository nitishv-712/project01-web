import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [parentId, setParentId] = useState('');
  const [parents, setParents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const isBlocked = mode === 'signup' && role !== 'admin' && parents.length === 0;

  const handleRoleChange = async (newRole) => {
    setRole(newRole);
    setParentId('');
    setParents([]);
    if (newRole === 'subadmin') {
      const res = await axios.get('/api/auth/admins');
      setParents(res.data);
    } else if (newRole === 'user') {
      const res = await axios.get('/api/auth/subadmins');
      setParents(res.data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let loggedInUser;
      if (mode === 'login') {
        loggedInUser = await login(email, password);
      } else {
        loggedInUser = await signup({ name, email, password, role, parentId });
      }
      if (loggedInUser.role === 'user') navigate('/dashboard');
      else navigate('/tree');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: '0 20px' }}>
      <h2 style={{ marginBottom: 4 }}>User Management System</h2>
      <p style={{ color: '#555', marginBottom: 24, marginTop: 0 }}>
        {mode === 'login' ? 'Login to your account' : 'Create a new account'}
      </p>

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setMode('login')} style={toggleBtn(mode === 'login')}>Login</button>
        <button onClick={() => setMode('signup')} style={toggleBtn(mode === 'signup')}>Sign Up</button>
      </div>

      {error && <p style={{ color: 'red', marginBottom: 12, fontSize: 14 }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <>
            <div style={fieldStyle}>
              <label style={labelStyle}>Full Name</label>
              <input style={inputStyle} value={name} onChange={e => setName(e.target.value)}
                placeholder="Your name" required />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>I am signing up as</label>
              <select style={inputStyle} value={role} onChange={e => handleRoleChange(e.target.value)}>
                <option value="admin">Admin</option>
                <option value="subadmin">Sub-admin</option>
                <option value="user">User</option>
              </select>
            </div>

            {(role === 'subadmin' || role === 'user') && (
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  {role === 'subadmin' ? 'Select your Admin' : 'Select your Sub-admin'}
                </label>
                {parents.length === 0 ? (
                  <div style={{ background: '#fff8e1', border: '1px solid #f0c040', borderRadius: 4, padding: '10px 12px', fontSize: 13, color: '#7a5800' }}>
                    No {role === 'subadmin' ? 'admins' : 'sub-admins'} registered yet. Please wait until one registers first.
                  </div>
                ) : (
                  <select style={inputStyle} value={parentId}
                    onChange={e => setParentId(e.target.value)} required>
                    <option value="">-- Select --</option>
                    {parents.map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.email})</option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </>
        )}

        <div style={fieldStyle}>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} type="email" value={email}
            onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Password</label>
          <input style={inputStyle} type="password" value={password}
            onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
        </div>

        <button type="submit" style={{ ...submitBtn, opacity: isBlocked ? 0.5 : 1 }} disabled={loading || isBlocked}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
        </button>
      </form>

      <p style={{ marginTop: 20, fontSize: 13, color: '#666' }}>
        {mode === 'login'
          ? <span>Don't have an account? <span style={linkStyle} onClick={() => setMode('signup')}>Sign up</span></span>
          : <span>Already have an account? <span style={linkStyle} onClick={() => setMode('login')}>Login</span></span>
        }
      </p>
    </div>
  );
}

const toggleBtn = (active) => ({
  padding: '8px 20px', marginRight: 8,
  background: active ? '#333' : '#eee',
  color: active ? '#fff' : '#333',
  border: '1px solid #ccc', borderRadius: 4,
  cursor: 'pointer', fontWeight: active ? 600 : 400,
});
const fieldStyle = { marginBottom: 16 };
const labelStyle = { display: 'block', marginBottom: 5, fontSize: 14, fontWeight: 500 };
const inputStyle = {
  width: '100%', padding: '9px 10px', border: '1px solid #ccc',
  borderRadius: 4, fontSize: 14, boxSizing: 'border-box'
};
const submitBtn = {
  width: '100%', padding: '10px', background: '#333', color: '#fff',
  border: 'none', borderRadius: 4, fontSize: 15, cursor: 'pointer', marginTop: 4
};
const linkStyle = { color: '#333', textDecoration: 'underline', cursor: 'pointer' };
