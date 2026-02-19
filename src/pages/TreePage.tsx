import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import api from '../api';


interface TreeUser {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface SubadminNode extends TreeUser {
  children: TreeUser[];
}

interface TreeData {
  role: 'admin' | 'subadmin';
  tree: SubadminNode[] | TreeUser[];
}

export default function TreePage() {
  const { user, logout } = useAuth();
  const [treeData, setTreeData] = useState<TreeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    if (user.role === 'user') { navigate('/dashboard'); return; }
    api.get<TreeData>('/api/tree')
      .then(res => { 
        console.log('Fetched tree data:', res.data);
        return setTreeData(res.data)})
      .catch(err => setError(err.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hierarchy Tree</h1>
            <p className="text-sm text-gray-500 mt-1">
              Logged in as <span className="font-medium text-gray-700">{user?.name}</span>
              &nbsp;·&nbsp;
              <span className="capitalize">{user?.role}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {treeData?.role === 'admin' && (
          <div className="space-y-4">
            {(treeData.tree as SubadminNode[]).length === 0 ? (
              <p className="text-gray-400 text-sm">No sub-admins have registered under you yet.</p>
            ) : (
              (treeData.tree as SubadminNode[]).map(subadmin => (
                <div key={subadmin._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
             
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <div>
                      <span className="font-semibold text-gray-900">{subadmin.name}</span>
                      <span className="text-gray-500 text-sm ml-2">{subadmin.email}</span>
                    </div>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full">Sub-admin</span>
                  </div>
                  
                  {subadmin.children.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-400">No users under this sub-admin</p>
                  ) : (
                    subadmin.children.map(u => (
                      <div key={u._id} className="flex items-center justify-between px-4 py-3 border-t border-gray-100 pl-8">
                        <div>
                          <span className="text-gray-400 mr-2">└</span>
                          <span className="font-medium text-gray-800">{u.name}</span>
                          <span className="text-gray-500 text-sm ml-2">{u.email}</span>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">User</span>
                      </div>
                    ))
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {treeData?.role === 'subadmin' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Your Users</h2>
            </div>
            {(treeData.tree as TreeUser[]).length === 0 ? (
              <p className="px-4 py-4 text-sm text-gray-400">No users have registered under you yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">#</th>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Email</th>
                    <th className="px-4 py-3 text-left font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {(treeData.tree as TreeUser[]).map((u, i) => (
                    <tr key={u._id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
