'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ClientLayout from '../../../../../components/layout/ClientLayout';
import ProtectedRoute from '../../../../../components/auth/ProtectedRoute';
import SignaturePad from '../../../../../components/signatures/SignaturePad';
import SignatureUpload from '../../../../../components/signatures/SignatureUpload';
import Alert from '../../../../../components/ui/Alert';
import LoadingSpinner from '../../../../../components/ui/LoadingSpinner';
import { api, ApiError } from '../../../../../lib/api';

const PdfSigningPreview = dynamic(
  () => import('../../../../../components/documents/PdfSigningPreview'),
  { ssr: false, loading: () => <div className="h-[600px] flex items-center justify-center"><LoadingSpinner size="lg" /></div> }
);

export default function SignDocumentPage() {
  const { id } = useParams();
  const router = useRouter();
  const [document, setDocument] = useState(null);
  const [savedSignatures, setSavedSignatures] = useState([]);
  const [currentSignature, setCurrentSignature] = useState(null);
  const [selectedSaved, setSelectedSaved] = useState('');
  const [signatureMode, setSignatureMode] = useState('draw');
  const [pageNumber, setPageNumber] = useState(1);
  const [position, setPosition] = useState({ x: 10, y: 80 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [docRes, sigRes] = await Promise.all([
          api.documents.get(id),
          api.signatures.list(),
        ]);
        setDocument(docRes.data);
        setSavedSignatures(sigRes.data);
        if (docRes.data.status !== 'draft') {
          router.push(`/dashboard/documents/${id}`);
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load document');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  const handleSignatureSave = (dataUrl) => {
    setCurrentSignature(dataUrl);
    setSelectedSaved('');
  };

  const handleSignatureClear = () => {
    setCurrentSignature(null);
    setSelectedSaved('');
  };

  const handleSavedSignature = (sigId) => {
    if (!sigId) {
      setSelectedSaved('');
      setCurrentSignature(null);
      return;
    }
    const sig = savedSignatures.find((s) => s.id === sigId);
    if (sig) {
      setCurrentSignature(sig.signature_data);
      setSelectedSaved(sigId);
    }
  };

  const handleModeChange = (mode) => {
    setSignatureMode(mode);
    setSelectedSaved('');
    setCurrentSignature(null);
  };

  const handlePlaceSignature = async () => {
    if (!currentSignature) {
      setError('Please create, upload, or select a signature first');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api.documents.addSignature(id, {
        pageNumber,
        positionX: position.x,
        positionY: position.y,
        signatureImage: currentSignature,
        signatureId: selectedSaved || undefined,
        width: 150,
        height: 50,
      });
      const docRes = await api.documents.get(id);
      setDocument(docRes.data);
      setSuccess('Signature placed successfully');
      setCurrentSignature(null);
      setSelectedSaved('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to place signature');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!document?.signatures?.length) {
      setError('Place at least one signature before completing');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await api.documents.complete(id);
      router.push(`/dashboard/documents/${id}?signed=true&code=${res.data.verification_code}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to complete signing');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <ProtectedRoute>
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        </ProtectedRoute>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/dashboard" className="text-sm text-primary-600 hover:text-primary-700">
              &larr; Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">Sign: {document?.title}</h1>
          </div>

          <Alert message={error} onClose={() => setError('')} />
          {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="card p-0 overflow-hidden">
                <PdfSigningPreview
                  documentId={id}
                  pageNumber={pageNumber}
                  currentSignature={currentSignature}
                  position={position}
                  placedSignatures={document?.signatures || []}
                  onPositionChange={setPosition}
                  className="h-[600px]"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="card">
                <h2 className="font-semibold text-gray-900 mb-4">Create Signature</h2>

                {savedSignatures.length > 0 && (
                  <div className="mb-4">
                    <label className="label">Use Saved Signature</label>
                    <select
                      className="input"
                      value={selectedSaved}
                      onChange={(e) => handleSavedSignature(e.target.value)}
                    >
                      <option value="">Create new signature</option>
                      {savedSignatures.map((sig) => (
                        <option key={sig.id} value={sig.id}>{sig.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {!selectedSaved && (
                  <>
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-4">
                      {[
                        { id: 'draw', label: 'Draw' },
                        { id: 'upload', label: 'Upload' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => handleModeChange(tab.id)}
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
                      <SignaturePad onSave={handleSignatureSave} onClear={handleSignatureClear} />
                    ) : (
                      <SignatureUpload onUpload={handleSignatureSave} onClear={handleSignatureClear} />
                    )}
                  </>
                )}

                {currentSignature && (
                  <div className="mt-4 p-3 border rounded-lg bg-gray-50">
                    <p className="text-xs text-gray-500 mb-2">Selected signature</p>
                    <img src={currentSignature} alt="Signature preview" className="h-16 mx-auto object-contain" />
                  </div>
                )}
              </div>

              <div className="card">
                <h2 className="font-semibold text-gray-900 mb-4">Placement</h2>
                <div className="space-y-3">
                  <div>
                    <label className="label">Page Number</label>
                    <input
                      type="number"
                      className="input"
                      min={1}
                      max={document?.page_count || 1}
                      value={pageNumber}
                      onChange={(e) => setPageNumber(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Preview updates for the selected page</p>
                  </div>
                  <div>
                    <label className="label">Horizontal Position ({position.x}%)</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={position.x}
                      onChange={(e) => setPosition({ ...position, x: parseInt(e.target.value, 10) })}
                      className="w-full accent-primary-600"
                    />
                  </div>
                  <div>
                    <label className="label">Vertical Position ({position.y}%)</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={position.y}
                      onChange={(e) => setPosition({ ...position, y: parseInt(e.target.value, 10) })}
                      className="w-full accent-primary-600"
                    />
                  </div>
                  <button
                    onClick={handlePlaceSignature}
                    disabled={submitting || !currentSignature}
                    className="btn-primary w-full"
                  >
                    Place Signature
                  </button>
                </div>
              </div>

              {document?.signatures?.length > 0 && (
                <div className="card">
                  <h2 className="font-semibold text-gray-900 mb-2">
                    Placed Signatures ({document.signatures.length})
                  </h2>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {document.signatures.map((sig, i) => (
                      <li key={sig.id}>Signature {i + 1} — Page {sig.page_number}</li>
                    ))}
                  </ul>
                  <button
                    onClick={handleComplete}
                    disabled={submitting}
                    className="btn-primary w-full mt-4"
                  >
                    {submitting ? 'Processing...' : 'Complete Signing'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </ClientLayout>
  );
}
