import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import PortalLanding from './pages/PortalLanding';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import DonorDashboard from './pages/DonorDashboard';
import NgoDashboard from './pages/NgoDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ImpactPage from './pages/ImpactPage';

import AddDonationModal from './components/AddDonationModal';
import ClaimModal from './components/ClaimModal';
import DonationDetailsModal from './components/DonationDetailsModal';
import { claimsApi } from './api';

// ─── Role-based default tabs ────────────────────────────────────────
const ROLE_DEFAULT_TAB = {
  donor: 'donor_dashboard',
  ngo: 'ngo_dashboard',
  admin: 'admin_dashboard'
};

// ─── Which tabs each role is ALLOWED to access ───────────────────────
const ROLE_ALLOWED_TABS = {
  donor: ['home', 'donor_dashboard', 'impact'],
  ngo: ['home', 'explore', 'ngo_dashboard', 'impact'],
  admin: ['home', 'admin_dashboard', 'impact']
};

// ─── Access Denied screen ────────────────────────────────────────────
function AccessDenied({ role, onGoBack }) {
  const roleLabel = role === 'donor' ? 'Donor' : role === 'ngo' ? 'NGO' : 'Admin';
  return (
    <div
      style={{
        maxWidth: '500px',
        margin: '80px auto',
        padding: '40px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '14px'
      }}
    >
      <div style={{ fontSize: '3rem' }}>🔒</div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Access Restricted</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
        This section is not available in your <strong>{roleLabel} Portal</strong>.
        Each workspace is strictly segregated to show only what is relevant to your role.
      </p>
      <button onClick={onGoBack} className="btn btn-primary" style={{ marginTop: '8px' }}>
        ← Return to My Dashboard
      </button>
    </div>
  );
}

// ─── Main application ────────────────────────────────────────────────
function MainApp() {
  const { user, loading, viewMode } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [claimModalData, setClaimModalData] = useState(null);
  const [detailsDonationId, setDetailsDonationId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // When user logs in or changes, redirect to their default dashboard
  useEffect(() => {
    if (user) {
      const defaultTab = ROLE_DEFAULT_TAB[user.role] || 'home';
      setActiveTab(defaultTab);
    }
  }, [user?.email]);

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Safe tab setter — enforces role-based access
  const safeSetTab = (tab) => {
    if (!user) {
      // Not logged in — only home is allowed
      setActiveTab('home');
      return;
    }
    const allowed = ROLE_ALLOWED_TABS[user.role] || ['home'];
    if (allowed.includes(tab)) {
      setActiveTab(tab);
    } else {
      // Redirect to role's default if trying to access a restricted tab
      setActiveTab(ROLE_DEFAULT_TAB[user.role] || 'home');
    }
  };

  const handleOpenClaim = (donation) => {
    if (!user || user.role !== 'ngo') {
      showToast('Only NGO accounts can claim food donations.', 'error');
      return;
    }
    setClaimModalData(donation);
  };

  const handleViewDetails = (donation) => {
    setDetailsDonationId(donation.id);
  };

  const handleUpdateStatus = async (claimId, newStatus) => {
    try {
      await claimsApi.updateStatus(claimId, newStatus);
      showToast(
        newStatus === 'picked_up' ? 'Marked as Picked Up 🚚' : 'Delivery Confirmed & Completed 🎉'
      );
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handlePortalEnter = (role) => {
    const tab = ROLE_DEFAULT_TAB[role] || 'home';
    setActiveTab(tab);
  };

  // ── Loading state ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ fontSize: '2.5rem' }}>🍱</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading FoodShare…</div>
      </div>
    );
  }

  // ── Not logged in → Portal Landing ────────────────────────────────
  if (!user) {
    return (
      <>
        {/* Minimal top bar for theme toggle when not logged in */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={safeSetTab}
          onOpenAddDonation={() => {}}
          isLanding={true}
        />
        <PortalLanding onPortalEnter={handlePortalEnter} />
      </>
    );
  }

  // ── Determine if current tab is allowed ────────────────────────────
  const allowedTabs = ROLE_ALLOWED_TABS[user.role] || ['home'];
  const isTabAllowed = allowedTabs.includes(activeTab);

  // ── Render current page content ─────────────────────────────────────
  const renderContent = () => {
    if (!isTabAllowed) {
      return <AccessDenied role={user.role} onGoBack={() => setActiveTab(ROLE_DEFAULT_TAB[user.role])} />;
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomePage
            onOpenAddDonation={user.role === 'donor' ? () => setIsAddModalOpen(true) : null}
            onViewDetails={handleViewDetails}
            onClaim={handleOpenClaim}
            onUpdateStatus={handleUpdateStatus}
            setActiveTab={safeSetTab}
          />
        );
      case 'explore':
        return user.role === 'ngo' ? (
          <ExplorePage
            onClaim={handleOpenClaim}
            onViewDetails={handleViewDetails}
            onUpdateStatus={handleUpdateStatus}
          />
        ) : (
          <AccessDenied role={user.role} onGoBack={() => setActiveTab(ROLE_DEFAULT_TAB[user.role])} />
        );
      case 'donor_dashboard':
        return user.role === 'donor' ? (
          <DonorDashboard
            onOpenAddDonation={() => setIsAddModalOpen(true)}
            onViewDetails={handleViewDetails}
            onClaim={handleOpenClaim}
            onUpdateStatus={handleUpdateStatus}
          />
        ) : (
          <AccessDenied role={user.role} onGoBack={() => setActiveTab(ROLE_DEFAULT_TAB[user.role])} />
        );
      case 'ngo_dashboard':
        return user.role === 'ngo' ? (
          <NgoDashboard
            onViewDetails={handleViewDetails}
            onUpdateStatus={handleUpdateStatus}
            setActiveTab={safeSetTab}
          />
        ) : (
          <AccessDenied role={user.role} onGoBack={() => setActiveTab(ROLE_DEFAULT_TAB[user.role])} />
        );
      case 'admin_dashboard':
        return user.role === 'admin' ? (
          <AdminDashboard onViewDetails={handleViewDetails} />
        ) : (
          <AccessDenied role={user.role} onGoBack={() => setActiveTab(ROLE_DEFAULT_TAB[user.role])} />
        );
      case 'impact':
        return <ImpactPage />;
      default:
        return null;
    }
  };

  const AppContent = (
    <>
      <Navbar
        activeTab={activeTab}
        setActiveTab={safeSetTab}
        onOpenAddDonation={user.role === 'donor' ? () => setIsAddModalOpen(true) : null}
        isLanding={false}
      />

      <main style={{ minHeight: 'calc(100vh - 160px)' }}>{renderContent()}</main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '28px 20px',
          background: 'var(--bg-surface)',
          textAlign: 'center',
          fontSize: '0.84rem',
          color: 'var(--text-dim)'
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>FoodShare Community Platform</span>
            <span>•</span>
            <span>Web and Mobile Development (WMD) Laboratory Project</span>
          </div>
          <div>
            Built with <strong>React + Vite + Node.js Express + SQLite3</strong> • Zero-Waste Surplus Food Rescue
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Developed by Kartik Mahindrakar • CSE (AIML)
          </div>
        </div>
      </footer>
    </>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Device Mode: Simulated Smartphone Bezel or Full Responsive Web */}
      {viewMode === 'mobile_frame' ? (
        <div className="device-frame-container">
          <div className="smartphone-frame">
            <div className="smartphone-notch">
              <div className="notch-speaker" />
              <div className="notch-camera" />
            </div>
            <div className="smartphone-screen">{AppContent}</div>
          </div>
        </div>
      ) : (
        AppContent
      )}

      {/* Toast Notification Pill */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: toastType === 'error' ? 'rgba(239,68,68,0.15)' : 'var(--bg-surface-elevated)',
            border: `1px solid ${toastType === 'error' ? 'rgba(239,68,68,0.5)' : 'var(--primary)'}`,
            color: toastType === 'error' ? '#f87171' : 'var(--text-main)',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 9999,
            fontSize: '0.88rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>{toastType === 'error' ? '⚠️' : '🔔'}</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Add Donation Modal — Donor only */}
      {user?.role === 'donor' && (
        <AddDonationModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onCreated={() => {
            showToast('Food Donation published successfully! 🚀');
            setActiveTab('donor_dashboard');
          }}
        />
      )}

      {/* Claim Modal — NGO only */}
      {user?.role === 'ngo' && (
        <ClaimModal
          donation={claimModalData}
          isOpen={!!claimModalData}
          onClose={() => setClaimModalData(null)}
          onClaimed={() => {
            showToast('Donation claimed! Vehicle pickup coordinated. 🤝');
            setActiveTab('ngo_dashboard');
          }}
        />
      )}

      {/* Donation Details Modal — available to all logged-in roles */}
      <DonationDetailsModal
        donationId={detailsDonationId}
        isOpen={!!detailsDonationId}
        onClose={() => setDetailsDonationId(null)}
        onRefresh={() => {}}
        onClaimRequested={(d) => handleOpenClaim(d)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
