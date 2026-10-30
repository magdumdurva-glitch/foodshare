import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  Search, 
  HeartHandshake, 
  ShieldCheck, 
  BarChart3, 
  PlusCircle, 
  LogOut, 
  ChevronDown, 
  Smartphone, 
  Monitor, 
  Home
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenAddDonation, isLanding = false }) {
  const { user, logout, viewMode, toggleViewMode } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const role = user?.role;
  const isDonor = role === 'donor';
  const isNgo = role === 'ngo';
  const isAdmin = role === 'admin';

  // Role visual styling
  const portalStyles = {
    donor: {
      badgeText: 'DONOR PORTAL',
      badgeBg: 'rgba(16, 185, 129, 0.15)',
      badgeColor: '#10b981',
      badgeBorder: 'rgba(16, 185, 129, 0.3)'
    },
    ngo: {
      badgeText: 'NGO PORTAL',
      badgeBg: 'rgba(59, 130, 246, 0.15)',
      badgeColor: '#3b82f6',
      badgeBorder: 'rgba(59, 130, 246, 0.3)'
    },
    admin: {
      badgeText: 'ADMIN CONSOLE',
      badgeBg: 'rgba(245, 158, 11, 0.15)',
      badgeColor: '#f59e0b',
      badgeBorder: 'rgba(245, 158, 11, 0.3)'
    }
  };

  const currentPortalStyle = role ? portalStyles[role] : {
    badgeText: 'PUBLIC VIEW',
    badgeBg: 'rgba(148, 163, 184, 0.15)',
    badgeColor: '#94a3b8',
    badgeBorder: 'rgba(148, 163, 184, 0.3)'
  };

  return (
    <nav className="glass-nav" style={{ padding: '0 20px', height: '68px', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        
        {/* Brand / Logo + Current Portal Segregation Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            onClick={() => !isLanding && setActiveTab('home')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: isLanding ? 'default' : 'pointer' }}
          >
            <div 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
              }}
            >
              🍱
            </div>
            <div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                Food<span style={{ color: '#10b981' }}>Share</span>
              </span>
            </div>
          </div>

          {/* Active Portal Badge (Strict Segregation Indicator) — hidden on landing */}
          {!isLanding && (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                background: currentPortalStyle.badgeBg,
                color: currentPortalStyle.badgeColor,
                border: `1px solid ${currentPortalStyle.badgeBorder}`,
                padding: '3px 8px',
                borderRadius: '6px',
                letterSpacing: '0.04em'
              }}
            >
              {currentPortalStyle.badgeText}
            </span>
          )}
        </div>

        {/* Center: Strictly segregated links based on active role — hidden on landing */}
        {!isLanding && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          
            <button
              onClick={() => setActiveTab('home')}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.88rem',
                color: activeTab === 'home' ? 'var(--primary)' : 'var(--text-muted)',
                background: activeTab === 'home' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Home size={15} />
              <span>Overview</span>
            </button>

            {/* DONOR SPECIFIC NAVIGATION */}
            {isDonor && (
              <>
                <button
                  onClick={() => setActiveTab('donor_dashboard')}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    color: activeTab === 'donor_dashboard' ? '#10b981' : 'var(--text-muted)',
                    background: activeTab === 'donor_dashboard' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Package size={15} />
                  <span>My Donations</span>
                </button>

                {onOpenAddDonation && (
                  <button
                    onClick={onOpenAddDonation}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <PlusCircle size={15} color="#10b981" />
                    <span>+ Post Food</span>
                  </button>
                )}
              </>
            )}

            {/* NGO SPECIFIC NAVIGATION */}
            {isNgo && (
              <>
                <button
                  onClick={() => setActiveTab('explore')}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    color: activeTab === 'explore' ? '#3b82f6' : 'var(--text-muted)',
                    background: activeTab === 'explore' ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Search size={15} />
                  <span>Find Available Food</span>
                </button>

                <button
                  onClick={() => setActiveTab('ngo_dashboard')}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    color: activeTab === 'ngo_dashboard' ? '#3b82f6' : 'var(--text-muted)',
                    background: activeTab === 'ngo_dashboard' ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <HeartHandshake size={15} />
                  <span>My Claims & Deliveries</span>
                </button>
              </>
            )}

            {/* ADMIN SPECIFIC NAVIGATION */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin_dashboard')}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  color: activeTab === 'admin_dashboard' ? '#f59e0b' : 'var(--text-muted)',
                  background: activeTab === 'admin_dashboard' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ShieldCheck size={15} />
                <span>Admin Console & Database</span>
              </button>
            )}

            {/* Universal Impact Page */}
            <button
              onClick={() => setActiveTab('impact')}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.88rem',
                color: activeTab === 'impact' ? 'var(--primary)' : 'var(--text-muted)',
                background: activeTab === 'impact' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <BarChart3 size={15} />
              <span>Impact</span>
            </button>
          </div>
        )}

        {/* Right side: Controls & Segregated Role Switcher Capsule */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {/* Mobile Simulator Frame toggle */}
          <button
            onClick={toggleViewMode}
            title={viewMode === 'responsive' ? 'Switch to Smartphone Device Frame' : 'Switch to Full Web View'}
            style={{
              background: viewMode === 'mobile_frame' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-surface-elevated)',
              color: viewMode === 'mobile_frame' ? '#60a5fa' : 'var(--text-muted)',
              border: `1px solid ${viewMode === 'mobile_frame' ? '#3b82f6' : 'var(--border-subtle)'}`,
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            {viewMode === 'mobile_frame' ? <Monitor size={14} /> : <Smartphone size={14} />}
            <span style={{ fontWeight: 600 }}>{viewMode === 'mobile_frame' ? 'Web' : 'Mobile'}</span>
          </button>

          {/* Integrated Role Switcher & Profile Dropdown */}
          {user && (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                padding: '5px 12px 5px 6px',
                borderRadius: '24px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div 
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isDonor ? '#10b981' : isNgo ? '#3b82f6' : isAdmin ? '#f59e0b' : '#64748b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800
                }}
              >
                {user ? user.name.charAt(0) : '?'}
              </div>

              <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {user ? user.name.split(' ')[0] : 'Guest'}
                </div>
                <div style={{ fontSize: '0.68rem', color: currentPortalStyle.badgeColor, fontWeight: 700, textTransform: 'capitalize' }}>
                  {user ? user.role : 'Select Role'}
                </div>
              </div>

              <ChevronDown size={14} style={{ color: 'var(--text-dim)', marginLeft: '2px' }} />
            </button>

            {/* Account actions */}
            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '44px',
                  right: 0,
                  width: '270px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '8px',
                  zIndex: 1000,
                  animation: 'fadeIn 0.15s ease'
                }}
              >
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', marginTop: '4px' }}>
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      color: 'var(--accent-rose)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          )}

        </div>

      </div>
    </nav>
  );
}
