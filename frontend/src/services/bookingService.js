import { getStorageData, updateStorage } from './mockData';

export const createBooking = async (bookingData) => {
  const saved = localStorage.getItem('userInfo');
  if (!saved) throw { response: { data: { message: 'Not authenticated' } } };
  const user = JSON.parse(saved);

  const data = getStorageData();
  
  // Find provider
  const provider = data.providers.find(p => p._id === bookingData.providerId);
  if (!provider) throw { response: { data: { message: 'Provider not found' } } };

  const newBooking = {
    _id: `b${Date.now()}`,
    customerId: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || ''
    },
    providerId: {
      _id: provider.userId._id,
      name: provider.userId.name,
      email: provider.userId.email,
      phone: provider.userId.phone || ''
    },
    service: provider.profession,
    problemDescription: bookingData.problemDescription,
    address: bookingData.address,
    preferredDate: bookingData.preferredDate,
    preferredTime: bookingData.preferredTime,
    status: 'Requested',
    createdAt: new Date().toISOString()
  };

  data.bookings.unshift(newBooking);
  updateStorage('bookings', data.bookings);

  return newBooking;
};

export const getCustomerBookings = async () => {
  const saved = localStorage.getItem('userInfo');
  if (!saved) throw { response: { data: { message: 'Not authenticated' } } };
  const user = JSON.parse(saved);

  const data = getStorageData();
  return data.bookings.filter(b => b.customerId._id === user._id);
};

export const getProviderBookings = async () => {
  const saved = localStorage.getItem('userInfo');
  if (!saved) throw { response: { data: { message: 'Not authenticated' } } };
  const user = JSON.parse(saved);

  const data = getStorageData();
  return data.bookings.filter(b => b.providerId._id === user._id);
};

export const updateBookingStatus = async (bookingId, status) => {
  const data = getStorageData();
  const index = data.bookings.findIndex(b => b._id === bookingId);
  if (index === -1) throw { response: { data: { message: 'Booking not found' } } };

  data.bookings[index].status = status;
  updateStorage('bookings', data.bookings);

  return data.bookings[index];
};
