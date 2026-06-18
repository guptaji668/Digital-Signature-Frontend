'use client';

import { useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export default function SignaturePad({ onSave, onClear }) {
  const sigPadRef = useRef(null);

  const handleClear = () => {
    sigPadRef.current?.clear();
    onClear?.();
  };

  const handleSave = () => {
    if (sigPadRef.current?.isEmpty()) return;
    const dataUrl = sigPadRef.current.toDataURL('image/png');
    onSave?.(dataUrl);
  };

  useEffect(() => {
    const canvas = sigPadRef.current?.getCanvas();
    if (canvas) {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext('2d').scale(ratio, ratio);
      sigPadRef.current.clear();
    }
  }, []);

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white">
        <SignatureCanvas
          ref={sigPadRef}
          canvasProps={{
            className: 'w-full h-40 cursor-crosshair',
          }}
          penColor="#1e40af"
        />
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={handleClear} className="btn-secondary flex-1">
          Clear
        </button>
        <button type="button" onClick={handleSave} className="btn-primary flex-1">
          Use Signature
        </button>
      </div>
    </div>
  );
}
