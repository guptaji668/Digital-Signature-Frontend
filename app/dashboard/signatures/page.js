'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ClientLayout from '../../../components/layout/ClientLayout';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import SignaturePad from '../../../components/signatures/SignaturePad';
import SignatureUpload from '../../../components/signatures/SignatureUpload';
import Alert from '../../../components/ui/Alert';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { api, ApiError } from '../../../lib/api';

export default function SignaturesPage() {
  const [signatures, setSignatures] = useState([]);
  const [name, setName] = useState('');
  const [signatureData, setSignatureData] = useState(null);
  const [signatureMode, setSignatureMode] = useState('draw');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadSignatures = async () => {
    try {
      const res = await api.signatures.list();
      setSignatures(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load signatures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSignatures();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!signatureData) {
      setError('Please draw or upload a signature');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.signatures.create({ name, signatureData });
      setName('');
      setSignatureData(null);
      setSuccess('Signature saved successfully');
      loadSignatures();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save signature');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this signature?')) return;
    try {
      await api.signatures.delete(id);
      loadSignatures();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Delete failed');
    }
  };

  return (
    <ClientLayout>
      <ProtectedRoute>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <Link href="/dashboard" className="text-sm text-primary-600 hover:text-primary-700">
              &larr; Back to Dashboard
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">My Signatures</h1>
            <p className="text-sm text-gray-600 mt-1">Save signatures for quick reuse when signing documents</p>
          </div>

          <Alert message={error} onClose={() => setError('')} />
          {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

          <div className="card mb-8">
            <h2 className="font-semibold text-gray-900 mb-4">Create New Signature</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label" htmlFor="name">Signature Name</label>
                <input
                  id="name"
                  type="text"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My Official Signature"
                  required
                />
              </div>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                {[
                  { id: 'draw', label: 'Draw' },
                  { id: 'upload', label: 'Upload' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setSignatureMode(tab.id);
                      setSignatureData(null);
                    }}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      signatureMode === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {signatureMode === 'draw' ? (
                <SignaturePad onSave={setSignatureData} onClear={() => setSignatureData(null)} />
              ) : (
                <SignatureUpload onUpload={setSignatureData} onClear={() => setSignatureData(null)} />
              )}

              {signatureData && (
                <div className="p-3 border rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500 mb-2">Preview</p>
                  <img src={signatureData} alt="Preview" className="h-16 mx-auto object-contain" />
                </div>
              )}
              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? 'Saving...' : 'Save Signature'}
              </button>
            </form>
          </div>

          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Saved Signatures</h2>
            {loading ? (
              <LoadingSpinner />
            ) : signatures.length === 0 ? (
              <p className="text-sm text-gray-500">No saved signatures yet</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {signatures.map((sig) => (
                  <div key={sig.id} className="border rounded-lg p-4">
                    <p className="font-medium text-gray-900 mb-2">{sig.name}</p>
                    <img src={sig.signature_data} alt={sig.name} className="h-16 mx-auto mb-3" />
                    <button onClick={() => handleDelete(sig.id)} className="btn-danger w-full text-sm">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ProtectedRoute>
    </ClientLayout>
  );
}
