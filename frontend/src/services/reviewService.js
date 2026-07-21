import { getStorageData, updateStorage } from './mockData';

export const createReview = async (reviewData) => {
  const saved = localStorage.getItem('userInfo');
  if (!saved) throw { response: { data: { message: 'Not authenticated' } } };
  const user = JSON.parse(saved);

  const data = getStorageData();
  
  // Find booking
  const booking = data.bookings.find(b => b._id === reviewData.bookingId);
  if (!booking) throw { response: { data: { message: 'Booking not found' } } };

  const newReview = {
    _id: `r${Date.now()}`,
    bookingId: reviewData.bookingId,
    customerId: {
      _id: user._id,
      name: user.name,
      email: user.email
    },
    providerId: {
      _id: booking.providerId._id,
      name: booking.providerId.name,
      email: booking.providerId.email
    },
    rating: parseInt(reviewData.rating) || 5,
    comment: reviewData.comment || '',
    createdAt: new Date().toISOString()
  };

  data.reviews.unshift(newReview);
  updateStorage('reviews', data.reviews);

  // Recalculate provider average rating and total reviews
  const providerReviews = data.reviews.filter(r => r.providerId._id === booking.providerId._id);
  const total = providerReviews.length;
  const sum = providerReviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = total > 0 ? parseFloat((sum / total).toFixed(1)) : 0;

  const pIdx = data.providers.findIndex(p => p.userId._id === booking.providerId._id);
  if (pIdx !== -1) {
    data.providers[pIdx].averageRating = avg;
    data.providers[pIdx].totalReviews = total;
    updateStorage('providers', data.providers);
  }

  return newReview;
};

export const getProviderReviews = async (providerId) => {
  const data = getStorageData();
  let resolvedUserId = providerId;
  const provider = data.providers.find(p => p._id === providerId);
  if (provider) {
    resolvedUserId = provider.userId._id;
  }
  return data.reviews.filter(r => r.providerId._id === resolvedUserId);
};
