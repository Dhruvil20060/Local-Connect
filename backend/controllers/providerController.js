const ProviderProfile = require('../models/ProviderProfile');
const User = require('../models/User');
const Review = require('../models/Review');
const Category = require('../models/Category');

// @desc    Get all active service categories
// @route   GET /api/providers/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: error.message || 'Server error fetching categories' });
  }
};

// @desc    Get service providers with filters and sorting
// @route   GET /api/providers
// @access  Public
const getProviders = async (req, res) => {
  try {
    const { search, service, city, rating, sortBy } = req.query;

    // 1. Fetch active provider users
    const activeUsers = await User.find({ role: 'provider', isActive: true }).select('-password');
    const activeUserIds = activeUsers.map(u => u._id);

    // Build filter query for ProviderProfile (active user + verified provider)
    const filterQuery = { userId: { $in: activeUserIds }, isVerified: true };

    if (service && service !== 'All' && service.trim() !== '') {
      filterQuery.profession = new RegExp(`^${service.trim()}$`, 'i');
    }

    if (city && city.trim() !== '') {
      filterQuery.$or = [
        { city: new RegExp(city.trim(), 'i') },
        { serviceArea: new RegExp(city.trim(), 'i') }
      ];
    }

    if (rating && !isNaN(Number(rating)) && Number(rating) > 0) {
      filterQuery.averageRating = { $gte: Number(rating) };
    }

    // Determine sort option
    let sortOption = { averageRating: -1 }; // default top rated
    if (sortBy === 'experience') {
      sortOption = { experience: -1 };
    } else if (sortBy === 'visitChargeLow') {
      sortOption = { visitCharge: 1 };
    } else if (sortBy === 'visitChargeHigh') {
      sortOption = { visitCharge: -1 };
    } else if (sortBy === 'rating') {
      sortOption = { averageRating: -1 };
    }

    let profiles = await ProviderProfile.find(filterQuery)
      .populate('userId', 'name email phone')
      .sort(sortOption);

    // If search keyword provided, filter by provider name, profession, or description
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      profiles = profiles.filter(p => {
        const userName = p.userId?.name?.toLowerCase() || '';
        const profession = p.profession?.toLowerCase() || '';
        const description = p.description?.toLowerCase() || '';
        const city = p.city?.toLowerCase() || '';
        const serviceArea = p.serviceArea?.toLowerCase() || '';
        return (
          userName.includes(q) ||
          profession.includes(q) ||
          description.includes(q) ||
          city.includes(q) ||
          serviceArea.includes(q)
        );
      });
    }

    const formatted = profiles.map(p => ({
      _id: p._id,
      userId: p.userId
        ? {
            _id: p.userId._id,
            name: p.userId.name,
            email: p.userId.email,
            phone: p.userId.phone
          }
        : null,
      profession: p.profession,
      experience: p.experience,
      city: p.city,
      serviceArea: p.serviceArea,
      visitCharge: p.visitCharge,
      description: p.description,
      profileImage: p.profileImage,
      availability: p.availability,
      isVerified: p.isVerified,
      averageRating: p.averageRating,
      totalReviews: p.totalReviews
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ message: error.message || 'Server error fetching providers' });
  }
};

// @desc    Get single provider by ID (Profile _id or User _id) with reviews
// @route   GET /api/providers/:id
// @access  Public
const getProviderById = async (req, res) => {
  try {
    const { id } = req.params;

    let profile = await ProviderProfile.findById(id).populate('userId', 'name email phone isActive');
    if (!profile) {
      profile = await ProviderProfile.findOne({ userId: id }).populate('userId', 'name email phone isActive');
    }

    if (!profile || !profile.userId || profile.userId.isActive === false) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    // Fetch reviews for this provider
    const reviews = await Review.find({ providerId: profile.userId._id })
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const sumRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalReviews > 0 ? parseFloat((sumRatings / totalReviews).toFixed(1)) : 0;

    const formattedReviews = reviews.map(r => ({
      _id: r._id,
      bookingId: r.bookingId,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      customerId: r.customerId ? { _id: r.customerId._id, name: r.customerId.name } : { name: 'Customer' }
    }));

    const result = {
      _id: profile._id,
      userId: {
        _id: profile.userId._id,
        name: profile.userId.name,
        email: profile.userId.email,
        phone: profile.userId.phone
      },
      profession: profile.profession,
      experience: profile.experience,
      city: profile.city,
      serviceArea: profile.serviceArea,
      visitCharge: profile.visitCharge,
      description: profile.description,
      profileImage: profile.profileImage,
      availability: profile.availability,
      isVerified: profile.isVerified,
      averageRating,
      totalReviews,
      reviews: formattedReviews
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching provider by ID:', error);
    res.status(500).json({ message: error.message || 'Server error fetching provider details' });
  }
};

// @desc    Get logged-in provider profile
// @route   GET /api/providers/profile/me
// @access  Private (Provider)
const getMyProviderProfile = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ userId: req.user._id }).populate('userId', 'name email phone');

    if (!profile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    // Dynamically calculate rating & total reviews from MongoDB Review collection
    const reviews = await Review.find({ providerId: req.user._id });
    const totalReviews = reviews.length;
    const sumRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalReviews > 0 ? parseFloat((sumRatings / totalReviews).toFixed(1)) : 0;

    if (profile.averageRating !== averageRating || profile.totalReviews !== totalReviews) {
      profile.averageRating = averageRating;
      profile.totalReviews = totalReviews;
      await profile.save();
    }

    res.json({
      _id: profile._id,
      userId: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone
      },
      profession: profile.profession,
      experience: profile.experience,
      city: profile.city,
      serviceArea: profile.serviceArea,
      visitCharge: profile.visitCharge,
      description: profile.description,
      profileImage: profile.profileImage,
      availability: profile.availability,
      isVerified: profile.isVerified,
      averageRating,
      totalReviews
    });
  } catch (error) {
    console.error('Error fetching my provider profile:', error);
    res.status(500).json({ message: error.message || 'Server error fetching provider profile' });
  }
};

// @desc    Update provider availability status
// @route   PATCH /api/providers/availability
// @access  Private (Provider)
const updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    if (!availability || !['Available', 'Busy', 'Unavailable'].includes(availability)) {
      return res.status(400).json({ message: 'Invalid availability status. Must be Available, Busy, or Unavailable' });
    }

    const profile = await ProviderProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    profile.availability = availability;
    await profile.save();

    res.json({
      _id: profile._id,
      availability: profile.availability
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ message: error.message || 'Server error updating availability' });
  }
};

// @desc    Update provider profile details
// @route   PUT /api/providers/profile
// @access  Private (Provider)
const updateProfile = async (req, res) => {
  try {
    const { profession, experience, city, serviceArea, visitCharge, description, profileImage } = req.body;

    let profile = await ProviderProfile.findOne({ userId: req.user._id });

    if (!profile) {
      profile = new ProviderProfile({ userId: req.user._id });
    }

    if (profession) profile.profession = profession;
    if (experience !== undefined) profile.experience = Number(experience);
    if (city) profile.city = city;
    if (serviceArea) profile.serviceArea = serviceArea;
    if (visitCharge !== undefined) profile.visitCharge = Number(visitCharge);
    if (description !== undefined) profile.description = description;
    if (profileImage) profile.profileImage = profileImage;

    await profile.save();

    res.json({
      _id: profile._id,
      userId: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone
      },
      profession: profile.profession,
      experience: profile.experience,
      city: profile.city,
      serviceArea: profile.serviceArea,
      visitCharge: profile.visitCharge,
      description: profile.description,
      profileImage: profile.profileImage,
      availability: profile.availability,
      isVerified: profile.isVerified,
      averageRating: profile.averageRating,
      totalReviews: profile.totalReviews
    });
  } catch (error) {
    console.error('Error updating provider profile:', error);
    res.status(500).json({ message: error.message || 'Server error updating profile' });
  }
};

module.exports = {
  getCategories,
  getProviders,
  getProviderById,
  getMyProviderProfile,
  updateAvailability,
  updateProfile
};
