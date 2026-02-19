import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

export default function TreePage() {
  const { user, logout } = useAuth();
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return navigate('/');
    if (user.role === 'user') return navigate('/dashboard');
    api.get('/api/tree')
      .then(res => setTreeData(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) return <p style={{ padding: 30 }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid #ddd', paddingBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>Hierarchy Tree</h2>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: 14 }}>
            Logged in as <strong>{user?.name}</strong> &nbsp;|&nbsp;
            <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
          </p>
        </div>
        <button onClick={handleLogout} style={{ padding: '7px 16px', background: '#fff', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {treeData?.role === 'admin' && (
        <div>
          {treeData.tree.length === 0 ? (
            <p style={{ color: '#888' }}>No sub-admins have registered under you yet.</p>
          ) : (
            treeData.tree.map(subadmin => (
              <div key={subadmin._id} style={{ marginBottom: 20, border: '1px solid #ddd', borderRadius: 6, overflow: 'hidden' }}>
                
                <div style={{ padding: '12px 16px', background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                  <strong>{subadmin.name}</strong>
                  <span style={{ color: '#666', fontSize: 13, marginLeft: 10 }}>{subadmin.email}</span>
                  <span style={{ float: 'right', fontSize: 12, color: '#555', background: '#e0e0e0', padding: '2px 8px', borderRadius: 10 }}>Sub-admin</span>
                </div>

                {subadmin.children.length === 0 ? (
                  <p style={{ margin: 0, padding: '10px 16px', color: '#aaa', fontSize: 13 }}>No users under this sub-admin</p>
                ) : (
                  subadmin.children.map(u => (
                    <div key={u._id} style={{ padding: '10px 16px 10px 32px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>
                        <span style={{ marginRight: 8, color: '#aaa' }}>└</span>
                        <strong>{u.name}</strong>
                        <span style={{ color: '#666', fontSize: 13, marginLeft: 10 }}>{u.email}</span>
                      </span>
                      <span style={{ fontSize: 12, color: '#555', background: '#e0e0e0', padding: '2px 8px', borderRadius: 10 }}>User</span>
                    </div>
                  ))
                )}
              </div>
            ))
          )}
        </div>
      )}

      {treeData?.role === 'subadmin' && (
        <div>
          <h3 style={{ marginTop: 0 }}>Your Users</h3>
          {treeData.tree.length === 0 ? (
            <p style={{ color: '#888' }}>No users have registered under you yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                  <th style={th}>#</th>
                  <th style={th}>Name</th>
                  <th style={th}>Email</th>
                  <th style={th}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {treeData.tree.map((u, i) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={td}>{i + 1}</td>
                    <td style={td}>{u.name}</td>
                    <td style={td}>{u.email}</td>
                    <td style={td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

const th = { padding: '10px 12px', fontWeight: 600, borderBottom: '1px solid #ddd' };
const td = { padding: '10px 12px' };
