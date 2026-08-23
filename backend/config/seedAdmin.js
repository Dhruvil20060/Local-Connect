const User = require('../models/User');

const seedAdmin = async () => {
  try {
    // 1. Master Admin Account
    const adminEmail = 'admin@localconnect.com';
    const adminData = {
      name: 'System Administrator (Master)',
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
      existingAdmin.password = adminData.password;
      await existingAdmin.save();
      console.log('Existing Master Admin account updated.');
    } else {
      await User.create(adminData);
      console.log('Master Admin account is ready.');
    }

    // 2. Sub-Admin Account
    const subAdminEmail = 'subadmin@localconnect.com';
    const subAdminData = {
      name: 'Sub Administrator',
      email: subAdminEmail,
      phone: '9876543210',
      role: 'subadmin',
      password: '123456'
    };

    const existingSubAdmin = await User.findOne({ email: subAdminEmail });
    if (existingSubAdmin) {
      existingSubAdmin.name = subAdminData.name;
      existingSubAdmin.phone = subAdminData.phone;
      existingSubAdmin.role = subAdminData.role;
      existingSubAdmin.password = subAdminData.password;
      await existingSubAdmin.save();
      console.log('Existing Sub-Admin account updated.');
    } else {
      await User.create(subAdminData);
      console.log('Sub-Admin account is ready.');
    }
  } catch (error) {
    console.error('Error seeding admin accounts:', error.message);
  }
};

module.exports = seedAdmin;

