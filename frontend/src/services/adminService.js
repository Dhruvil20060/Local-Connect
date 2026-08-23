import API from './api';

// Fetch dynamic admin stats from MongoDB
export const getAdminStats = async () => {
  const response = await API.get('/admin/stats');
  return response.data;
};

// Fetch all users from Users collection in MongoDB
export const getAllUsers = async () => {
  const response = await API.get('/admin/users');
  return response.data;
};

// Update / toggle User active status in MongoDB
export const toggleUserActive = async (userId, newStatus) => {
  const payload = typeof newStatus === 'boolean' ? { isActive: newStatus } : {};
  const response = await API.patch(`/admin/users/${userId}/status`, payload);
  return response.data;
};

// Fetch all provider users and ProviderProfile details from MongoDB
export const getAllProviders = async () => {
  const response = await API.get('/admin/providers');
  return response.data;
};

// Toggle provider verification in MongoDB
export const toggleProviderVerification = async (providerId) => {
  const response = await API.put(`/admin/providers/${providerId}/toggle-verify`);
  return response.data;
};

// Fetch all bookings from MongoDB
export const getAllBookings = async () => {
  const response = await API.get('/admin/bookings');
  return response.data;
};

// Fetch all reviews from MongoDB
export const getAllReviews = async () => {
  const response = await API.get('/admin/reviews');
  return response.data;
};

// Delete review from MongoDB
export const deleteReview = async (reviewId) => {
  const response = await API.delete(`/admin/reviews/${reviewId}`);
  return response.data;
};

// Fetch all deactivation requests
export const getDeactivationRequests = async () => {
  const response = await API.get('/admin/deactivation-requests');
  return response.data;
};

// Respond to deactivation request (Master Admin approval/rejection)
export const respondDeactivationRequest = async (requestId, action) => {
  const response = await API.put(`/admin/deactivation-requests/${requestId}/respond`, { action });
  return response.data;
};

