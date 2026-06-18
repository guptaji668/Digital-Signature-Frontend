'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function PdfPreview({ documentId, type = 'original', className = '' }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let objectUrl;

    async function loadPdf() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${API_URL}/documents/${documentId}/preview?type=${type}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error('Failed to load PDF');
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (documentId) loadPdf();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [documentId, type]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-50 text-red-600 rounded-lg ${className}`}>
        {error}
      </div>
    );
  }

  return (
    <iframe
      src={pdfUrl}
      className={`w-full rounded-lg border border-gray-200 ${className}`}
      title="PDF Preview"
    />
  );
}
