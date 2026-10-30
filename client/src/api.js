const API_BASE = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('foodshare_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}: Request failed`);
  }

  return data;
}

export const authApi = {
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  register: (payload) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  createUser: (payload) => request('/auth/users', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getMe: () => request('/auth/me')
};

export const donationsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.food_type && params.food_type !== 'all') query.set('food_type', params.food_type);
    if (params.search) query.set('search', params.search);
    if (params.urgent_only) query.set('urgent_only', 'true');
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/donations${qs}`);
  },
  getMy: () => request('/donations/my'),
  getById: (id) => request(`/donations/${id}`),
  create: (payload) => request('/donations', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  update: (id, payload) => request(`/donations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  delete: (id) => request(`/donations/${id}`, {
    method: 'DELETE'
  })
};

export const claimsApi = {
  claim: (donationId, payload = {}) => request(`/claims/${donationId}`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateStatus: (claimId, status) => request(`/claims/${claimId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),
  getMy: () => request('/claims/my')
};

export const statsApi = {
  getImpact: () => request('/stats/impact'),
  getAdminStats: () => request('/stats/admin')
};
