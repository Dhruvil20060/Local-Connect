import API from './api';

// Create a new booking request via Backend API
export const createBooking = async (bookingData) => {
  const response = await API.post('/bookings', bookingData);
  return response.data;
};

// Fetch customer's bookings from Backend API
export const getCustomerBookings = async () => {
  const response = await API.get('/bookings/my');
  return response.data;
};

// Fetch provider's requests and assigned jobs from Backend API
export const getProviderBookings = async () => {
  const response = await API.get('/bookings/provider');
  return response.data;
};

// Fetch database-driven provider availability slots & ETAs
export const getProviderAvailability = async ({ providerId, preferredDate, address }) => {
  const response = await API.get('/bookings/availability', {
    params: { providerId, preferredDate, address }
  });
  return response.data;
};

// Update booking status via Backend API
export const updateBookingStatus = async (bookingId, status) => {
  const response = await API.patch(`/bookings/${bookingId}/status`, { status });
  return response.data;
};

// Explicit Accept booking action
export const acceptBooking = async (bookingId) => {
  const response = await API.patch(`/bookings/${bookingId}/accept`);
  return response.data;
};

// Explicit Reject booking action
export const rejectBooking = async (bookingId) => {
  const response = await API.patch(`/bookings/${bookingId}/reject`);
  return response.data;
};

// Explicit Start booking action (In Progress)
export const startBooking = async (bookingId) => {
  const response = await API.patch(`/bookings/${bookingId}/start`);
  return response.data;
};

// Explicit Complete booking action
export const completeBooking = async (bookingId) => {
  const response = await API.patch(`/bookings/${bookingId}/complete`);
  return response.data;
};

// Customer marks payment as sent after scanning QR code
export const markPaymentSent = async (bookingId) => {
  const response = await API.patch(`/bookings/${bookingId}/pay-sent`);
  return response.data;
};

// Provider confirms payment received & closes booking
export const confirmPaymentReceived = async (bookingId) => {
  const response = await API.patch(`/bookings/${bookingId}/confirm-payment`);
  return response.data;
};

// Cancel booking action (Customer)
export const cancelBooking = async (bookingId) => {
  const response = await API.patch(`/bookings/${bookingId}/cancel`);
  return response.data;
};
