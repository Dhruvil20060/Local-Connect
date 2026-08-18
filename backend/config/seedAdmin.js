const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@localconnect.com';
    const adminData = {
      name: 'System Administrator',
      email: adminEmail,
      phone: '9999999999',
      role: 'admin',
      password: '123456'
    };

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      existingAdmin.name = adminData.name;
      existingAdmin.phone = adminData.phone;
      existingAdmin.role = adminData.role;
      existingAdmin.password = adminData.password; // Triggers pre('save') password hashing
      await existingAdmin.save();
      console.log('Existing admin account updated.');
    } else {
      await User.create(adminData); // Triggers pre('save') password hashing
      console.log('Admin account is ready.');
    }
  } catch (error) {
    console.error('Error seeding admin account:', error.message);
  }
};

module.exports = seedAdmin;
