'use client';

import { useEffect, useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import LoadingSpinner from '../ui/LoadingSpinner';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SIG_WIDTH = 150;
const SIG_HEIGHT = 50;

function SignatureOverlay({ signatureImage, position, renderedSize, dashed = false }) {
  if (!signatureImage || !renderedSize.width) return null;

  const scale = renderedSize.width / renderedSize.pdfWidth;
  const width = SIG_WIDTH * scale;
  const height = SIG_HEIGHT * scale;
  const left = (position.x / 100) * renderedSize.width;
  const top = (position.y / 100) * renderedSize.height;

  return (
    <img
      src={signatureImage}
      alt="Signature"
      className={`absolute object-contain pointer-events-none ${dashed ? 'border-2 border-dashed border-primary-500 bg-primary-50/30' : 'opacity-90'}`}
      style={{ left, top, width, height }}
    />
  );
}

export default function PdfSigningPreview({
  documentId,
  pageNumber = 1,
  currentSignature,
  position,
  placedSignatures = [],
  onPositionChange,
  className = '',
}) {
  const [pdfData, setPdfData] = useState(null);
  const [renderedSize, setRenderedSize] = useState({ width: 0, height: 0, pdfWidth: 0, pdfHeight: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageWidth, setPageWidth] = useState(560);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const available = containerRef.current.clientWidth - 32;
        setPageWidth(Math.min(Math.max(available, 260), 560));
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [pdfData]);

  useEffect(() => {
    let objectUrl;

    async function loadPdf() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${API_URL}/documents/${documentId}/preview?type=original`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error('Failed to load PDF');
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setPdfData(objectUrl);
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
  }, [documentId]);

  const handlePageClick = (e) => {
    if (!onPositionChange || !renderedSize.width) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const scale = renderedSize.width / renderedSize.pdfWidth;
    const sigW = SIG_WIDTH * scale;
    const sigH = SIG_HEIGHT * scale;

    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;

    const maxX = 100 - (sigW / renderedSize.width) * 100;
    const maxY = 100 - (sigH / renderedSize.height) * 100;
    x = Math.max(0, Math.min(maxX, x));
    y = Math.max(0, Math.min(maxY, y));

    onPositionChange({ x: Math.round(x), y: Math.round(y) });
  };

  const pagePlaced = placedSignatures.filter((s) => s.page_number === pageNumber);

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
    <div className={`bg-gray-100 rounded-lg overflow-auto ${className}`} ref={containerRef}>
      <div className="p-3 bg-white border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm">
        <span className="text-gray-600">
          Viewing page <strong>{pageNumber}</strong>
          {currentSignature && (
            <span className="ml-0 sm:ml-2 text-primary-600 block sm:inline">— Live preview active</span>
          )}
        </span>
        {currentSignature && (
          <span className="text-xs text-gray-500">Tap on the page to position signature</span>
        )}
      </div>

      <div className="flex justify-center p-2 sm:p-4 min-h-[280px] sm:min-h-[500px]">
        <Document file={pdfData} loading={<LoadingSpinner />}>
          <div
            className="relative inline-block shadow-md cursor-crosshair max-w-full"
            onClick={handlePageClick}
            role="presentation"
          >
            <Page
              pageNumber={pageNumber}
              width={pageWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              onRenderSuccess={({ width, height, originalWidth, originalHeight }) => {
                setRenderedSize({ width, height, pdfWidth: originalWidth, pdfHeight: originalHeight });
              }}
            />

            {pagePlaced.map((sig) => (
              <SignatureOverlay
                key={sig.id}
                signatureImage={sig.signature_image}
                position={{ x: sig.position_x, y: sig.position_y }}
                renderedSize={renderedSize}
              />
            ))}

            {currentSignature && (
              <SignatureOverlay
                signatureImage={currentSignature}
                position={position}
                renderedSize={renderedSize}
                dashed
              />
            )}
          </div>
        </Document>
      </div>
    </div>
  );
}
