import API from './api';

// Submit review for completed service booking via Backend API
export const createReview = async (reviewData) => {
  const response = await API.post('/reviews', reviewData);
  return response.data;
};

// Fetch reviews for a specific provider via Backend API
export const getProviderReviews = async (providerId) => {
  const response = await API.get(`/reviews/provider/${providerId}`);
  return response.data;
};
