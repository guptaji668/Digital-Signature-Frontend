'use client';

import { useState } from 'react';
import Link from 'next/link';
import ClientLayout from '../../components/layout/ClientLayout';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { api, ApiError } from '../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setResetUrl('');
    setLoading(true);
    try {
      const res = await api.auth.forgotPassword({ email });
      setMessage(res.data.message);
      if (res.data.resetUrl) setResetUrl(res.data.resetUrl);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientLayout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="card w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 text-center">Reset password</h1>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Enter your email and we&apos;ll send you a reset link
          </p>

          <Alert message={error} onClose={() => setError('')} />
          {message && <Alert type="success" message={message} />}

          {resetUrl && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
              <p className="font-medium text-yellow-800">Demo Mode — Reset Link:</p>
              <Link href={resetUrl.replace(/^https?:\/\/[^/]+/, '')} className="text-primary-600 break-all hover:underline">
                {resetUrl}
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? <LoadingSpinner size="sm" /> : 'Send Reset Link'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </ClientLayout>
  );
}
