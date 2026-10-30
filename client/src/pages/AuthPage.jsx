import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

export default function AuthPage({ onSuccess, startInRegisterMode = false }) {
  const { login, register } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(!startInRegisterMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'donor',
    organization: '',
    phone: '',
    location: 'Thane West'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLoginMode) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '40px auto 80px', padding: '0 20px' }}>
      <div className="glass-panel" style={{ padding: '32px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              margin: '0 auto 12px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
            }}
          >
            🍱
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {isLoginMode ? 'Welcome to FoodShare' : 'Join FoodShare Network'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            {isLoginMode
              ? 'Log in to coordinate food donations and collections'
              : 'Create an account as a Food Donor or NGO Receiver'}
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fb7185',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLoginMode && (
            <>
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Kartik Mahindrakar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Role Selector */}
              <div className="form-group">
                <label className="form-label">I am joining as: *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'donor' })}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: formData.role === 'donor' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      background: formData.role === 'donor' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-surface)',
                      color: formData.role === 'donor' ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    🍛 Food Donor
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'ngo' })}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: formData.role === 'ngo' ? '2px solid #3b82f6' : '1px solid var(--border-subtle)',
                      background: formData.role === 'ngo' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-surface)',
                      color: formData.role === 'ngo' ? '#3b82f6' : 'var(--text-muted)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    🤝 NGO / Receiver
                  </button>
                </div>
              </div>

              {/* Organization */}
              <div className="form-group">
                <label className="form-label">
                  <span>Organization / Canteen Name</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Optional</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={formData.role === 'donor' ? 'e.g. APSIT Canteen / Cafe' : 'e.g. Thane Food Rescue Team'}
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                />
              </div>

              {/* Phone & Location */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City / Region</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Thane West"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-input"
              required
              placeholder="name@organization.org"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              className="form-input"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
          >
            {loading ? 'Authenticating...' : isLoginMode ? 'Sign In to Portal' : 'Create Account'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {isLoginMode ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsLoginMode(false)}
                style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setIsLoginMode(true)}
                style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
