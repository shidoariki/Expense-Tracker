const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Store token in localStorage
const getToken = () => localStorage.getItem('token');

const apiCall = async (endpoint, method = 'GET', body = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API error');
  }

  return data;
};

export const authAPI = {
  register: (email, password) =>
    apiCall('/auth/register', 'POST', { email, password }),
  login: (email, password) =>
    apiCall('/auth/login', 'POST', { email, password }),
};

export const expenseAPI = {
  getAll: () => apiCall('/expenses'),
  create: (amount, category, description) =>
    apiCall('/expenses', 'POST', { amount, category, description }),
  update: (id, amount, category, description) =>
    apiCall(`/expenses/${id}`, 'PUT', { amount, category, description }),
  delete: (id) => apiCall(`/expenses/${id}`, 'DELETE'),
};
