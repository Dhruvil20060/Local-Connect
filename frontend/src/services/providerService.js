import { getStorageData, updateStorage } from './mockData';

export const getServices = async () => {
  const data = getStorageData();
  return data.categories;
};

export const getProviders = async (filters = {}) => {
  const data = getStorageData();
  let result = [...data.providers];

  if (filters.category) {
    result = result.filter(p => p.profession.toLowerCase() === filters.category.toLowerCase());
  }
  if (filters.city) {
    result = result.filter(p => p.city.toLowerCase() === filters.city.toLowerCase());
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(p => 
      p.userId.name.toLowerCase().includes(q) || 
      p.profession.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }

  return result;
};

export const getProviderById = async (id) => {
  const data = getStorageData();
  const provider = data.providers.find(p => p._id === id || p.userId._id === id);
  if (!provider) {
    throw { response: { data: { message: 'Provider not found' } } };
  }
  return provider;
};

export const getMyProviderProfile = async () => {
  const saved = localStorage.getItem('userInfo');
  if (!saved) throw { response: { data: { message: 'Not authenticated' } } };
  const user = JSON.parse(saved);

  const data = getStorageData();
  const provider = data.providers.find(p => p.userId._id === user._id);
  if (!provider) {
    throw { response: { data: { message: 'Provider profile not found' } } };
  }
  return provider;
};

export const updateProviderProfile = async (profileData) => {
  const saved = localStorage.getItem('userInfo');
  if (!saved) throw { response: { data: { message: 'Not authenticated' } } };
  const user = JSON.parse(saved);

  const data = getStorageData();
  const index = data.providers.findIndex(p => p.userId._id === user._id);
  if (index === -1) {
    throw { response: { data: { message: 'Provider profile not found' } } };
  }

  data.providers[index] = {
    ...data.providers[index],
    ...profileData
  };
  updateStorage('providers', data.providers);

  return data.providers[index];
};

export const updateAvailability = async (availability) => {
  const saved = localStorage.getItem('userInfo');
  if (!saved) throw { response: { data: { message: 'Not authenticated' } } };
  const user = JSON.parse(saved);

  const data = getStorageData();
  const index = data.providers.findIndex(p => p.userId._id === user._id);
  if (index === -1) {
    throw { response: { data: { message: 'Provider profile not found' } } };
  }

  data.providers[index].availability = availability;
  updateStorage('providers', data.providers);

  return data.providers[index];
};
