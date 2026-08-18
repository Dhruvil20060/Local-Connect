import API from './api';

// Register a new customer user via Backend API
export const register = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

// Register a new provider user via Backend API
export const registerProvider = async (providerData) => {
  const response = await API.post('/auth/register-provider', providerData);
  return response.data;
};

// Login user via Backend API
export const login = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  return response.data;
};

// Verify token and fetch current user details
export const getMe = async () => {
  const response = await API.get('/auth/me');
  return response.data;
};

// Become a Provider (Upgrade existing customer role & create ProviderProfile)
export const becomeProvider = async (providerData) => {
  const response = await API.post('/auth/become-provider', providerData);
  return response.data;
};

// Update user profile locally
export const updateUserProfile = async (profileData) => {
  const saved = localStorage.getItem('userInfo');
  if (!saved) throw { response: { data: { message: 'Not authenticated' } } };
  const user = JSON.parse(saved);
  const updated = { ...user, ...profileData };
  localStorage.setItem('userInfo', JSON.stringify(updated));
  return updated;
};
