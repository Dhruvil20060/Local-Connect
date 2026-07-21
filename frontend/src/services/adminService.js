import { getStorageData, updateStorage } from './mockData';

export const getAdminStats = async () => {
  const data = getStorageData();
  
  const totalUsers = data.users.length;
  const totalProviders = data.providers.length;
  const totalBookings = data.bookings.length;
  const totalReviews = data.reviews.length;
  
  const completedBookings = data.bookings.filter(b => b.status.toLowerCase() === 'completed');
  let totalRevenue = 0;
  completedBookings.forEach(b => {
    const provider = data.providers.find(p => p.userId._id === b.providerId._id);
    if (provider) {
      totalRevenue += provider.visitCharge || 0;
    }
  });

  return {
    totalUsers,
    totalProviders,
    totalBookings,
    totalReviews,
    totalRevenue
  };
};

export const getAllUsers = async () => {
  const data = getStorageData();
  return data.users;
};

export const toggleUserActive = async (userId) => {
  const data = getStorageData();
  const index = data.users.findIndex(u => u._id === userId);
  if (index === -1) throw { response: { data: { message: 'User not found' } } };

  data.users[index].isActive = !data.users[index].isActive;
  updateStorage('users', data.users);

  return data.users[index];
};

export const getAllProviders = async () => {
  const data = getStorageData();
  return data.providers;
};

export const toggleProviderVerification = async (providerId) => {
  const data = getStorageData();
  const index = data.providers.findIndex(p => p._id === providerId);
  if (index === -1) throw { response: { data: { message: 'Provider not found' } } };

  data.providers[index].isVerified = !data.providers[index].isVerified;
  updateStorage('providers', data.providers);

  return data.providers[index];
};

export const getAllBookings = async () => {
  const data = getStorageData();
  return data.bookings;
};

export const getAllReviews = async () => {
  const data = getStorageData();
  return data.reviews;
};

export const deleteReview = async (reviewId) => {
  const data = getStorageData();
  const filtered = data.reviews.filter(r => r._id !== reviewId);
  updateStorage('reviews', filtered);
  return { message: 'Review deleted successfully' };
};
