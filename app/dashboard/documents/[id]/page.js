'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import ClientLayout from '../../../../components/layout/ClientLayout';
import ProtectedRoute from '../../../../components/auth/ProtectedRoute';
import PdfPreview from '../../../../components/documents/PdfPreview';
import StatusBadge from '../../../../components/ui/StatusBadge';
import Alert from '../../../../components/ui/Alert';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import { api, ApiError } from '../../../../lib/api';

function DocumentDetail() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [doc, setDoc] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const justSigned = searchParams.get('signed') === 'true';
  const verificationCode = searchParams.get('code');

  useEffect(() => {
    async function load() {
      try {
        const [docRes, auditRes] = await Promise.all([
          api.documents.get(id),
          api.verification.getAuditLogs(id),
        ]);
        setDoc(docRes.data);
        setAuditLogs(auditRes.data.logs);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load document');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleDownload = async (type = 'signed') => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const url = `${apiUrl}/documents/${id}/download?type=${type}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = doc.original_filename;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      setError('Failed to download PDF');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  }

  if (!doc) {
    return <Alert message="Document not found" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-primary-600 hover:text-primary-700">
          &larr; Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{doc.title}</h1>
          <StatusBadge status={doc.status} />
        </div>
      </div>

      <Alert message={error} onClose={() => setError('')} />

      {justSigned && verificationCode && (
        <Alert
          type="success"
          message={`Document signed successfully! Verification code: ${verificationCode}`}
        />
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-0 overflow-hidden">
            <PdfPreview
              documentId={id}
              type={doc.status === 'signed' ? 'signed' : 'original'}
              className="h-[50vh] sm:h-[500px] lg:h-[600px] min-h-[280px]"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Document Info</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <dt className="text-gray-600 shrink-0">File</dt>
                <dd className="font-medium break-all sm:text-right">{doc.original_filename}</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <dt className="text-gray-600">Pages</dt>
                <dd className="font-medium sm:text-right">{doc.page_count}</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <dt className="text-gray-600">Created</dt>
                <dd className="font-medium sm:text-right">{new Date(doc.created_at).toLocaleDateString()}</dd>
              </div>
              {doc.verification_code && (
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <dt className="text-gray-600">Verification Code</dt>
                  <dd className="font-mono text-xs break-all sm:text-right">{doc.verification_code}</dd>
                </div>
              )}
            </dl>

            <div className="mt-4 flex flex-col gap-2">
              {doc.status === 'draft' && (
                <Link href={`/dashboard/documents/${id}/sign`} className="btn-primary text-center">
                  Continue Signing
                </Link>
              )}
              {doc.status === 'signed' && (
                <button onClick={() => handleDownload('signed')} className="btn-primary">
                  Download Signed PDF
                </button>
              )}
              <button onClick={() => handleDownload('original')} className="btn-secondary">
                Download Original
              </button>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Activity Log</h2>
            {auditLogs.length === 0 ? (
              <p className="text-sm text-gray-500">No activity recorded</p>
            ) : (
              <ul className="space-y-3">
                {auditLogs.map((log) => (
                  <li key={log.id} className="text-sm border-l-2 border-primary-200 pl-3">
                    <p className="font-medium text-gray-900">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DocumentDetailPage() {
  return (
    <ClientLayout>
      <ProtectedRoute>
        <Suspense fallback={<div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>}>
          <DocumentDetail />
        </Suspense>
      </ProtectedRoute>
    </ClientLayout>
  );
}
