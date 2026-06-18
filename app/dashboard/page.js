'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ClientLayout from '../../components/layout/ClientLayout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import StatusBadge from '../../components/ui/StatusBadge';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { api, ApiError } from '../../lib/api';

export default function DashboardPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [uploading, setUploading] = useState(false);

  const loadDocuments = async () => {
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await api.documents.list(params);
      setDocuments(res.data.documents);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [statusFilter]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.replace('.pdf', ''));
      const res = await api.documents.upload(formData);
      window.location.href = `/dashboard/documents/${res.data.id}/sign`;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.documents.delete(id);
      loadDocuments();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Delete failed');
    }
  };

  const handleDownload = async (id, type = 'signed') => {
    const token = localStorage.getItem('token');
    const url = `${process.env.NEXT_PUBLIC_API_URL}/documents/${id}/download?type=${type}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `document_${id}.pdf`;
    link.click();
  };

  return (
    <ClientLayout>
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
              <p className="text-sm text-gray-600 mt-1">Upload, sign, and manage your PDF documents</p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/signatures" className="btn-secondary">
                My Signatures
              </Link>
              <label className="btn-primary cursor-pointer">
                {uploading ? 'Uploading...' : 'Upload PDF'}
                <input type="file" accept=".pdf" onChange={handleUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          <Alert message={error} onClose={() => setError('')} />

          <div className="mb-6 flex gap-2">
            {['', 'draft', 'signed'].map((status) => (
              <button
                key={status || 'all'}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {status || 'All'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : documents.length === 0 ? (
            <div className="card text-center py-16">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">No documents yet</h3>
              <p className="text-sm text-gray-600 mt-1">Upload your first PDF to get started</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900 truncate">{doc.title}</h3>
                      <StatusBadge status={doc.status} />
                    </div>
                    <p className="text-sm text-gray-500 mt-1 truncate">{doc.original_filename}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Updated {new Date(doc.updated_at).toLocaleDateString()}
                      {doc.verification_code && (
                        <span className="ml-3 font-mono">Code: {doc.verification_code}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {doc.status === 'draft' && (
                      <Link href={`/dashboard/documents/${doc.id}/sign`} className="btn-primary text-sm">
                        Continue Signing
                      </Link>
                    )}
                    {doc.status === 'signed' && (
                      <>
                        <button onClick={() => handleDownload(doc.id, 'signed')} className="btn-primary text-sm">
                          Download
                        </button>
                        <Link href={`/dashboard/documents/${doc.id}`} className="btn-secondary text-sm">
                          View
                        </Link>
                      </>
                    )}
                    <button onClick={() => handleDelete(doc.id)} className="btn-danger text-sm">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ProtectedRoute>
    </ClientLayout>
  );
}
