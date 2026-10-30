import React from 'react';
import StatusBadge from './StatusBadge';
import ExpiryTimer from './ExpiryTimer';
import { MapPin, User, Utensils, ArrowRight, HeartHandshake, CheckCircle, Truck, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DonationCard({ donation, onClaim, onViewDetails, onUpdateStatus }) {
  const { user } = useAuth();

  const isNgo = user?.role === 'ngo';
  const isDonor = user?.role === 'donor';
  const isAdmin = user?.role === 'admin';
  const isOwner = user?.id === donation.donor_id;
  const isClaimedByMe = donation.ngo_id === user?.id;

  const typeLabels = {
    cooked: 'Cooked Meal',
    packaged: 'Packaged Food',
    bakery: 'Bakery / Breads',
    fruits_veg: 'Fresh Produce',
    other: 'Food Supply'
  };

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal)',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative'
      }}
      className="donation-card-hover"
    >
      {/* Food Image Banner */}
      <div style={{ position: 'relative', height: '175px', overflow: 'hidden', background: '#1e293b' }}>
        <img
          src={donation.image_url}
          alt={donation.food_name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80';
          }}
        />
        
        {/* Top Badges */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none'
          }}
        >
          <span
            style={{
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(8px)',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Utensils size={11} />
            {typeLabels[donation.food_type] || 'Food Item'}
          </span>

          <StatusBadge status={donation.status} isUrgent={donation.is_urgent} />
        </div>

        {/* Expiry Timer Overlay at bottom right */}
        {donation.status === 'available' && (
          <div style={{ position: 'absolute', bottom: '8px', right: '8px' }}>
            <ExpiryTimer availableUntil={donation.available_until} status={donation.status} />
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              lineHeight: 1.3
            }}
          >
            {donation.food_name}
          </h3>
          <span
            style={{
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              fontWeight: 800,
              fontSize: '0.85rem',
              padding: '2px 8px',
              borderRadius: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            {donation.quantity} {donation.unit}
          </span>
        </div>

        {/* Description snippet */}
        <p
          style={{
            fontSize: '0.84rem',
            color: 'var(--text-muted)',
            lineHeight: 1.4,
            marginBottom: '14px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {donation.description || 'Fresh surplus food available for pickup and distribution.'}
        </p>

        {/* Metadata lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={13} color="var(--primary)" />
            <span style={{ color: 'var(--text-muted)' }}>{donation.location}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={13} color="var(--primary)" />
            <span>
              By <strong style={{ color: 'var(--text-main)' }}>{donation.donor_org || donation.donor_name}</strong>
            </span>
          </div>

          {donation.ngo_name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#3b82f6', fontWeight: 600 }}>
              <HeartHandshake size={13} />
              <span>Claimed by: {donation.ngo_org || donation.ngo_name}</span>
            </div>
          )}
        </div>

        {/* Segregated Action Footer */}
        <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px', alignItems: 'center' }}>
          
          <button
            onClick={() => onViewDetails(donation)}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1, fontSize: '0.82rem' }}
          >
            <span>Details</span>
            <ArrowRight size={13} />
          </button>

          {/* NGO ONLY: Claim Available Food */}
          {isNgo && donation.status === 'available' && (
            <button
              onClick={() => onClaim(donation)}
              className="btn btn-primary btn-sm"
              style={{ flex: 1.2, fontSize: '0.82rem' }}
            >
              <HeartHandshake size={14} />
              <span>Claim Food</span>
            </button>
          )}

          {/* NGO ONLY: Pick Up Claimed Food */}
          {isNgo && donation.status === 'claimed' && isClaimedByMe && (
            <button
              onClick={() => onUpdateStatus(donation.claim_id, 'picked_up')}
              className="btn btn-accent btn-sm"
              style={{ flex: 1.2, fontSize: '0.82rem' }}
            >
              <Truck size={14} />
              <span>Picked Up</span>
            </button>
          )}

          {/* NGO ONLY: Complete Delivered Food */}
          {isNgo && donation.status === 'picked_up' && isClaimedByMe && (
            <button
              onClick={() => onUpdateStatus(donation.claim_id, 'completed')}
              className="btn btn-primary btn-sm"
              style={{ flex: 1.2, fontSize: '0.82rem', background: '#8b5cf6' }}
            >
              <CheckCircle size={14} />
              <span>Complete 🎉</span>
            </button>
          )}

          {/* DONOR ONLY: Status information indicator */}
          {isDonor && isOwner && (
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: donation.status === 'available' ? '#10b981' : donation.status === 'claimed' ? '#f59e0b' : '#8b5cf6',
                background: 'var(--bg-surface-elevated)',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {donation.status === 'available' ? '🟢 Listed' : donation.status === 'claimed' ? '🚚 NGO En Route' : '🟣 Delivered'}
            </div>
          )}

          {/* ADMIN: Read-only status indicator */}
          {isAdmin && (
            <div
              style={{
                fontSize: '0.73rem',
                fontWeight: 700,
                color: 'var(--text-dim)',
                background: 'var(--bg-surface-elevated)',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              ⚡ Admin View
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
