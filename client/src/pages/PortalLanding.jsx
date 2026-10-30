import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthPage from './AuthPage';
import { ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

const PORTALS = [
  {
    role: 'donor',
    emoji: '🍛',
    label: 'Food Donor',
    subtitle: 'Canteens, Restaurants & Individuals',
    description: 'Post surplus food batches, set expiry timers, and watch NGOs pick them up in real-time.',
    color: '#10b981',
    colorBg: 'rgba(16, 185, 129, 0.12)',
    colorBorder: 'rgba(16, 185, 129, 0.3)',
    gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    features: ['Post food donations instantly', 'Live expiry countdown timers', 'Track pickup & delivery status'],
  },
  {
    role: 'ngo',
    emoji: '🤝',
    label: 'NGO / Volunteer',
    subtitle: 'Shelters, Volunteer Networks & Food Banks',
    description: 'Browse available food in Thane, claim batches, dispatch vehicles, and confirm distribution.',
    color: '#3b82f6',
    colorBg: 'rgba(59, 130, 246, 0.12)',
    colorBorder: 'rgba(59, 130, 246, 0.3)',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    features: ['Explore live food listings', 'One-click batch claiming', 'Manage pickup & delivery pipeline'],
  },
  {
    role: 'admin',
    emoji: '⚡',
    label: 'Admin / Faculty',
    subtitle: 'Supervisors & Platform Administrators',
    description: 'Full system oversight: inspect the SQLite database, audit all activity logs, and override donation statuses.',
    color: '#f59e0b',
    colorBg: 'rgba(245, 158, 11, 0.12)',
    colorBorder: 'rgba(245, 158, 11, 0.3)',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    features: ['Live SQLite database viewer', 'User & role management', 'Full activity audit logs'],
  }
];

export default function PortalLanding({ onPortalEnter }) {
  const { login } = useAuth();
  const [activePortal, setActivePortal] = useState(null); // which portal's login form is open
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);

  const openPortalLogin = (portal) => {
    setActivePortal(portal);
    setEmail('');
    setPassword('');
    setLoginError('');
    setShowPassword(false);
  };

  const closePortalLogin = () => {
    setActivePortal(null);
    setEmail('');
    setPassword('');
    setLoginError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoginLoading(true);
      setLoginError('');
      const user = await login(email.trim(), password, activePortal.role);
      onPortalEnter(user.role);
    } catch (err) {
      setLoginError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  if (showRegistration) {
    return (
      <div style={{ minHeight: '100vh', padding: '24px 20px 60px' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <button
            type="button"
            onClick={() => setShowRegistration(false)}
            className="btn btn-secondary btn-sm"
          >
            Back to sign in
          </button>
          <AuthPage startInRegisterMode />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px 60px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ maxWidth: '1100px', width: '100%', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          {/* Logo */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
              cursor: 'default'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#1f9d72',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                boxShadow: 'none'
              }}
            >
              🍱
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
                Food<span style={{ color: '#1f9d72' }}>Share</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.05em' }}>
                SURPLUS FOOD RESCUE PLATFORM
              </div>
            </div>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.7rem)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              marginBottom: '12px',
              lineHeight: 1.15,
              color: 'var(--text-main)'
            }}
          >
            Choose Your Portal
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
            FoodShare has dedicated workspaces for each role. Sign in to your portal to access your personalized dashboard.
          </p>
        </div>

        {/* Portal Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '36px'
          }}
        >
          {PORTALS.map((portal) => (
            <div
              key={portal.role}
              className="glass-panel"
              style={{
                padding: '24px',
                borderTop: `3px solid ${portal.color}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '20px',
                transition: 'transform 0.15s ease',
                cursor: 'default',
                background: '#ffffff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Portal Header */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '14px'
                  }}
                >
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '12px',
                      background: portal.colorBg,
                      border: `1px solid ${portal.colorBorder}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.6rem'
                    }}
                  >
                    {portal.emoji}
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      background: portal.colorBg,
                      color: portal.color,
                      border: `1px solid ${portal.colorBorder}`,
                      padding: '3px 10px',
                      borderRadius: '20px',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase'
                    }}
                  >
                    {portal.role}
                  </span>
                </div>

                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px' }}>{portal.label}</h2>
                <div style={{ fontSize: '0.8rem', color: portal.color, fontWeight: 600, marginBottom: '10px' }}>
                  {portal.subtitle}
                </div>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
                  {portal.description}
                </p>

                {/* Feature list */}
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {portal.features.map((feat) => (
                    <li
                      key={feat}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.82rem',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <span style={{ color: portal.color, fontWeight: 800, fontSize: '1rem' }}>✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div>
                <button
                  id={`portal-btn-${portal.role}`}
                  onClick={() => openPortalLogin(portal)}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    background: portal.color,
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'opacity 0.15s ease',
                    boxShadow: 'none'
                  }}
                >
                  <span>Sign In as {portal.label}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            type="button"
            onClick={() => setShowRegistration(true)}
            style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}
          >
            Create a donor or NGO account
          </button>
        </div>

        {/* Footer note */}
        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          FoodShare Platform • WMD Laboratory Project • Built by Kartik Mahindrakar (CSE AIML)
        </div>
      </div>

      {/* ── Login Modal Overlay ─────────────────────────────────────────── */}
      {activePortal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closePortalLogin(); }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '420px',
              padding: '32px',
              borderTop: `4px solid ${activePortal.color}`,
              position: 'relative'
            }}
          >
            {/* Close button */}
            <button
              onClick={closePortalLogin}
              aria-label="Close login form"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                fontSize: '1.2rem',
                cursor: 'pointer',
                lineHeight: 1,
                padding: '4px 8px',
                borderRadius: '6px'
              }}
            >
              ×
            </button>

            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: activePortal.colorBg,
                  border: `1px solid ${activePortal.colorBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  flexShrink: 0
                }}
              >
                {activePortal.emoji}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{activePortal.label} Sign In</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{activePortal.subtitle}</div>
              </div>
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {loginError && (
                <div
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: '#f87171',
                    fontSize: '0.84rem',
                    lineHeight: 1.5
                  }}
                >
                  ⚠️ {loginError}
                </div>
              )}

              <div>
                <label
                  htmlFor="portal-email"
                  style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}
                >
                  Email Address
                </label>
                <input
                  id="portal-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="form-input"
                  style={{ fontSize: '0.9rem', width: '100%' }}
                />
              </div>

              <div>
                <label
                  htmlFor="portal-password"
                  style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="portal-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-input"
                    style={{ fontSize: '0.9rem', width: '100%', paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-dim)',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                id={`login-submit-${activePortal.role}`}
                type="submit"
                disabled={loginLoading}
                style={{
                  width: '100%',
                  padding: '13px 20px',
                  borderRadius: '10px',
                  background: loginLoading ? activePortal.colorBg : activePortal.gradient,
                  color: loginLoading ? activePortal.color : '#fff',
                  border: loginLoading ? `1px solid ${activePortal.colorBorder}` : 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: loginLoading ? 'wait' : 'pointer',
                  boxShadow: loginLoading ? 'none' : `0 4px 16px ${activePortal.color}40`,
                  marginTop: '4px'
                }}
              >
                {loginLoading ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
