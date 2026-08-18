const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const Category = require('../models/Category');

const initialCategories = [
  {
    name: 'Plumber',
    description: 'Expert tap repairs, pipe leak fixes, bathroom fittings, and drain cleaning.',
    icon: 'Wrench'
  },
  {
    name: 'Electrician',
    description: 'Safe house wiring, MCB replacement, fan repair, and light fixture installations.',
    icon: 'Zap'
  },
  {
    name: 'AC Repair',
    description: 'AC gas refilling, filter deep cleaning, cooling troubleshooting, and installation.',
    icon: 'Wind'
  },
  {
    name: 'Carpenter',
    description: 'Custom wooden furniture repair, door lock installation, hinge fixing, and cabinets.',
    icon: 'Hammer'
  },
  {
    name: 'Appliance Repair',
    description: 'Washing machine, refrigerator, microwave oven, and TV repair services.',
    icon: 'Tv'
  },
  {
    name: 'Home Cleaning',
    description: 'Deep house sanitation, sofa shampooing, kitchen degreasing, and washroom cleaning.',
    icon: 'Sparkles'
  }
];

const sampleProviders = [
  {
    name: 'Ramesh Patel',
    email: 'provider@localconnect.com',
    phone: '9824109876',
    password: 'password123',
    role: 'provider',
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
    name: 'Suresh Kumar',
    email: 'suresh.electric@gmail.com',
    phone: '9898123456',
    password: 'password123',
    role: 'provider',
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
    name: 'Amit Shah',
    email: 'amit.ac@gmail.com',
    phone: '9712345678',
    password: 'password123',
    role: 'provider',
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
    name: 'Vikram Singh',
    email: 'vikram.carpenter@gmail.com',
    phone: '9909876543',
    password: 'password123',
    role: 'provider',
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
    name: 'Dinesh Solanki',
    email: 'dinesh.appliance@gmail.com',
    phone: '9879012345',
    password: 'password123',
    role: 'provider',
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
    name: 'Anita Parmar',
    email: 'anita.cleaning@gmail.com',
    phone: '9723456789',
    password: 'password123',
    role: 'provider',
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

const sampleCustomers = [
  {
    name: 'Rajesh Sharma',
    email: 'customer@localconnect.com',
    phone: '9825012345',
    password: 'password123',
    role: 'customer'
  }
];

const seedData = async () => {
  try {
    // 1. Seed Categories if empty
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      await Category.insertMany(initialCategories);
      console.log('Categories seeded successfully.');
    }

    // 2. Seed Sample Customers if not existing
    for (const cust of sampleCustomers) {
      const userExists = await User.findOne({ email: cust.email });
      if (!userExists) {
        await User.create(cust);
        console.log(`Sample customer created: ${cust.email}`);
      }
    }

    // 3. Seed Sample Providers if not existing
    for (const prov of sampleProviders) {
      let user = await User.findOne({ email: prov.email });
      if (!user) {
        user = await User.create({
          name: prov.name,
          email: prov.email,
          phone: prov.phone,
          password: prov.password,
          role: 'provider'
        });
        console.log(`Sample provider user created: ${prov.email}`);
      }

      let profile = await ProviderProfile.findOne({ userId: user._id });
      if (!profile) {
        await ProviderProfile.create({
          userId: user._id,
          profession: prov.profession,
          experience: prov.experience,
          city: prov.city,
          serviceArea: prov.serviceArea,
          visitCharge: prov.visitCharge,
          description: prov.description,
          profileImage: prov.profileImage,
          availability: prov.availability,
          isVerified: prov.isVerified,
          averageRating: prov.averageRating,
          totalReviews: prov.totalReviews
        });
        console.log(`Provider profile created for: ${prov.name}`);
      }
    }
  } catch (error) {
    console.error('Error seeding data:', error.message);
  }
};

module.exports = seedData;
