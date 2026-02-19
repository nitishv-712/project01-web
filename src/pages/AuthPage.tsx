import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, Role } from '../context/AuthContext';
import api from '../api';

interface Parent {
  _id: string;
  name: string;
  email: string;
}

type Mode = 'login' | 'signup';

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [role, setRole] = useState<Role>('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [parentId, setParentId] = useState('');
  const [parents, setParents] = useState<Parent[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState<Parent[]>([]);
  const [subadmins, setSubadmins] = useState<Parent[]>([]);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get<Parent[]>('/api/auth/admins').then(res => setAdmins(res.data)).catch(() => {});
    api.get<Parent[]>('/api/auth/subadmins').then(res => setSubadmins(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (role === 'subadmin') setParents(admins);
    else if (role === 'user') setParents(subadmins);
  }, [admins, subadmins, role]);

  const isBlocked = mode === 'signup' && role !== 'admin' && parents.length === 0;

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setParentId('');
    if (newRole === 'subadmin') setParents(admins);
    else if (newRole === 'user') setParents(subadmins);
    else setParents([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">User Management System</h1>
        <p className="text-gray-500 text-sm mb-6">
          {mode === 'login' ? 'Login to your account' : 'Create a new account'}
        </p>

        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          {(['login', 'signup'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all capitalize ${
                mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {m === 'login' ? 'Login' : 'Sign Up'}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your name" required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">I am signing up as</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  value={role} onChange={e => handleRoleChange(e.target.value as Role)}
                >
                  <option value="admin">Admin</option>
                  <option value="subadmin">Sub-admin</option>
                  <option value="user">User</option>
                </select>
              </div>

              {(role === 'subadmin' || role === 'user') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {role === 'subadmin' ? 'Select your Admin' : 'Select your Sub-admin'}
                  </label>
                  {parents.length === 0 ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm">
                      No {role === 'subadmin' ? 'admins' : 'sub-admins'} registered yet.
                    </div>
                  ) : (
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      value={parentId} onChange={e => setParentId(e.target.value)} required
                    >
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter password" required
            />
          </div>

          <button
            type="submit"
            disabled={loading || isBlocked}
            className="w-full py-2.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          {mode === 'login' ? (
            <>Don't have an account?{' '}
              <button onClick={() => setMode('signup')} className="text-gray-900 font-medium underline">Sign up</button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-gray-900 font-medium underline">Login</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
