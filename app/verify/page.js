'use client';

import { useState } from 'react';
import ClientLayout from '../../components/layout/ClientLayout';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { api, ApiError } from '../../lib/api';

export default function VerifyPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await api.verification.verify(code);
      setResult(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientLayout>
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Verify Document</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 px-2">
            Enter the verification code from a signed document to confirm its authenticity
          </p>
        </div>

        <div className="card">
          <Alert message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="code">Verification Code</label>
              <input
                id="code"
                type="text"
                className="input font-mono uppercase"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter 32-character code"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? <LoadingSpinner size="sm" /> : 'Verify Document'}
            </button>
          </form>

          {result && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-green-800">Document Verified</h3>
              </div>
              <dl className="space-y-3 text-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <dt className="text-gray-600">Title</dt>
                  <dd className="font-medium break-words sm:text-right">{result.document.title}</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <dt className="text-gray-600">File</dt>
                  <dd className="font-medium break-all sm:text-right">{result.document.originalFilename}</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <dt className="text-gray-600">Status</dt>
                  <dd className="font-medium capitalize sm:text-right">{result.document.status}</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <dt className="text-gray-600">Signed By</dt>
                  <dd className="font-medium sm:text-right">{result.document.signer.name}</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <dt className="text-gray-600">Signed At</dt>
                  <dd className="font-medium sm:text-right">{new Date(result.document.signedAt).toLocaleString()}</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <dt className="text-gray-600">Verification Code</dt>
                  <dd className="font-mono text-xs break-all sm:text-right">{result.document.verificationCode}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
