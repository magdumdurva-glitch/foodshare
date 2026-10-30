import React, { useState, useEffect } from 'react';
import { authApi, statsApi, donationsApi } from '../api';
import StatusBadge from '../components/StatusBadge';
import { 
  ShieldCheck, 
  Users, 
  Package, 
  Activity, 
  Trash2, 
  UserPlus,
  RefreshCw, 
  CheckCircle2, 
  BarChart, 
  MapPin,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard({ onViewDetails }) {
  const { user } = useAuth();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('donations'); // 'donations' | 'users' | 'logs'
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'donor' });
  const [createMessage, setCreateMessage] = useState('');
  const [createError, setCreateError] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await statsApi.getAdminStats();
      setAdminData(res);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleStatusChange = async (donationId, newStatus) => {
    try {
      await donationsApi.update(donationId, { status: newStatus });
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDeleteDonation = async (donationId) => {
    if (!window.confirm('Are you sure you want to delete this donation from the database?')) return;
    try {
      await donationsApi.delete(donationId);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete donation');
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setCreateMessage('');
    setCreateError('');
    try {
      const result = await authApi.createUser(newUser);
      setCreateMessage(`Created ${result.user.role} account for ${result.user.email}.`);
      setNewUser({ name: '', email: '', password: '', role: 'donor' });
      await fetchAdminData();
    } catch (err) {
      setCreateError(err.message || 'Failed to create account.');
    }
  };

  if (loading || !adminData) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading Admin Central Dashboard...
      </div>
    );
  }

  const { users, donations, logs, breakdown, statusCounts } = adminData;

  const totalUsers = users.length;
  const totalDonations = donations.length;
  const availableCount = donations.filter(d => d.status === 'available').length;
  const completedCount = donations.filter(d => d.status === 'completed').length;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 60px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>Admin & Faculty Oversight Portal ⚡</span>
            <span className="badge" style={{ background: '#f59e0b', color: '#fff' }}>Superuser</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Full system control: SQLite database inspection, role oversight, and donation lifecycle management
          </p>
        </div>

        <button onClick={fetchAdminData} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Highlights */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '28px'
        }}
      >
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Registered Users
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#3b82f6', marginTop: '2px' }}>
            {totalUsers}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {users.filter(u => u.role === 'donor').length} Donors • {users.filter(u => u.role === 'ngo').length} NGOs
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Food Batches
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
            {totalDonations}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {availableCount} currently active
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Completed Deliveries
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#8b5cf6', marginTop: '2px' }}>
            {completedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            100% verified pickups
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Database Engine
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b', marginTop: '6px' }}>
            SQLite 3 (Local)
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            foodshare.db • WAL mode
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('donations')}
          style={{
            padding: '10px 16px',
            fontWeight: 700,
            fontSize: '0.9rem',
            borderBottom: activeTab === 'donations' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'donations' ? 'var(--primary)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <Package size={16} />
          <span>Donations Management ({donations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '10px 16px',
            fontWeight: 700,
            fontSize: '0.9rem',
            borderBottom: activeTab === 'users' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <Users size={16} />
          <span>User Accounts ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          style={{
            padding: '10px 16px',
            fontWeight: 700,
            fontSize: '0.9rem',
            borderBottom: activeTab === 'logs' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'logs' ? 'var(--primary)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <Activity size={16} />
          <span>Live Audit Logs ({logs.length})</span>
        </button>
      </div>

      {/* Tab 1: Donations Management */}
      {activeTab === 'donations' && (
        <div className="glass-panel" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)' }}>
                <th style={{ padding: '12px 16px' }}>Food Name</th>
                <th style={{ padding: '12px 16px' }}>Quantity</th>
                <th style={{ padding: '12px 16px' }}>Donor</th>
                <th style={{ padding: '12px 16px' }}>Location</th>
                <th style={{ padding: '12px 16px' }}>Claiming NGO</th>
                <th style={{ padding: '12px 16px' }}>Status Override</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{d.food_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>{d.food_type}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                    {d.quantity} {d.unit}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div>{d.donor_org || d.donor_name}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                    {d.location}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {d.ngo_name ? (
                      <span style={{ color: '#3b82f6', fontWeight: 600 }}>{d.ngo_org || d.ngo_name}</span>
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>None (Available)</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <select
                      className="form-select"
                      style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                      value={d.status}
                      onChange={(e) => handleStatusChange(d.id, e.target.value)}
                    >
                      <option value="available">🟢 Available</option>
                      <option value="claimed">🟠 Claimed</option>
                      <option value="picked_up">🚚 Picked Up</option>
                      <option value="completed">🟣 Completed</option>
                      <option value="cancelled">🔴 Cancelled</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        onClick={() => onViewDetails(d)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px' }}
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleDeleteDonation(d.id)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '4px 8px' }}
                        title="Delete donation"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === 'users' && (
        <>
        <form onSubmit={handleCreateUser} className="glass-panel" style={{ padding: '18px', marginBottom: '16px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '1rem' }}>Create account</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            <input
              className="form-input"
              aria-label="Full name"
              placeholder="Full name"
              value={newUser.name}
              onChange={(event) => setNewUser({ ...newUser, name: event.target.value })}
              required
            />
            <input
              className="form-input"
              type="email"
              aria-label="Email address"
              placeholder="Email address"
              value={newUser.email}
              onChange={(event) => setNewUser({ ...newUser, email: event.target.value })}
              required
            />
            <input
              className="form-input"
              type="password"
              aria-label="Temporary password"
              placeholder="Password (12+ characters)"
              value={newUser.password}
              onChange={(event) => setNewUser({ ...newUser, password: event.target.value })}
              minLength={12}
              required
            />
            <select
              className="form-input"
              aria-label="Account role"
              value={newUser.role}
              onChange={(event) => setNewUser({ ...newUser, role: event.target.value })}
            >
              <option value="donor">Donor</option>
              <option value="ngo">NGO</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {(createMessage || createError) && (
            <p role="status" style={{ color: createError ? '#f87171' : 'var(--primary)', margin: '12px 0 0', fontSize: '0.84rem' }}>
              {createError || createMessage}
            </p>
          )}
          <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
            <UserPlus size={14} />
            <span>Create account</span>
          </button>
        </form>
        <div className="glass-panel" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)' }}>
                <th style={{ padding: '12px 16px' }}>Name</th>
                <th style={{ padding: '12px 16px' }}>Email</th>
                <th style={{ padding: '12px 16px' }}>Role</th>
                <th style={{ padding: '12px 16px' }}>Organization</th>
                <th style={{ padding: '12px 16px' }}>Phone</th>
                <th style={{ padding: '12px 16px' }}>Location</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>{u.name}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: u.role === 'donor' ? 'rgba(16,185,129,0.15)' : u.role === 'ngo' ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)',
                        color: u.role === 'donor' ? '#10b981' : u.role === 'ngo' ? '#3b82f6' : '#f59e0b'
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{u.organization || '—'}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{u.phone || '—'}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-dim)' }}>{u.location || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {/* Tab 3: System Logs */}
      {activeTab === 'logs' && (
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <div>
                  <span
                    style={{
                      background: 'rgba(16,185,129,0.15)',
                      color: 'var(--primary)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      marginRight: '8px',
                      fontSize: '0.75rem'
                    }}
                  >
                    {log.action}
                  </span>
                  <span style={{ color: 'var(--text-main)' }}>{log.details}</span>
                </div>

                <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
