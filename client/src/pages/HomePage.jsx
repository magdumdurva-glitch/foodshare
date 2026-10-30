import React, { useEffect, useState } from 'react';
import { donationsApi, statsApi } from '../api';
import DonationCard from '../components/DonationCard';
import { 
  ArrowRight, 
  Sparkles, 
  ChevronRight,
  Package,
  HeartHandshake,
  ShieldCheck,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Role-specific hero content
const ROLE_HERO = {
  donor: {
    emoji: '🍛',
    greeting: 'Your Donor Dashboard Overview',
    tagline: 'DONOR PORTAL',
    taglineColor: '#10b981',
    taglineBg: 'rgba(16, 185, 129, 0.12)',
    taglineBorder: 'rgba(16, 185, 129, 0.3)',
    heroBg: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.15) 0%, rgba(11, 15, 25, 0) 70%)',
    description: 'Post surplus food from your canteen or event and watch it reach families in need.',
    ctaLabel: 'Post a New Food Donation',
    ctaIcon: <PlusCircle size={16} />,
    ctaGradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    ctaTab: 'donor_dashboard'
  },
  ngo: {
    emoji: '🤝',
    greeting: 'NGO Volunteer Command Center',
    tagline: 'NGO PORTAL',
    taglineColor: '#3b82f6',
    taglineBg: 'rgba(59, 130, 246, 0.12)',
    taglineBorder: 'rgba(59, 130, 246, 0.3)',
    heroBg: 'radial-gradient(ellipse at top, rgba(59, 130, 246, 0.12) 0%, rgba(11, 15, 25, 0) 70%)',
    description: 'Explore fresh food batches across Thane, claim them, and coordinate delivery to shelters.',
    ctaLabel: 'Browse Available Food',
    ctaIcon: <HeartHandshake size={16} />,
    ctaGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    ctaTab: 'explore'
  },
  admin: {
    emoji: '⚡',
    greeting: 'Admin & Faculty Oversight Hub',
    tagline: 'ADMIN CONSOLE',
    taglineColor: '#f59e0b',
    taglineBg: 'rgba(245, 158, 11, 0.12)',
    taglineBorder: 'rgba(245, 158, 11, 0.3)',
    heroBg: 'radial-gradient(ellipse at top, rgba(245, 158, 11, 0.12) 0%, rgba(11, 15, 25, 0) 70%)',
    description: 'Full system oversight: inspect the SQLite database, audit all activity logs, and override statuses.',
    ctaLabel: 'Open Admin Console',
    ctaIcon: <ShieldCheck size={16} />,
    ctaGradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    ctaTab: 'admin_dashboard'
  }
};

export default function HomePage({ onOpenAddDonation, onViewDetails, onClaim, onUpdateStatus, setActiveTab }) {
  const { user } = useAuth();
  const [recentDonations, setRecentDonations] = useState([]);
  const [impactStats, setImpactStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [donRes, statsRes] = await Promise.all([
          donationsApi.getAll({ status: 'all' }),
          statsApi.getImpact()
        ]);
        setRecentDonations((donRes.donations || []).slice(0, 4));
        setImpactStats(statsRes);
      } catch (err) {
        console.error('Home page data fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const hero = user ? ROLE_HERO[user.role] : null;

  const handleHeroCta = () => {
    if (!hero) return;
    if (hero.ctaTab === 'donor_dashboard' && onOpenAddDonation) {
      onOpenAddDonation();
    } else {
      setActiveTab(hero.ctaTab);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 60px' }}>
      
      {/* Hero Section — role-aware */}
      <section
        style={{
          background: hero?.heroBg || 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.15) 0%, rgba(11, 15, 25, 0) 70%)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          padding: '50px 24px 40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '32px'
        }}
      >
        {hero && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: hero.taglineBg,
              border: `1px solid ${hero.taglineBorder}`,
              padding: '5px 14px',
              borderRadius: '20px',
              color: hero.taglineColor,
              fontSize: '0.78rem',
              fontWeight: 800,
              marginBottom: '16px',
              letterSpacing: '0.05em'
            }}
          >
            <Sparkles size={13} />
            <span>{hero.tagline}</span>
          </div>
        )}

        <h1
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            marginBottom: '12px',
            lineHeight: 1.15
          }}
        >
          {hero ? (
            <>
              {hero.greeting}
            </>
          ) : (
            <>
              Don&apos;t Waste Surplus Food. <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Share It Instantly.
              </span>
            </>
          )}
        </h1>

        <p
          style={{
            fontSize: '1rem',
            color: 'var(--text-muted)',
            maxWidth: '580px',
            margin: '0 auto 28px',
            lineHeight: 1.6
          }}
        >
          {hero
            ? hero.description
            : 'FoodShare connects food donors with NGO volunteers to rescue surplus meals and deliver them to communities in Thane.'}
        </p>

        {/* Hero CTA — role-specific */}
        {hero && (
          <button
            onClick={handleHeroCta}
            style={{
              padding: '13px 28px',
              borderRadius: '10px',
              background: hero.ctaGradient,
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {hero.ctaIcon}
            <span>{hero.ctaLabel}</span>
            <ArrowRight size={16} />
          </button>
        )}
      </section>

      {/* Live Impact Counters */}
      <section style={{ marginBottom: '40px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}
        >
          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
              {impactStats ? impactStats.totalMeals.toLocaleString() : '1,250'}+
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, marginTop: '6px', color: 'var(--text-main)' }}>
              Meals Rescued & Donated
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#3b82f6', lineHeight: 1 }}>
              {impactStats ? impactStats.estimatedKgSaved.toLocaleString() : '560'} kg
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, marginTop: '6px', color: 'var(--text-main)' }}>
              Edible Food Diverted
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>
              {impactStats ? impactStats.co2SavedKg.toLocaleString() : '1,400'} kg
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, marginTop: '6px', color: 'var(--text-main)' }}>
              Greenhouse Gases Averted
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#8b5cf6', lineHeight: 1 }}>
              {impactStats ? `${impactStats.partnerNgos} NGOs` : '12 NGOs'}
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, marginTop: '6px', color: 'var(--text-main)' }}>
              Rescue Partners in Thane
            </div>
          </div>
        </div>
      </section>

      {/* Live Rescue Feed Preview — visible to all roles */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Live Community Food Feed</span>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 8px #10b981'
                }}
              />
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              {user?.role === 'ngo'
                ? 'Fresh food batches available for claiming across Thane'
                : user?.role === 'donor'
                ? 'Your recent community food listings — and what others have shared'
                : 'Active surplus food batches awaiting collection across Thane'}
            </p>
          </div>

          {/* NGOs can explore all — others see their own context */}
          {user?.role === 'ngo' && (
            <button
              onClick={() => setActiveTab('explore')}
              style={{
                color: '#3b82f6',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Browse All Available</span>
              <ChevronRight size={15} />
            </button>
          )}

          {user?.role === 'donor' && (
            <button
              onClick={() => setActiveTab('donor_dashboard')}
              style={{
                color: '#10b981',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>View My Donations</span>
              <ChevronRight size={15} />
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Loading active donations...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
            {recentDonations.map((donation) => (
              <DonationCard
                key={donation.id}
                donation={donation}
                onClaim={user?.role === 'ngo' ? onClaim : null}
                onViewDetails={onViewDetails}
                onUpdateStatus={user?.role === 'ngo' || user?.role === 'admin' ? onUpdateStatus : null}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
