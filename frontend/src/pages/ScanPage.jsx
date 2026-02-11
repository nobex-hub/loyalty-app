import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { scanReceipt } from '../services/api';

const hasBarcodeDetector = 'BarcodeDetector' in window;

// Helper: try detecting QR from canvas with given settings
const tryDetect = async (detector, canvas, ctx, bitmap, sx, sy, sw, sh, outW, outH, filter) => {
  canvas.width = outW;
  canvas.height = outH;
  ctx.filter = filter || 'none';
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, outW, outH);
  ctx.filter = 'none';
  const results = await detector.detect(canvas);
  return results.length > 0 ? results[0].rawValue : null;
};

// Native BarcodeDetector scan from image file (multi-strategy)
const scanWithNative = async (file) => {
  const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
  const bitmap = await createImageBitmap(file);
  const w = bitmap.width, h = bitmap.height;

  // 1. Try original size
  try {
    const results = await detector.detect(bitmap);
    if (results.length > 0) { bitmap.close(); return results[0].rawValue; }
  } catch {}

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // 2. Full image at different scales
  for (const maxSize of [1024, 640, 1600, 480]) {
    const s = Math.min(maxSize / w, maxSize / h);
    try {
      const val = await tryDetect(detector, canvas, ctx, bitmap, 0, 0, w, h, Math.round(w * s), Math.round(h * s));
      if (val) { bitmap.close(); return val; }
    } catch {}
  }

  // 3. Center crop (60% of image) at different scales — QR is usually centered
  const cx = Math.round(w * 0.2), cy = Math.round(h * 0.2);
  const cw = Math.round(w * 0.6), ch = Math.round(h * 0.6);
  for (const outSize of [800, 500, 1200]) {
    const s = Math.min(outSize / cw, outSize / ch);
    try {
      const val = await tryDetect(detector, canvas, ctx, bitmap, cx, cy, cw, ch, Math.round(cw * s), Math.round(ch * s));
      if (val) { bitmap.close(); return val; }
    } catch {}
  }

  // 4. Full image with contrast enhancement
  for (const maxSize of [1024, 640]) {
    const s = Math.min(maxSize / w, maxSize / h);
    try {
      const val = await tryDetect(detector, canvas, ctx, bitmap, 0, 0, w, h, Math.round(w * s), Math.round(h * s), 'contrast(1.5) brightness(1.1)');
      if (val) { bitmap.close(); return val; }
    } catch {}
  }

  // 5. Center crop with contrast
  for (const outSize of [800, 500]) {
    const s = Math.min(outSize / cw, outSize / ch);
    try {
      const val = await tryDetect(detector, canvas, ctx, bitmap, cx, cy, cw, ch, Math.round(cw * s), Math.round(ch * s), 'contrast(1.5) brightness(1.1)');
      if (val) { bitmap.close(); return val; }
    } catch {}
  }

  // 6. Grayscale + high contrast as last resort
  for (const filter of ['grayscale(1) contrast(2)', 'contrast(2) brightness(1.2)']) {
    const s = Math.min(1024 / w, 1024 / h);
    try {
      const val = await tryDetect(detector, canvas, ctx, bitmap, 0, 0, w, h, Math.round(w * s), Math.round(h * s), filter);
      if (val) { bitmap.close(); return val; }
    } catch {}
  }

  bitmap.close();
  throw new Error('No QR code found');
};

export default function ScanPage({ onNotify }) {
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handlePhotoScan = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setProcessing(true);

    try {
      let decodedText;
      if (hasBarcodeDetector) {
        try {
          decodedText = await scanWithNative(file);
        } catch {
          // Native failed at all scales, try html5-qrcode as last resort
          const { Html5Qrcode } = await import('html5-qrcode');
          const scanner = new Html5Qrcode('qr-photo-scanner');
          decodedText = await scanner.scanFile(file, true);
          scanner.clear();
        }
      } else {
        const { Html5Qrcode } = await import('html5-qrcode');
        const scanner = new Html5Qrcode('qr-photo-scanner');
        decodedText = await scanner.scanFile(file, true);
        scanner.clear();
      }
      await handleScan(decodedText);
    } catch (err) {
      setProcessing(false);
      onNotify('QR code not detected. Try a clearer, well-lit photo.', 'error');
      console.error('Photo scan error:', err);
    }
  };

  const handleScan = async (qrData) => {
    setProcessing(true);

    try {
      const result = await scanReceipt(qrData);
      onNotify(`+${result.totalPointsEarned} points earned!`);
      navigate('/scan/results', { state: { result } });
    } catch (err) {
      if (err.message.includes('already been scanned')) {
        onNotify('This receipt has already been scanned!', 'error');
      } else {
        onNotify(err.message || 'Failed to process receipt', 'error');
      }
    } finally {
      setProcessing(false);
    }
  };

  const [manualInput, setManualInput] = useState('');
  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      handleScan(manualInput.trim());
    }
  };

  return (
    <div className="scan-page">
      <h3 className="section-title">Scan Receipt</h3>

      {processing ? (
        <div className="loading">
          <p>Processing receipt...</p>
        </div>
      ) : (
        <>
          <div id="qr-photo-scanner" style={{ display: 'none' }}></div>

          <div className="scan-buttons">
            <button
              className="scan-button"
              onClick={() => fileInputRef.current?.click()}
            >
              📷 Scan QR Code
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoScan}
              style={{ display: 'none' }}
            />
          </div>

          <p className="scan-instructions">
            Take a photo of the QR code on your receipt
          </p>

          <div className="manual-input-section">
            <h3 className="section-title">Manual Input (Testing)</h3>
            <div className="form-group">
              <label>Paste QR URL or data</label>
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="https://suf.purs.gov.rs/v/?vl=..."
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={handleManualSubmit}
              disabled={!manualInput.trim()}
            >
              Submit QR Data
            </button>
          </div>
        </>
      )}
    </div>
  );
}
