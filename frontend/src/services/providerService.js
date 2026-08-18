import API from './api';

// Fetch categories from Backend API
export const getServices = async () => {
  const response = await API.get('/providers/categories');
  return response.data;
};

// Fetch providers from Backend API with query params
export const getProviders = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.service && filters.service !== 'All') params.append('service', filters.service);
  if (filters.category && filters.category !== 'All') params.append('service', filters.category);
  if (filters.city) params.append('city', filters.city);
  if (filters.location) params.append('city', filters.location);
  if (filters.rating) params.append('rating', filters.rating);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);

  const response = await API.get(`/providers?${params.toString()}`);
  return response.data;
};

// Fetch single provider details by ID from Backend API
export const getProviderById = async (id) => {
  const response = await API.get(`/providers/${id}`);
  return response.data;
};

// Fetch logged-in provider profile from Backend API
export const getMyProviderProfile = async () => {
  const response = await API.get('/providers/profile/me');
  return response.data;
};

// Update provider profile details via Backend API
export const updateProviderProfile = async (profileData) => {
  const response = await API.put('/providers/profile', profileData);
  return response.data;
};

export const updateProfile = updateProviderProfile;

// Update provider availability status via Backend API
export const updateAvailability = async (availability) => {
  const response = await API.patch('/providers/availability', { availability });
  return response.data;
};
