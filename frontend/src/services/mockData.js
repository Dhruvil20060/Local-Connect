export const initialCategories = [
  {
    _id: 'cat1',
    name: 'Plumber',
    description: 'Expert tap repairs, pipe leak fixes, bathroom fittings, and drain cleaning.',
    icon: 'Wrench'
  },
  {
    _id: 'cat2',
    name: 'Electrician',
    description: 'Safe house wiring, MCB replacement, fan repair, and light fixture installations.',
    icon: 'Zap'
  },
  {
    _id: 'cat3',
    name: 'AC Repair',
    description: 'AC gas refilling, filter deep cleaning, cooling troubleshooting, and installation.',
    icon: 'Wind'
  },
  {
    _id: 'cat4',
    name: 'Carpenter',
    description: 'Custom wooden furniture repair, door lock installation, hinge fixing, and cabinets.',
    icon: 'Hammer'
  },
  {
    _id: 'cat5',
    name: 'Appliance Repair',
    description: 'Washing machine, refrigerator, microwave oven, and TV repair services.',
    icon: 'Tv'
  },
  {
    _id: 'cat6',
    name: 'Home Cleaning',
    description: 'Deep house sanitation, sofa shampooing, kitchen degreasing, and washroom cleaning.',
    icon: 'Sparkles'
  }
];

export const initialUsers = [
  {
    _id: 'u1',
    name: 'LocalConnect Admin',
    email: 'admin@localconnect.com',
    phone: '9876543210',
    role: 'admin',
    isActive: true,
    token: 'mock-admin-token'
  },
  {
    _id: 'u2',
    name: 'Rajesh Sharma',
    email: 'customer@localconnect.com',
    phone: '9825012345',
    role: 'customer',
    isActive: true,
    token: 'mock-customer-token'
  },
  {
    _id: 'u3',
    name: 'Ramesh Patel',
    email: 'provider@localconnect.com',
    phone: '9824109876',
    role: 'provider',
    isActive: true,
    token: 'mock-provider-token-1'
  },
  {
    _id: 'u4',
    name: 'Suresh Kumar',
    email: 'suresh.electric@gmail.com',
    phone: '9898123456',
    role: 'provider',
    isActive: true,
    token: 'mock-provider-token-2'
  },
  {
    _id: 'u5',
    name: 'Amit Shah',
    email: 'amit.ac@gmail.com',
    phone: '9712345678',
    role: 'provider',
    isActive: true,
    token: 'mock-provider-token-3'
  },
  {
    _id: 'u6',
    name: 'Vikram Singh',
    email: 'vikram.carpenter@gmail.com',
    phone: '9909876543',
    role: 'provider',
    isActive: true,
    token: 'mock-provider-token-4'
  },
  {
    _id: 'u7',
    name: 'Dinesh Solanki',
    email: 'dinesh.appliance@gmail.com',
    phone: '9879012345',
    role: 'provider',
    isActive: true,
    token: 'mock-provider-token-5'
  },
  {
    _id: 'u8',
    name: 'Anita Parmar',
    email: 'anita.cleaning@gmail.com',
    phone: '9723456789',
    role: 'provider',
    isActive: true,
    token: 'mock-provider-token-6'
  }
];

export const initialProviders = [
  {
    _id: 'p1',
    userId: { _id: 'u3', name: 'Ramesh Patel', email: 'provider@localconnect.com', phone: '9824109876' },
    profession: 'Plumber',
    experience: 8,
    city: 'Surat',
    serviceArea: 'Adajan, Pal, Vesu',
    visitCharge: 199,
    description: 'Punctual and experienced master plumber specializing in quick leak fixes, pipe fittings, and modern bathroom installations.',
    profileImage: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400',
    availability: 'Available',
    isVerified: true,
    averageRating: 4.8,
    totalReviews: 24
  },
  {
    _id: 'p2',
    userId: { _id: 'u4', name: 'Suresh Kumar', email: 'suresh.electric@gmail.com', phone: '9898123456' },
    profession: 'Electrician',
    experience: 12,
    city: 'Surat',
    serviceArea: 'Varachha, Katargam, City Light',
    visitCharge: 249,
    description: 'Certified electrical technician for home wiring, MCB replacements, inverter installations, and safety checks.',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    availability: 'Available',
    isVerified: true,
    averageRating: 4.9,
    totalReviews: 38
  },
  {
    _id: 'p3',
    userId: { _id: 'u5', name: 'Amit Shah', email: 'amit.ac@gmail.com', phone: '9712345678' },
    profession: 'AC Repair',
    experience: 6,
    city: 'Ahmedabad',
    serviceArea: 'Navrangpura, Satellite, SG Highway',
    visitCharge: 299,
    description: 'Specialist in split & window AC servicing, eco-friendly refrigerant gas refilling, and compressor overhauls.',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    availability: 'Available',
    isVerified: true,
    averageRating: 4.7,
    totalReviews: 19
  },
  {
    _id: 'p4',
    userId: { _id: 'u6', name: 'Vikram Singh', email: 'vikram.carpenter@gmail.com', phone: '9909876543' },
    profession: 'Carpenter',
    experience: 10,
    city: 'Ahmedabad',
    serviceArea: 'Bodakdev, Prahlad Nagar, Vastrapur',
    visitCharge: 250,
    description: 'Expert carpenter for modular furniture fitting, wooden door repairs, custom lock installations, and cabinetry.',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    availability: 'Busy',
    isVerified: true,
    averageRating: 4.6,
    totalReviews: 15
  },
  {
    _id: 'p5',
    userId: { _id: 'u7', name: 'Dinesh Solanki', email: 'dinesh.appliance@gmail.com', phone: '9879012345' },
    profession: 'Appliance Repair',
    experience: 7,
    city: 'Vadodara',
    serviceArea: 'Alkapuri, Gotri, Sayajigunj',
    visitCharge: 199,
    description: 'Prompt repair for washing machines, double-door refrigerators, microwave ovens, and water purifiers.',
    profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
    availability: 'Available',
    isVerified: false,
    averageRating: 4.5,
    totalReviews: 11
  },
  {
    _id: 'p6',
    userId: { _id: 'u8', name: 'Anita Parmar', email: 'anita.cleaning@gmail.com', phone: '9723456789' },
    profession: 'Home Cleaning',
    experience: 5,
    city: 'Vadodara',
    serviceArea: 'Akota, Manjalpur, Fatehgunj',
    visitCharge: 349,
    description: 'Deep house cleaning, kitchen oil stain removal, sofa shampooing, and hygienic bathroom disinfection.',
    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    availability: 'Available',
    isVerified: true,
    averageRating: 4.9,
    totalReviews: 42
  }
];

export const initialBookings = [
  {
    _id: 'b1',
    customerId: { _id: 'u2', name: 'Rajesh Sharma', email: 'customer@localconnect.com', phone: '9825012345' },
    providerId: { _id: 'u3', name: 'Ramesh Patel', email: 'provider@localconnect.com', phone: '9824109876' },
    service: 'Plumber',
    problemDescription: 'Water pipe leaking under kitchen sink.',
    address: 'B-304, Green Avenue, Adajan, Surat',
    preferredDate: '2026-07-22',
    preferredTime: '10:00 AM',
    status: 'Completed',
    createdAt: '2026-07-20T10:00:00.000Z'
  },
  {
    _id: 'b2',
    customerId: { _id: 'u2', name: 'Rajesh Sharma', email: 'customer@localconnect.com', phone: '9825012345' },
    providerId: { _id: 'u4', name: 'Suresh Kumar', email: 'suresh.electric@gmail.com', phone: '9898123456' },
    service: 'Electrician',
    problemDescription: 'Main MCB tripping repeatedly when AC is switched on.',
    address: 'B-304, Green Avenue, Adajan, Surat',
    preferredDate: '2026-07-23',
    preferredTime: '11:00 AM - 01:00 PM',
    status: 'Requested',
    createdAt: '2026-07-21T09:00:00.000Z'
  }
];

export const initialReviews = [
  {
    _id: 'r1',
    bookingId: 'b1',
    customerId: { _id: 'u2', name: 'Rajesh Sharma', email: 'customer@localconnect.com' },
    providerId: { _id: 'u3', name: 'Ramesh Patel', email: 'provider@localconnect.com' },
    rating: 5,
    comment: 'Ramesh bhai arrived right on time and fixed the leak in 30 minutes! Highly professional and reasonable rates.',
    createdAt: '2026-07-20T12:00:00.000Z'
  }
];

const getItem = (key, defaultVal) => {
  let saved = localStorage.getItem(key);
  if (saved && (saved.includes('rajesh@gmail.com') || saved.includes('ramesh.plumber@gmail.com'))) {
    localStorage.removeItem(key);
    saved = null;
    localStorage.removeItem('userInfo');
  }
  if (!saved) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  return JSON.parse(saved);
};

const setItem = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val));
};

export const getStorageData = () => ({
  categories: getItem('lc_categories', initialCategories),
  users: getItem('lc_users', initialUsers),
  providers: getItem('lc_providers', initialProviders),
  bookings: getItem('lc_bookings', initialBookings),
  reviews: getItem('lc_reviews', initialReviews)
});

export const updateStorage = (key, data) => {
  setItem(`lc_${key}`, data);
};
