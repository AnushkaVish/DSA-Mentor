import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../utils/axiosClient';
import { ShieldCheck, XCircle, Award, Calendar, User, BookOpen, ExternalLink, Loader2 } from 'lucide-react';

/* ─── Keyframe injection ─────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');

  :root {
    --bg: #0a0e1a;
    --surface: #0f1526;
    --surface2: #161d35;
    --border: #1e2a47;
    --accent: #f89820;
    --accent2: #00d4aa;
    --red: #ff4d6d;
    --text: #e2e8f0;
    --muted: #64748b;
    --glow-amber: 0 0 20px rgba(248,152,32,0.3), 0 0 60px rgba(248,152,32,0.1);
    --glow-green: 0 0 20px rgba(0,212,170,0.3), 0 0 60px rgba(0,212,170,0.1);
    --glow-red: 0 0 20px rgba(255,77,109,0.3);
  }

  @keyframes scanline {
    0%   { transform: translateY(-100%); opacity: 0; }
    20%  { opacity: 1; }
    80%  { opacity: 1; }
    100% { transform: translateY(100vh); opacity: 0; }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(0.9); opacity: 1; }
    100% { transform: scale(1.6); opacity: 0; }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes glitch {
    0%,100% { clip-path: inset(0 0 100% 0); }
    20%      { clip-path: inset(15% 0 60% 0); transform: translateX(-3px); }
    40%      { clip-path: inset(50% 0 20% 0); transform: translateX(3px); }
    60%      { clip-path: inset(70% 0 5% 0); transform: translateX(-2px); }
    80%      { clip-path: inset(30% 0 40% 0); transform: translateX(2px); }
  }
  @keyframes borderGlow {
    0%,100% { border-color: var(--accent2); box-shadow: var(--glow-green); }
    50%      { border-color: #00ffcc; box-shadow: 0 0 30px rgba(0,255,204,0.5), 0 0 80px rgba(0,212,170,0.2); }
  }
  @keyframes spin-slow {
    to { transform: rotate(360deg); }
  }
  @keyframes float {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-8px); }
  }
  @keyframes count-in {
    from { opacity:0; transform: scale(0.5) rotate(-10deg); }
    to   { opacity:1; transform: scale(1) rotate(0deg); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  .vc-wrap * { box-sizing: border-box; font-family: 'JetBrains Mono', monospace; }

  .vc-wrap {
    min-height: 100vh;
    background: var(--bg);
    padding: 56px 16px;
    position: relative;
    overflow: hidden;
  }
  .vc-wrap::before {
    content: '';
    position: fixed; inset: 0;
    background: 
      linear-gradient(rgba(248,152,32,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(248,152,32,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  .scanline {
    position: fixed; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, var(--accent2), transparent);
    animation: scanline 6s ease-in-out infinite;
    pointer-events: none; z-index: 50;
  }

  .vc-inner { max-width: 760px; margin: 0 auto; position: relative; z-index: 1; }

  /* Header */
  .vc-header { text-align: center; margin-bottom: 56px; }
  .vc-icon-wrap {
    position: relative; display: inline-block; margin-bottom: 20px;
    animation: float 4s ease-in-out infinite;
  }
  .vc-icon-wrap::before, .vc-icon-wrap::after {
    content: ''; position: absolute; inset: -4px;
    border-radius: 50%; border: 2px solid var(--accent);
    opacity: 0;
  }
  .vc-icon-wrap::before { animation: pulse-ring 2.5s ease-out infinite; }
  .vc-icon-wrap::after  { animation: pulse-ring 2.5s ease-out 1.2s infinite; }
  .vc-icon-bg {
    width: 80px; height: 80px;
    background: linear-gradient(135deg, #1a1f35, #0f1526);
    border: 2px solid var(--accent);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    box-shadow: var(--glow-amber);
  }
  .vc-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(28px, 5vw, 44px);
    font-weight: 800;
    color: var(--text);
    letter-spacing: -1px;
    margin: 0 0 8px;
  }
  .vc-title span {
    background: linear-gradient(90deg, var(--accent), var(--accent2), var(--accent));
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }
  .vc-subtitle { color: var(--muted); font-size: 14px; margin: 0; letter-spacing: 0.05em; }

  /* Badge row */
  .vc-badges { display: flex; gap: 8px; justify-content: center; margin-top: 16px; }
  .vc-badge {
    padding: 4px 12px; border-radius: 999px; font-size: 11px;
    font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
    border: 1px solid;
  }
  .vc-badge-amber { border-color: var(--accent); color: var(--accent); background: rgba(248,152,32,0.08); }
  .vc-badge-green { border-color: var(--accent2); color: var(--accent2); background: rgba(0,212,170,0.08); }

  /* Search Box */
  .vc-search-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 32px;
    animation: fadeSlideUp 0.5s ease both;
  }
  .vc-search-row { display: flex; gap: 12px; flex-wrap: wrap; }
  .vc-input-wrap { flex: 1; min-width: 200px; position: relative; }
  .vc-input-label {
    display: block; font-size: 10px; font-weight: 700;
    color: var(--accent); letter-spacing: 0.15em; text-transform: uppercase;
    margin-bottom: 8px;
  }
  .vc-input {
    width: 100%; padding: 14px 16px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    font-family: 'JetBrains Mono', monospace;
    font-size: 15px;
    font-weight: 700;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .vc-input::placeholder { color: var(--muted); font-weight: 400; }
  .vc-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(248,152,32,0.12);
  }
  .vc-btn {
    align-self: flex-end;
    padding: 14px 28px;
    background: var(--accent);
    color: #0a0e1a;
    border: none; border-radius: 10px;
    font-family: 'Syne', sans-serif;
    font-size: 14px; font-weight: 800;
    letter-spacing: 0.05em; text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(248,152,32,0.3);
    display: flex; align-items: center; gap-8px;
    white-space: nowrap;
  }
  .vc-btn:hover:not(:disabled) {
    background: #ffa840;
    box-shadow: 0 6px 30px rgba(248,152,32,0.45);
    transform: translateY(-1px);
  }
  .vc-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }
  .vc-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .vc-btn svg { animation: spin-slow 1s linear infinite; }

  /* Loading */
  .vc-loading {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 80px 24px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px;
    animation: fadeSlideUp 0.4s ease both;
  }
  .vc-loading-ring {
    width: 64px; height: 64px; position: relative; margin-bottom: 24px;
  }
  .vc-loading-ring::before {
    content: ''; position: absolute; inset: 0;
    border: 3px solid var(--border); border-radius: 50%;
  }
  .vc-loading-ring::after {
    content: ''; position: absolute; inset: 0;
    border: 3px solid transparent;
    border-top-color: var(--accent2);
    border-radius: 50%;
    animation: spin-slow 0.8s linear infinite;
  }
  .vc-loading p { color: var(--accent2); font-size: 13px; font-weight: 700; letter-spacing: 0.15em; margin: 0; }
  .vc-loading small { color: var(--muted); font-size: 11px; margin-top: 4px; }

  /* Error */
  .vc-error {
    background: var(--surface);
    border: 1px solid rgba(255,77,109,0.3);
    border-radius: 16px;
    padding: 56px 32px;
    text-align: center;
    animation: fadeSlideUp 0.4s ease both;
  }
  .vc-error-icon {
    width: 72px; height: 72px;
    background: rgba(255,77,109,0.1);
    border: 2px solid rgba(255,77,109,0.3);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px;
  }
  .vc-error h2 {
    font-family: 'Syne', sans-serif;
    color: var(--red); font-size: 22px; font-weight: 800; margin: 0 0 8px;
    letter-spacing: -0.5px;
  }
  .vc-error p { color: var(--muted); font-size: 14px; margin: 0 auto 28px; max-width: 360px; line-height: 1.6; }
  .vc-error-code {
    display: inline-block;
    padding: 8px 20px;
    background: rgba(255,77,109,0.08);
    border: 1px solid rgba(255,77,109,0.2);
    border-radius: 8px;
    font-size: 12px; color: var(--red);
    letter-spacing: 0.1em; text-transform: uppercase;
    margin-bottom: 28px;
  }
  .vc-error-btn {
    padding: 12px 28px;
    background: transparent;
    border: 1px solid rgba(255,77,109,0.4);
    color: var(--red);
    border-radius: 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px; font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }
  .vc-error-btn:hover { background: rgba(255,77,109,0.1); border-color: var(--red); }

  /* Success Card */
  .vc-success {
    border-radius: 16px; overflow: hidden;
    border: 1px solid var(--accent2);
    animation: fadeSlideUp 0.5s ease both, borderGlow 3s ease infinite;
  }
  .vc-success-header {
    background: linear-gradient(135deg, #0d2e26, #0a2020);
    padding: 20px 28px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid rgba(0,212,170,0.2);
  }
  .vc-success-status { display: flex; align-items: center; gap: 10px; }
  .vc-status-dot {
    width: 10px; height: 10px; border-radius: 50%;
    background: var(--accent2);
    box-shadow: 0 0 10px var(--accent2);
    position: relative;
  }
  .vc-status-dot::before {
    content: ''; position: absolute; inset: -4px;
    border-radius: 50%; border: 1.5px solid var(--accent2);
    animation: pulse-ring 2s ease-out infinite; opacity: 0;
  }
  .vc-status-text {
    font-family: 'Syne', sans-serif;
    font-size: 16px; font-weight: 800;
    color: var(--accent2);
    letter-spacing: 0.05em; text-transform: uppercase;
  }
  .vc-success-hash {
    font-size: 11px; color: rgba(0,212,170,0.5); letter-spacing: 0.1em;
  }

  /* Certificate body */
  .vc-cert-body {
    background: var(--surface);
    padding: 40px 32px;
  }
  .vc-cert-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
  }
  @media (max-width: 560px) { .vc-cert-grid { grid-template-columns: 1fr; } }

  .vc-field {
    padding: 20px;
    border-bottom: 1px solid var(--border);
    border-right: 1px solid var(--border);
    animation: fadeSlideUp 0.5s ease both;
  }
  .vc-field:nth-child(2n) { border-right: none; }
  .vc-field:nth-last-child(-n+2) { border-bottom: none; }
  @media (max-width: 560px) {
    .vc-field { border-right: none; }
    .vc-field:nth-last-child(1) { border-bottom: none; }
    .vc-field:nth-last-child(2) { border-bottom: 1px solid var(--border); }
  }

  .vc-field-label {
    display: flex; align-items: center; gap: 6px;
    font-size: 10px; font-weight: 700; color: var(--muted);
    letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 8px;
  }
  .vc-field-label svg { width: 12px; height: 12px; }
  .vc-field-val {
    font-family: 'Syne', sans-serif;
    font-size: 20px; font-weight: 800;
    color: var(--text); line-height: 1.2;
  }
  .vc-field-val.accent { color: var(--accent); }
  .vc-field-val.green  { color: var(--accent2); font-size: 15px; letter-spacing: 0.05em; }

  /* Footer */
  .vc-cert-footer {
    background: var(--surface2);
    border-top: 1px solid var(--border);
    padding: 20px 32px;
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 12px;
  }
  .vc-brand { display: flex; align-items: center; gap: 12px; }
  .vc-brand-logo {
    width: 40px; height: 40px;
    background: var(--accent);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 800;
    color: #0a0e1a;
    letter-spacing: -0.5px;
  }
  .vc-brand-name {
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 800; color: var(--text);
  }
  .vc-brand-sub { font-size: 11px; color: var(--muted); margin-top: 1px; }
  .vc-ext-link {
    display: flex; align-items: center; gap: 6px;
    color: var(--accent2); font-size: 13px; font-weight: 700;
    text-decoration: none;
    transition: color 0.2s, gap 0.2s;
  }
  .vc-ext-link:hover { color: #00ffcc; gap: 10px; }

  /* Empty State */
  .vc-empty {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 80px 32px; text-align: center;
    animation: fadeSlideUp 0.5s ease both;
  }
  .vc-empty-icon {
    margin: 0 auto 24px;
    width: 96px; height: 96px;
    background: var(--surface2);
    border: 2px dashed var(--border);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
  }
  .vc-empty h2 {
    font-family: 'Syne', sans-serif;
    font-size: 22px; font-weight: 800; color: var(--text); margin: 0 0 8px;
  }
  .vc-empty p { color: var(--muted); font-size: 14px; line-height: 1.6; max-width: 340px; margin: 0 auto; }

  /* Steps */
  .vc-steps { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-top: 28px; }
  .vc-step {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 16px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 99px; font-size: 12px; color: var(--muted);
  }
  .vc-step-num {
    width: 20px; height: 20px; border-radius: 50%;
    background: var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; color: var(--accent);
  }
`;

const VerifyCertificate = () => {
    const { certId } = useParams();
    const [loading, setLoading] = useState(!!certId);
    const [certificate, setCertificate] = useState(null);
    const [error, setError] = useState(null);
    const [searchId, setSearchId] = useState('');
    const styleRef = useRef(null);

    useEffect(() => {
        if (!styleRef.current) {
            const el = document.createElement('style');
            el.textContent = STYLES;
            document.head.appendChild(el);
            styleRef.current = el;
        }
        return () => { if (styleRef.current) { styleRef.current.remove(); styleRef.current = null; } };
    }, []);

    useEffect(() => { if (certId) handleVerify(certId); }, [certId]);

    const handleVerify = async (id) => {
        if (!id) return;
        setLoading(true); setError(null); setCertificate(null);
        try {
            const response = await axiosClient.get(`/api/certificates/verify/${id}`);
            setCertificate(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Certificate not found. Please check the ID and try again.');
        } finally {
            setLoading(false);
        }
    };

    const onSearchSubmit = (e) => {
        e.preventDefault();
        if (searchId.trim()) handleVerify(searchId.trim());
    };

    const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const hashId = certificate?.certId ? `0x${certificate.certId.replace(/\D/g,'').padStart(8,'0')}` : '';

    return (
        <div className="vc-wrap">
            <div className="scanline" />
            <div className="vc-inner">

                {/* Header */}
                <div className="vc-header">
                    <div className="vc-icon-wrap">
                        <div className="vc-icon-bg">
                            <ShieldCheck size={36} color="var(--accent)" strokeWidth={1.5} />
                        </div>
                    </div>
                    <h1 className="vc-title">
                        Verify <span>Certificate</span>
                    </h1>
                    <p className="vc-subtitle">// DSA MENTOR — Credential Authentication System</p>
                    <div className="vc-badges">
                        <span className="vc-badge vc-badge-amber">SHA-256 Secured</span>
                        <span className="vc-badge vc-badge-green">● Live Verification</span>
                    </div>
                </div>

                {/* Search */}
                <div className="vc-search-card">
                    <form onSubmit={onSearchSubmit} className="vc-search-row">
                        <div className="vc-input-wrap">
                            <label className="vc-input-label">Certificate ID</label>
                            <input
                                type="text"
                                className="vc-input"
                                placeholder="DM-123456"
                                value={searchId}
                                onChange={e => setSearchId(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="vc-btn" disabled={loading} style={{ marginTop: '26px' }}>
                            {loading
                                ? <><Loader2 size={16} />&nbsp;Scanning...</>
                                : '→ Verify'
                            }
                        </button>
                    </form>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="vc-loading">
                        <div className="vc-loading-ring" />
                        <p>AUTHENTICATING CREDENTIAL</p>
                        <small>Cross-referencing certificate database...</small>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="vc-error">
                        <div className="vc-error-icon">
                            <XCircle size={36} color="var(--red)" />
                        </div>
                        <h2>Verification Failed</h2>
                        <div className="vc-error-code">ERR_CERT_NOT_FOUND</div>
                        <p>{error}</p>
                        <button className="vc-error-btn" onClick={() => { setError(null); setSearchId(''); }}>
                            ← Try Another ID
                        </button>
                    </div>
                )}

                {/* Success */}
                {!loading && certificate && (
                    <div className="vc-success">
                        <div className="vc-success-header">
                            <div className="vc-success-status">
                                <div className="vc-status-dot" />
                                <span className="vc-status-text">Verified Authentic</span>
                            </div>
                            <span className="vc-success-hash">{hashId}</span>
                        </div>

                        <div className="vc-cert-body">
                            <div className="vc-cert-grid">
                                <div className="vc-field" style={{ animationDelay: '0.05s' }}>
                                    <div className="vc-field-label"><User size={12} color="var(--muted)" /> Recipient</div>
                                    <div className="vc-field-val">{certificate.userName}</div>
                                </div>
                                <div className="vc-field" style={{ animationDelay: '0.1s' }}>
                                    <div className="vc-field-label"><Award size={12} color="var(--muted)" /> Certificate ID</div>
                                    <div className="vc-field-val accent">{certificate.certId}</div>
                                </div>
                                <div className="vc-field" style={{ animationDelay: '0.15s' }}>
                                    <div className="vc-field-label"><BookOpen size={12} color="var(--muted)" /> Course Completed</div>
                                    <div className="vc-field-val">{certificate.courseName}</div>
                                </div>
                                <div className="vc-field" style={{ animationDelay: '0.2s' }}>
                                    <div className="vc-field-label"><Calendar size={12} color="var(--muted)" /> Issue Date</div>
                                    <div className="vc-field-val">{fmtDate(certificate.issueDate)}</div>
                                </div>
                            </div>
                        </div>

                        <div className="vc-cert-footer">
                            <div className="vc-brand">
                                <div className="vc-brand-logo">DM</div>
                                <div>
                                    <div className="vc-brand-name">DSA MENTOR</div>
                                    <div className="vc-brand-sub">Professional Certification Authority</div>
                                </div>
                            </div>
                            <Link to="/" className="vc-ext-link">
                                dsa-mentor.com <ExternalLink size={13} />
                            </Link>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !certificate && !error && !certId && (
                    <div className="vc-empty">
                        <div className="vc-empty-icon">
                            <Award size={48} color="var(--border)" />
                        </div>
                        <h2>Ready to Authenticate</h2>
                        <p>Enter the Certificate ID from the bottom-right corner of your DSA Mentor certificate.</p>
                        <div className="vc-steps">
                            <div className="vc-step"><div className="vc-step-num">1</div>Locate your certificate</div>
                            <div className="vc-step"><div className="vc-step-num">2</div>Find ID (e.g. DM-123456)</div>
                            <div className="vc-step"><div className="vc-step-num">3</div>Enter &amp; verify</div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default VerifyCertificate;