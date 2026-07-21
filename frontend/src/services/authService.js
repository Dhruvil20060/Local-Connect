import { getStorageData, updateStorage } from './mockData';

export const register = async (userData) => {
  const data = getStorageData();
  
  // Check if email already exists
  const existing = data.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existing) {
    throw { response: { data: { message: 'Email already exists' } } };
  }

  const newId = `u${Date.now()}`;
  const newUser = {
    _id: newId,
    name: userData.name,
    email: userData.email,
    phone: userData.phone || '',
    role: userData.role || 'customer',
    isActive: true,
    token: `mock-token-${newId}`
  };

  data.users.push(newUser);
  updateStorage('users', data.users);

  // If role is provider, also create a provider profile
  if (newUser.role === 'provider') {
    const newProvider = {
      _id: `p${Date.now()}`,
      userId: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone
      },
      profession: userData.profession || 'Plumber',
      experience: parseInt(userData.experience) || 1,
      city: userData.city || '',
      serviceArea: userData.serviceArea || '',
      visitCharge: parseInt(userData.visitCharge) || 99,
      description: userData.description || '',
      profileImage: userData.profileImage || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400',
      availability: 'Available',
      isVerified: false,
      averageRating: 0,
      totalReviews: 0
    };
    data.providers.push(newProvider);
    updateStorage('providers', data.providers);
  }

  return newUser;
};

export const login = async (credentials) => {
  const data = getStorageData();
  const email = credentials.email.toLowerCase().trim();
  const password = credentials.password;

  const foundUser = data.users.find(u => u.email.toLowerCase().trim() === email);
  if (!foundUser) {
    throw { response: { data: { message: 'Invalid email or password' } } };
  }

  let isValid = false;
  if (foundUser.role === 'customer' && (password === 'customer123' || password === 'password123')) isValid = true;
  else if (foundUser.role === 'provider' && (password === 'provider123' || password === 'password123')) isValid = true;
  else if (foundUser.role === 'admin' && (password === 'admin123' || password === 'password123')) isValid = true;
  else if (password === 'password123') isValid = true;

  if (!isValid) {
    throw { response: { data: { message: 'Invalid email or password' } } };
  }

  if (!foundUser.isActive) {
    throw { response: { data: { message: 'Your account is deactivated. Contact Admin.' } } };
  }

  const updatedUser = {
    ...foundUser,
    token: foundUser.token || `mock-token-${foundUser._id}`
  };

  return updatedUser;
};

export const getMe = async () => {
  const saved = localStorage.getItem('userInfo');
  if (saved) {
    const user = JSON.parse(saved);
    const data = getStorageData();
    const foundUser = data.users.find(u => u._id === user._id);
    if (foundUser) {
      return foundUser;
    }
  }
  throw { response: { data: { message: 'Not authenticated' } } };
};

export const updateUserProfile = async (profileData) => {
  const saved = localStorage.getItem('userInfo');
  if (!saved) throw { response: { data: { message: 'Not authenticated' } } };
  const user = JSON.parse(saved);

  const data = getStorageData();
  const index = data.users.findIndex(u => u._id === user._id);
  if (index === -1) throw { response: { data: { message: 'User not found' } } };

  data.users[index] = { ...data.users[index], ...profileData };
  updateStorage('users', data.users);

  if (data.users[index].role === 'provider') {
    const pIndex = data.providers.findIndex(p => p.userId._id === user._id);
    if (pIndex !== -1) {
      data.providers[pIndex].userId = {
        ...data.providers[pIndex].userId,
        name: data.users[index].name,
        email: data.users[index].email,
        phone: data.users[index].phone
      };
      updateStorage('providers', data.providers);
    }
  }

  return data.users[index];
};
