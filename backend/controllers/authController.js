const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d'
  });
};

// @desc    Register a new customer account
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Validate password match if confirmPassword is supplied
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Check if email already exists
    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create user in database with Customer role
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password,
      role: 'customer'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

// @desc    Register a new service provider account
// @route   POST /api/auth/register-provider
// @access  Public
const registerProvider = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      profession,
      experience,
      description,
      city,
      serviceArea,
      visitCharge,
      profileImage,
      availability
    } = req.body;

    // Validate required user fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'Please fill in all required user fields' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Validate password match
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Validate required provider fields
    if (!profession || experience === undefined || !city || !serviceArea || visitCharge === undefined) {
      return res.status(400).json({
        message: 'Please provide all required professional fields: profession, experience, city, serviceArea, visitCharge'
      });
    }

    // Check email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Check if email already exists
    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // 1. Create User in MongoDB with Provider role
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password,
      role: 'provider'
    });

    // 2. Create linked ProviderProfile in MongoDB
    await ProviderProfile.create({
      userId: user._id,
      profession: profession.trim(),
      experience: Number(experience),
      description: description ? description.trim() : '',
      city: city.trim(),
      serviceArea: serviceArea.trim(),
      visitCharge: Number(visitCharge),
      profileImage: profileImage || '',
      availability: availability || 'Available',
      isVerified: true
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Provider registration error:', error);
    res.status(500).json({ message: error.message || 'Server error during provider registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (user && (await user.matchPassword(password))) {
      if (user.isActive === false) {
        return res.status(403).json({
          message: 'Your account has been deactivated. Please contact the administrator.'
        });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: error.message || 'Server error fetching user profile' });
  }
};

// @desc    Upgrade Customer account to Provider by creating ProviderProfile & updating role
// @route   POST /api/auth/become-provider
// @access  Private (Customer)
const becomeProvider = async (req, res) => {
  try {
    const {
      profession,
      experience,
      description,
      city,
      serviceArea,
      visitCharge,
      profileImage,
      availability
    } = req.body;

    // Validate required provider fields
    if (!profession || experience === undefined || !city || !serviceArea || visitCharge === undefined) {
      return res.status(400).json({
        message: 'Please provide all required fields: profession, experience, city, serviceArea, visitCharge'
      });
    }

    // Check if user already has a ProviderProfile
    let providerProfile = await ProviderProfile.findOne({ userId: req.user._id });

    if (providerProfile) {
      providerProfile.profession = profession;
      providerProfile.experience = Number(experience);
      providerProfile.description = description || providerProfile.description;
      providerProfile.city = city;
      providerProfile.serviceArea = serviceArea;
      providerProfile.visitCharge = Number(visitCharge);
      if (profileImage) providerProfile.profileImage = profileImage;
      if (availability) providerProfile.availability = availability;
      await providerProfile.save();
    } else {
      providerProfile = await ProviderProfile.create({
        userId: req.user._id,
        profession,
        experience: Number(experience),
        description: description || '',
        city,
        serviceArea,
        visitCharge: Number(visitCharge),
        profileImage: profileImage || '',
        availability: availability || 'Available'
      });
    }

    // Update user role from customer to provider
    const user = await User.findById(req.user._id);
    user.role = 'provider';
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Become provider error:', error);
    res.status(500).json({ message: error.message || 'Server error upgrading to provider' });
  }
};

module.exports = {
  registerUser,
  registerProvider,
  loginUser,
  getMe,
  becomeProvider
};
