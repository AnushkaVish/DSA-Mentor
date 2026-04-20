import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { Download, Award, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';
import axiosClient from '../utils/axiosClient';

const Certificate = ({
  userName: propUserName = 'Valued Student',
  courseName = 'Data Structures & Algorithms',
  date = 'April 03, 2026',
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [certId, setCertId] = useState(null);
  const [actualUserName, setActualUserName] = useState(propUserName);
  const [fontsReady, setFontsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrCreateCertificate = async () => {
      try {
        setIsLoading(true);
        const response = await axiosClient.post('/api/certificates/issue', {
          courseName
        });
        if (response.data) {
          setCertId(response.data.certId);
          setActualUserName(response.data.userName);
        }
      } catch (err) {
        console.error("Error fetching/issuing certificate:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrCreateCertificate();
  }, [courseName]);

  useEffect(() => {
    const id = 'cert-gfonts';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,900&family=Dancing+Script:wght@700&family=Montserrat:wght@400;600;700;900&display=swap';
      document.head.appendChild(link);
    }

    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  // ───────────────── DRAW CERTIFICATE ─────────────────
  const drawCertificate = async (ctx, W, H) => {
    if (!certId) return; // Don't draw without ID

  const C = {
    dark: '#0f172a',
    gold: '#d4af37',
    gray: '#475569',
    light: '#64748b',
    border: '#e2e8f0',
    bg: '#ffffff',
  };

  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  // ───── Border ─────
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 8;
  ctx.strokeRect(30, 30, W - 60, H - 60);

  ctx.strokeStyle = C.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(50, 50, W - 100, H - 100);

  // ───── ISO Badge (LEFT) ─────
  const isoX = 120;
  const isoY = 100;

  ctx.beginPath();
  ctx.arc(isoX, isoY, 40, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = C.dark;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = C.dark;
  ctx.font = '900 14px Montserrat';
  ctx.textAlign = 'center';
  ctx.fillText('ISO', isoX, isoY - 5);

  ctx.font = '700 9px Montserrat';
  ctx.fillText('9001:2015', isoX, isoY + 10);

  ctx.font = '700 8px Montserrat';
  ctx.fillStyle = C.light;
  ctx.fillText('CERTIFIED', isoX, isoY + 30);

  // ───── LOGO (CENTER TOP) ─────
  const centerX = W / 2;

  // DM Box Logo
  ctx.fillStyle = C.dark;
  ctx.fillRect(centerX - 170, 60, 50, 50);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 22px Montserrat';
  ctx.textAlign = 'center';
  ctx.fillText('DM', centerX - 145, 92);

  // Brand Name
  ctx.fillStyle = C.dark;
  ctx.font = '900 40px Montserrat';
  ctx.textAlign = 'left';
  ctx.fillText('DSA MENTOR', centerX - 100, 95);

  // Tagline line
  ctx.fillStyle = C.gold;
  ctx.fillRect(centerX - 100, 105, 200, 4);

  ctx.fillStyle = C.light;
  ctx.font = '600 12px Montserrat';
  ctx.textAlign = 'center';
  ctx.fillText('MASTERING DATA STRUCTURES & ALGORITHMS', centerX, 130);

  // ───── QR CODE & VERIFICATION ID (RIGHT TOP) ─────
  const qrX = W - 150;
  const qrY = 100;
  const verificationUrl = `${window.location.origin}/verify-certificate/${certId}`;
  
  try {
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, { margin: 1, width: 80 });
    const qrImg = new Image();
    await new Promise((resolve) => {
      qrImg.onload = resolve;
      qrImg.src = qrDataUrl;
    });
    ctx.drawImage(qrImg, qrX - 40, qrY - 40, 80, 80);
    
    ctx.fillStyle = C.light;
    ctx.font = '700 10px Montserrat';
    ctx.textAlign = 'center';
    ctx.fillText('VERIFY CERTIFICATE', qrX, qrY + 55);
    ctx.fillText(`ID: ${certId}`, qrX, qrY + 68);
  } catch (err) {
    console.error('QR Error:', err);
  }

  // ───── TITLE ─────
  ctx.fillStyle = C.dark;
  ctx.font = 'italic 900 60px Playfair Display';
  ctx.textAlign = 'center';
  ctx.fillText('Certificate of Completion', W / 2, 220);

  // ───── Subtitle ─────
  ctx.fillStyle = C.light;
  ctx.font = '600 16px Montserrat';
  ctx.fillText('This certificate is proudly presented to', W / 2, 260);

  // ───── Name ─────
  ctx.fillStyle = C.dark;
  ctx.font = '900 60px Montserrat';
  ctx.fillText(actualUserName, W / 2, 340);

  const nameWidth = ctx.measureText(actualUserName).width;
  ctx.fillStyle = C.gold;
  ctx.fillRect(W / 2 - nameWidth / 2, 355, nameWidth, 3);

  // ───── Paragraph ─────
  ctx.fillStyle = C.gray;
  ctx.font = '500 18px Montserrat';
  ctx.fillText(
    'has successfully completed the professional course',
    W / 2,
    400
  );

  // ───── Course Name ─────
  ctx.fillStyle = C.dark;
  ctx.font = '900 30px Montserrat';
  ctx.fillText(courseName.toUpperCase(), W / 2, 450);

  // ───── Award Text ─────
  ctx.fillStyle = C.light;
  ctx.font = 'italic 500 16px Montserrat';
  ctx.fillText(
    'Awarded for outstanding performance and successful completion',
    W / 2,
    490
  );
  ctx.fillText(
    'of all assessments and practical projects.',
    W / 2,
    515
  );

  // ───── Date ─────
  const displayDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  ctx.fillStyle = C.dark;
  ctx.font = '700 18px Montserrat';
  ctx.textAlign = 'center';
  ctx.fillText(displayDate, 180, H - 100);

  ctx.beginPath();
  ctx.moveTo(80, H - 85);
  ctx.lineTo(280, H - 85);
  ctx.stroke();

  ctx.fillStyle = C.light;
  ctx.font = '600 12px Montserrat';
  ctx.fillText('DATE', 180, H - 60);

  // ───── Signature ─────
  ctx.fillStyle = C.dark;
  ctx.font = 'italic 700 40px Dancing Script';
  ctx.fillText('Deepak Vishwakarma', W - 220, H - 100);

  ctx.beginPath();
  ctx.moveTo(W - 340, H - 85);
  ctx.lineTo(W - 100, H - 85);
  ctx.stroke();

  ctx.font = '900 14px Montserrat';
  ctx.fillText('DEEPAK VISHWAKARMA', W - 220, H - 60);

  ctx.fillStyle = C.light;
  ctx.font = '600 12px Montserrat';
  ctx.fillText('FOUNDER & CEO, DSA MENTOR', W - 220, H - 40);

  // ───── Watermark ─────
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.font = '900 300px Montserrat';
  ctx.fillStyle = C.dark;
  ctx.textAlign = 'center';
  ctx.fillText('DM', W / 2, H / 2 + 100);
  ctx.restore();
};

  // ───────────────── DOWNLOAD PDF ─────────────────
  const downloadCertificate = async () => {
    if (isGenerating || !certId) return;
    setIsGenerating(true);

    try {
      // Certificate is already issued/fetched on mount, so we just proceed to download
      
      // 2. Capture and download
      document.body.style.colorScheme = 'light';

      await document.fonts.ready;
      await new Promise((r) => setTimeout(r, 300));

      const W = 1123,
        H = 794;

      const canvas = document.createElement('canvas');
      canvas.width = W * 2;
      canvas.height = H * 2;

      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);

      await drawCertificate(ctx, W, H);

      const imgData = canvas.toDataURL('image/png', 1.0);

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [W, H],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, W, H, undefined, 'FAST');

      pdf.save(
        `${actualUserName.replace(/\s+/g, '_')}_DSA_Mentor_Certificate.pdf`
      );
    } catch (err) {
      console.error(err);
      alert('Download failed: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (certId && fontsReady) {
      const canvas = document.getElementById('certificate-canvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        drawCertificate(ctx, canvas.width, canvas.height);
      }
    }
  }, [certId, fontsReady, actualUserName]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="text-slate-400 font-medium">Preparing your certificate...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-white/10">
          <canvas
            id="certificate-canvas"
            width={800}
            height={600}
            className="w-full max-w-2xl h-auto"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={downloadCertificate}
          disabled={isGenerating || !certId}
          className="flex items-center justify-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isGenerating ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              GENERATING PDF...
            </div>
          ) : (
            <>
              <Download className="mr-3 group-hover:translate-y-1 transition-transform" />
              DOWNLOAD CERTIFICATE (PDF)
            </>
          )}
        </button>

        <button
          onClick={() => window.open(`/verify-certificate/${certId}`, '_blank')}
          className="flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all border border-white/20 backdrop-blur-sm"
        >
          <ShieldCheck className="mr-3" />
          VERIFY ONLINE
        </button>
      </div>

      <div className="flex items-center text-slate-500 text-sm">
        <Award size={16} className="mr-2 text-orange-500" />
        Verified Professional Certification • ID: {certId}
      </div>
    </div>
  );
};

export default Certificate;