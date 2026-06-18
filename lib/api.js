const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message || 'Something went wrong', response.status);
  }

  return data;
}

export const api = {
  auth: {
    register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    forgotPassword: (body) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
    resetPassword: (body) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
    getProfile: () => request('/auth/profile'),
  },
  documents: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/documents${query ? `?${query}` : ''}`);
    },
    get: (id) => request(`/documents/${id}`),
    upload: (formData) => request('/documents/upload', { method: 'POST', body: formData }),
    addSignature: (id, body) => request(`/documents/${id}/signatures`, { method: 'POST', body: JSON.stringify(body) }),
    complete: (id) => request(`/documents/${id}/complete`, { method: 'POST' }),
    delete: (id) => request(`/documents/${id}`, { method: 'DELETE' }),
    previewUrl: (id, type = 'original') => {
      const token = localStorage.getItem('token');
      return `${API_URL}/documents/${id}/preview?type=${type}&token=${token}`;
    },
    downloadUrl: (id, type = 'signed') => {
      const token = localStorage.getItem('token');
      return `${API_URL}/documents/${id}/download?type=${type}`;
    },
  },
  signatures: {
    list: () => request('/signatures'),
    create: (body) => request('/signatures', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id) => request(`/signatures/${id}`, { method: 'DELETE' }),
  },
  verification: {
    verify: (code) => request('/verification/verify', { method: 'POST', body: JSON.stringify({ code }) }),
    getAuditLogs: (documentId) => request(`/verification/audit/${documentId}`),
  },
  admin: {
    getStats: () => request('/admin/stats'),
    getUsers: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/users${query ? `?${query}` : ''}`);
    },
    getDocuments: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/documents${query ? `?${query}` : ''}`);
    },
    getAuditLogs: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/audit-logs${query ? `?${query}` : ''}`);
    },
  },
};

export { ApiError };
