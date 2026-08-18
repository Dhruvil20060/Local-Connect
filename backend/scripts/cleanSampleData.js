const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

const SAMPLE_EMAILS = [
  'customer@localconnect.com',
  'provider@localconnect.com',
  'suresh.electric@gmail.com',
  'amit.ac@gmail.com',
  'vikram.carpenter@gmail.com',
  'dinesh.appliance@gmail.com',
  'anita.cleaning@gmail.com'
];

const cleanSampleData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/localconnect';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    // 1. Find sample users by email
    const sampleUsers = await User.find({ email: { $in: SAMPLE_EMAILS } });
    const sampleUserIds = sampleUsers.map(u => u._id);

    if (sampleUserIds.length === 0) {
      console.log('No sample users found in database. Nothing to clean.');
      process.exit(0);
    }

    console.log(`Found ${sampleUserIds.length} sample users to clean:`, sampleUsers.map(u => `${u.name} (${u.email})`));

    // 2. Delete linked ProviderProfiles
    const deletedProfiles = await ProviderProfile.deleteMany({ userId: { $in: sampleUserIds } });
    console.log(`Removed ${deletedProfiles.deletedCount} sample provider profiles.`);

    // 3. Delete linked Bookings
    const deletedBookings = await Booking.deleteMany({
      $or: [
        { customerId: { $in: sampleUserIds } },
        { providerId: { $in: sampleUserIds } }
      ]
    });
    console.log(`Removed ${deletedBookings.deletedCount} sample bookings.`);

    // 4. Delete linked Reviews
    const deletedReviews = await Review.deleteMany({
      $or: [
        { customerId: { $in: sampleUserIds } },
        { providerId: { $in: sampleUserIds } }
      ]
    });
    console.log(`Removed ${deletedReviews.deletedCount} sample reviews.`);

    // 5. Delete sample Users
    const deletedUsers = await User.deleteMany({ _id: { $in: sampleUserIds } });
    console.log(`Removed ${deletedUsers.deletedCount} sample user accounts.`);

    console.log('Sample data cleanup completed successfully! Real user accounts remain intact.');
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning sample data:', error);
    process.exit(1);
  }
};

cleanSampleData();
