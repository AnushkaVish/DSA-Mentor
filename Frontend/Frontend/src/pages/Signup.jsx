import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { registerUser } from '../authSlice';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, Shield } from 'lucide-react';

const signupSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Full name is required')
    .min(3, 'Must be at least 3 characters.'),
  emailId: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

function getStrength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  return s;
}

const STRENGTH_META = [
  { label: '', color: '#f87171', width: '0%' },
  { label: 'Weak', color: '#f87171', width: '25%' },
  { label: 'Fair', color: '#fb923c', width: '50%' },
  { label: 'Good', color: '#facc15', width: '75%' },
  { label: 'Strong', color: '#4ade80', width: '100%' },
];

function Particle({ style }) {
  return <div style={style} />;
}

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema), mode: 'onBlur' });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [particles] = useState(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      size: 3 + Math.random() * 6,
      left: Math.random() * 100,
      duration: 4 + Math.random() * 7,
      delay: Math.random() * 6,
    }))
  );

  const pwValue = watch('password', '');
  const strength = pwValue ? getStrength(pwValue) : 0;
  const sm = STRENGTH_META[strength];

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };

  return (
    <div style={styles.wrap}>
      <style>{keyframes}</style>

      <div style={styles.card}>
        {/* Particles */}
        {particles.map((p) => (
          <Particle
            key={p.id}
            style={{
              position: 'absolute',
              bottom: -20,
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: 'rgba(139,92,246,0.18)',
              animation: `floatUp ${p.duration}s ${p.delay}s linear infinite`,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Glow blob */}
        <div style={styles.glowBlob} />

        {/* Success overlay */}
        {success && (
          <div style={styles.successOverlay}>
            <div style={styles.checkCircle}>
              <CheckCircle size={36} color="#4ade80" strokeWidth={2} />
            </div>
            <p style={styles.successTitle}>Account created!</p>
            <p style={styles.successSub}>Welcome to DSA Mentor. Let's get coding.</p>
          </div>
        )}

        {/* Logo badge */}
        <div style={styles.logoWrap}>
          <div style={styles.badge}>
            <span style={styles.pulseDot} />
            DSA MENTOR
          </div>
          <h2 style={styles.heading}>Create your account</h2>
          <p style={styles.subheading}>Master DSA. Crack interviews. Get hired.</p>
        </div>

        {/* Error banner */}
        {error && (
          <div style={styles.errorBanner}>
            <Shield size={14} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form} noValidate>

          {/* Full Name */}
          <Field
            label="Full name"
            icon={<User size={16} />}
            error={errors.firstName?.message}
          >
            <input
              type="text"
              placeholder="Enter your full name"
              {...register('firstName')}
              style={inputStyle(!!errors.firstName)}
              autoComplete="name"
            />
          </Field>

          {/* Email */}
          <Field
            label="Email address"
            icon={<Mail size={16} />}
            error={errors.emailId?.message}
          >
            <input
              type="email"
              placeholder="you@example.com"
              {...register('emailId')}
              style={inputStyle(!!errors.emailId)}
              autoComplete="email"
            />
          </Field>

          {/* Password */}
          <Field
            label="Password"
            icon={<Lock size={16} />}
            error={errors.password?.message}
            toggle={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={styles.eyeBtn}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          >
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              {...register('password')}
              style={inputStyle(!!errors.password)}
              autoComplete="new-password"
            />
          </Field>

          {/* Strength bar */}
          {pwValue && (
            <div style={styles.strengthWrap}>
              <div style={styles.strengthTrack}>
                <div
                  style={{
                    ...styles.strengthFill,
                    width: sm.width,
                    background: sm.color,
                  }}
                />
              </div>
              <span style={{ ...styles.strengthLabel, color: sm.color }}>
                {sm.label}
              </span>
            </div>
          )}

          {/* Confirm Password */}
          <Field
            label="Confirm password"
            icon={<Lock size={16} />}
            error={errors.confirmPassword?.message}
            toggle={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                style={styles.eyeBtn}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          >
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              {...register('confirmPassword')}
              style={inputStyle(!!errors.confirmPassword)}
              autoComplete="new-password"
            />
          </Field>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
          >
            {loading && <span style={styles.spinner} />}
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <div style={styles.dividerLine} />
        </div>

        <p style={styles.footerTxt}>
          Already have an account?{' '}
          <NavLink to="/login" style={styles.link}>
            Log in
          </NavLink>
        </p>
      </div>
    </div>
  );
}

/* ── Field wrapper ── */
function Field({ label, icon, error, toggle, children }) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      style={styles.fieldWrap}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <label style={{ ...styles.label, color: focused ? '#a78bfa' : 'rgba(255,255,255,0.35)' }}>
        {label}
      </label>
      <div style={styles.inputRow}>
        <span style={{ ...styles.inputIcon, color: focused ? '#7c3aed' : 'rgba(255,255,255,0.22)' }}>
          {icon}
        </span>
        {children}
        {toggle}
      </div>
      {error && (
        <p style={styles.errMsg}>
          <span style={styles.errDot} />
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Styles ── */
const inputStyle = (hasError) => ({
  width: '100%',
  padding: '11px 40px 11px 40px',
  background: hasError ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.04)',
  border: `0.5px solid ${hasError ? 'rgba(239,68,68,0.45)' : 'rgba(255,255,255,0.1)'}`,
  borderRadius: 10,
  fontSize: 14,
  color: '#f0eeff',
  outline: 'none',
  caretColor: '#7c3aed',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
});

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0d0d14',
    padding: '2rem 1rem',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  card: {
    width: '100%',
    maxWidth: 440,
    background: '#13131f',
    border: '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: '2.5rem 2rem',
    position: 'relative',
    overflow: 'hidden',
  },
  glowBlob: {
    position: 'absolute',
    top: -80,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 280,
    height: 180,
    background: 'radial-gradient(ellipse, rgba(139,92,246,0.18) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  logoWrap: {
    textAlign: 'center',
    marginBottom: '1.75rem',
    position: 'relative',
    zIndex: 1,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(139,92,246,0.12)',
    border: '0.5px solid rgba(139,92,246,0.3)',
    borderRadius: 999,
    padding: '6px 16px',
    fontSize: 12,
    fontWeight: 500,
    color: '#a78bfa',
    letterSpacing: '0.08em',
    marginBottom: '1rem',
  },
  pulseDot: {
    display: 'inline-block',
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#7c3aed',
    animation: 'pulseDot 1.8s ease-in-out infinite',
  },
  heading: {
    fontSize: 22,
    fontWeight: 500,
    color: '#f0eeff',
    margin: '0 0 0.3rem',
  },
  subheading: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
    margin: 0,
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(239,68,68,0.1)',
    borderLeft: '3px solid rgba(239,68,68,0.6)',
    color: '#f87171',
    padding: '10px 12px',
    fontSize: 13,
    borderRadius: '0 8px 8px 0',
    marginBottom: '1rem',
  },
  form: {
    position: 'relative',
    zIndex: 1,
  },
  fieldWrap: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 6,
    transition: 'color 0.2s',
  },
  inputRow: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 13,
    transition: 'color 0.2s',
    pointerEvents: 'none',
    display: 'flex',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.25)',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    transition: 'color 0.2s',
  },
  errMsg: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    color: '#f87171',
    fontSize: 11,
    margin: '5px 0 0',
  },
  errDot: {
    display: 'inline-block',
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: '#f87171',
    flexShrink: 0,
  },
  strengthWrap: {
    marginTop: -10,
    marginBottom: '1.25rem',
  },
  strengthTrack: {
    height: 3,
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.35s ease, background 0.35s ease',
  },
  strengthLabel: {
    fontSize: 10,
    marginTop: 3,
    display: 'block',
    transition: 'color 0.3s',
  },
  submitBtn: {
    width: '100%',
    padding: '13px',
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    border: 'none',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 500,
    color: '#fff',
    cursor: 'pointer',
    marginTop: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    letterSpacing: '0.01em',
    transition: 'opacity 0.2s, transform 0.15s',
    position: 'relative',
    zIndex: 1,
  },
  spinner: {
    display: 'inline-block',
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    flexShrink: 0,
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '1.5rem 0 1.25rem',
    position: 'relative',
    zIndex: 1,
  },
  dividerLine: {
    flex: 1,
    height: '0.5px',
    background: 'rgba(255,255,255,0.08)',
  },
  dividerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.2)',
  },
  footerTxt: {
    textAlign: 'center',
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
    position: 'relative',
    zIndex: 1,
    margin: 0,
  },
  link: {
    color: '#a78bfa',
    textDecoration: 'none',
    fontWeight: 500,
  },
  successOverlay: {
    position: 'absolute',
    inset: 0,
    background: '#13131f',
    borderRadius: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    zIndex: 20,
    animation: 'fadeIn 0.3s ease',
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: 'rgba(34,197,94,0.1)',
    border: '1.5px solid rgba(34,197,94,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
  },
  successTitle: {
    color: '#f0eeff',
    fontSize: 18,
    fontWeight: 500,
    margin: 0,
  },
  successSub: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    margin: 0,
  },
};

const keyframes = `
  @keyframes floatUp {
    0%   { transform: translateY(0)   scale(1);   opacity: 0.6; }
    100% { transform: translateY(-130px) scale(0.2); opacity: 0; }
  }
  @keyframes pulseDot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.3; transform: scale(0.65); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes popIn {
    from { transform: scale(0); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  input:focus {
    border-color: rgba(139,92,246,0.6) !important;
    background: rgba(139,92,246,0.06) !important;
    box-shadow: 0 0 0 3px rgba(139,92,246,0.1) !important;
  }
  input::placeholder { color: rgba(255,255,255,0.18); }
`;

export default Signup;