'use client';

import { useState, useEffect } from 'react';
import ClientLayout from '../../components/layout/ClientLayout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import StatusBadge from '../../components/ui/StatusBadge';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { api, ApiError } from '../../lib/api';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, usersRes, docsRes, logsRes] = await Promise.all([
          api.admin.getStats(),
          api.admin.getUsers(),
          api.admin.getDocuments(),
          api.admin.getAuditLogs({ limit: 50 }),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data.users);
        setDocuments(docsRes.data.documents);
        setAuditLogs(logsRes.data.logs);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'documents', label: 'Documents' },
    { id: 'audit', label: 'Audit Logs' },
  ];

  return (
    <ClientLayout>
      <ProtectedRoute adminOnly>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Admin Dashboard</h1>

          <Alert message={error} onClose={() => setError('')} />

          {loading ? (
            <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
          ) : (
            <>
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'overview' && stats && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users', value: stats.totalUsers },
                    { label: 'Total Documents', value: stats.totalDocuments },
                    { label: 'Signed Documents', value: stats.signedDocuments },
                    { label: 'Audit Log Entries', value: stats.totalAuditLogs },
                  ].map((stat) => (
                    <div key={stat.label} className="card text-center">
                      <p className="text-3xl font-bold text-primary-600">{stat.value}</p>
                      <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'users' && (
                <>
                  <div className="md:hidden space-y-3">
                    {users.map((user) => (
                      <div key={user.id} className="card !p-4">
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600 break-all mt-1">{user.email}</p>
                        <div className="flex justify-between items-center mt-2 text-sm">
                          <span className="capitalize text-gray-500">{user.role}</span>
                          <span className="text-gray-400">{new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="hidden md:block card overflow-x-auto">
                    <table className="w-full text-sm min-w-[500px]">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-3 font-medium text-gray-600">Name</th>
                          <th className="pb-3 font-medium text-gray-600">Email</th>
                          <th className="pb-3 font-medium text-gray-600">Role</th>
                          <th className="pb-3 font-medium text-gray-600">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b last:border-0">
                            <td className="py-3">{user.name}</td>
                            <td className="py-3">{user.email}</td>
                            <td className="py-3 capitalize">{user.role}</td>
                            <td className="py-3">{new Date(user.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {activeTab === 'documents' && (
                <>
                  <div className="md:hidden space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="card !p-4">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-gray-900 break-words">{doc.title}</p>
                          <StatusBadge status={doc.status} />
                        </div>
                        <p className="text-sm text-gray-600 break-all mt-1">{doc.user_email}</p>
                        <p className="text-xs text-gray-400 mt-2">{new Date(doc.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="hidden md:block card overflow-x-auto">
                    <table className="w-full text-sm min-w-[500px]">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-3 font-medium text-gray-600">Title</th>
                          <th className="pb-3 font-medium text-gray-600">User</th>
                          <th className="pb-3 font-medium text-gray-600">Status</th>
                          <th className="pb-3 font-medium text-gray-600">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((doc) => (
                          <tr key={doc.id} className="border-b last:border-0">
                            <td className="py-3">{doc.title}</td>
                            <td className="py-3">{doc.user_email}</td>
                            <td className="py-3"><StatusBadge status={doc.status} /></td>
                            <td className="py-3">{new Date(doc.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {activeTab === 'audit' && (
                <>
                  <div className="md:hidden space-y-3">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="card !p-4">
                        <p className="font-medium text-gray-900">{log.action.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-gray-600 mt-1">{log.user_email || '—'}</p>
                        <p className="text-sm text-gray-500 break-words mt-1">{log.document_title || '—'}</p>
                        <p className="text-xs text-gray-400 mt-2">{new Date(log.created_at).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="hidden md:block card overflow-x-auto">
                    <table className="w-full text-sm min-w-[600px]">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-3 font-medium text-gray-600">Action</th>
                          <th className="pb-3 font-medium text-gray-600">User</th>
                          <th className="pb-3 font-medium text-gray-600">Document</th>
                          <th className="pb-3 font-medium text-gray-600">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="border-b last:border-0">
                            <td className="py-3">{log.action.replace(/_/g, ' ')}</td>
                            <td className="py-3">{log.user_email || '—'}</td>
                            <td className="py-3">{log.document_title || '—'}</td>
                            <td className="py-3">{new Date(log.created_at).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </ProtectedRoute>
    </ClientLayout>
  );
}
