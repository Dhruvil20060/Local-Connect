const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const DeactivationRequest = require('../models/DeactivationRequest');

// @desc    Get Admin Dashboard Stats from real MongoDB data
// @route   GET /api/admin/stats
// @access  Private (Admin & Sub-Admin)
const getAdminStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const activeProviderUsers = await User.find({ role: 'provider', isActive: true }).select('_id');
    const activeProviderIds = activeProviderUsers.map(u => u._id);
    const totalProviders = await ProviderProfile.countDocuments({ userId: { $in: activeProviderIds } });
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: { $in: ['COMPLETED', 'CLOSED'] } });
    const totalReviews = await Review.countDocuments();
    const pendingDeactivationRequests = await DeactivationRequest.countDocuments({ status: 'PENDING' });

    res.json({
      totalCustomers,
      totalProviders,
      totalBookings,
      completedBookings,
      totalReviews,
      pendingDeactivationRequests
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: error.message || 'Server error fetching admin stats' });
  }
};

// @desc    Get all users from MongoDB Users collection
// @route   GET /api/admin/users
// @access  Private (Admin & Sub-Admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    const pendingRequests = await DeactivationRequest.find({ status: 'PENDING' });
    const pendingUserIds = new Set(pendingRequests.map((r) => r.targetUser.toString()));

    const formattedUsers = users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      isActive: u.isActive !== undefined ? u.isActive : true,
      deactivationPending: pendingUserIds.has(u._id.toString()),
      createdAt: u.createdAt
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: error.message || 'Server error fetching users' });
  }
};

// @desc    Update / Toggle User active status (Activate / Deactivate or Request Deactivation if Sub-Admin)
// @route   PATCH /api/admin/users/:id/status
// @access  Private (Admin & Sub-Admin)
const updateUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;

    // Admin / Sub-Admin account cannot deactivate itself
    if (req.user && req.user._id.toString() === userId.toString()) {
      return res.status(400).json({ message: 'Admin account cannot deactivate itself' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin' || user.role === 'subadmin') {
      return res.status(400).json({ message: 'Admin accounts cannot be deactivated' });
    }

    let targetIsActive = user.isActive;
    if (typeof req.body.isActive === 'boolean') {
      targetIsActive = req.body.isActive;
    } else {
      targetIsActive = !user.isActive;
    }

    // If sub-admin attempts to DEACTIVATE an active user:
    if (req.user.role === 'subadmin' && !targetIsActive) {
      const existingRequest = await DeactivationRequest.findOne({
        targetUser: userId,
        status: 'PENDING'
      });

      if (existingRequest) {
        return res.status(400).json({
          message: 'A deactivation request for this user is already pending Master Admin approval',
          deactivationPending: true
        });
      }

      await DeactivationRequest.create({
        targetUser: userId,
        requestedBy: req.user._id,
        reason: req.body.reason || 'Deactivation requested by sub-admin'
      });

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        deactivationPending: true,
        message: 'Deactivation request submitted for Master Admin approval.'
      });
    }

    // Master Admin direct activation/deactivation OR Sub-Admin activating a deactivated account:
    user.isActive = targetIsActive;
    await user.save();

    if (targetIsActive === false) {
      await DeactivationRequest.updateMany(
        { targetUser: userId, status: 'PENDING' },
        { status: 'APPROVED' }
      );
    } else {
      await DeactivationRequest.updateMany(
        { targetUser: userId, status: 'PENDING' },
        { status: 'REJECTED' }
      );
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      deactivationPending: false
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: error.message || 'Server error updating user status' });
  }
};

// @desc    Get all providers from MongoDB (User role='provider' + ProviderProfile)
// @route   GET /api/admin/providers
// @access  Private (Admin & Sub-Admin)
const getAllProviders = async (req, res) => {
  try {
    const providerUsers = await User.find({ role: 'provider' }).select('-password');
    const profiles = await ProviderProfile.find();
    const pendingRequests = await DeactivationRequest.find({ status: 'PENDING' });
    const pendingUserIds = new Set(pendingRequests.map((r) => r.targetUser.toString()));

    const result = providerUsers.map((u) => {
      const profile = profiles.find((p) => p.userId.toString() === u._id.toString());
      return {
        _id: profile ? profile._id : u._id,
        userId: {
          _id: u._id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          isActive: u.isActive !== undefined ? u.isActive : true
        },
        profession: profile ? profile.profession : 'N/A',
        experience: profile ? profile.experience : 0,
        city: profile ? profile.city : 'N/A',
        serviceArea: profile ? profile.serviceArea : 'N/A',
        visitCharge: profile ? profile.visitCharge : 0,
        description: profile ? profile.description : '',
        profileImage: profile ? profile.profileImage : '',
        availability: profile ? profile.availability : 'Available',
        isVerified: profile ? profile.isVerified : false,
        averageRating: profile ? profile.averageRating : 0,
        totalReviews: profile ? profile.totalReviews : 0,
        isActive: u.isActive !== undefined ? u.isActive : true,
        deactivationPending: pendingUserIds.has(u._id.toString())
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ message: error.message || 'Server error fetching providers' });
  }
};

// @desc    Toggle Provider Verification Status
// @route   PUT /api/admin/providers/:id/toggle-verify
// @access  Private (Admin & Sub-Admin)
const toggleProviderVerification = async (req, res) => {
  try {
    let profile = await ProviderProfile.findById(req.params.id);

    if (!profile) {
      profile = await ProviderProfile.findOne({ userId: req.params.id });
    }

    if (!profile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    profile.isVerified = !profile.isVerified;
    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error('Error toggling provider verification:', error);
    res.status(500).json({ message: error.message || 'Server error toggling provider verification' });
  }
};

// @desc    Get all bookings from MongoDB
// @route   GET /api/admin/bookings
// @access  Private (Admin & Sub-Admin)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('customerId', 'name email phone')
      .populate('providerId', 'name email phone')
      .populate('offeredTo', 'name email phone')
      .sort({ createdAt: -1 });

    const formatted = bookings.map(b => ({
      _id: b._id,
      service: b.service,
      problemDescription: b.problemDescription,
      address: b.address,
      preferredDate: b.preferredDate,
      preferredTime: b.preferredTime,
      visitCharge: b.visitCharge,
      status: b.status,
      customerId: b.customerId ? { _id: b.customerId._id, name: b.customerId.name, email: b.customerId.email } : { name: 'Customer' },
      providerId: b.providerId
        ? { _id: b.providerId._id, name: b.providerId.name, email: b.providerId.email }
        : b.offeredTo
        ? { _id: b.offeredTo._id, name: b.offeredTo.name, email: b.offeredTo.email }
        : { name: 'Unassigned' },
      createdAt: b.createdAt
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: error.message || 'Server error fetching bookings' });
  }
};

// @desc    Get all reviews from MongoDB
// @route   GET /api/admin/reviews
// @access  Private (Admin & Sub-Admin)
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('customerId', 'name email')
      .populate('providerId', 'name email')
      .sort({ createdAt: -1 });

    const formatted = reviews.map(r => ({
      _id: r._id,
      bookingId: r.bookingId,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      customerId: r.customerId ? { _id: r.customerId._id, name: r.customerId.name } : { name: 'Customer' },
      providerId: r.providerId ? { _id: r.providerId._id, name: r.providerId.name } : { name: 'Provider' }
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: error.message || 'Server error fetching reviews' });
  }
};

// @desc    Delete review from MongoDB & update provider stats
// @route   DELETE /api/admin/reviews/:id
// @access  Private (Admin & Sub-Admin)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const providerUserId = review.providerId;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate provider average rating and review count
    if (providerUserId) {
      const remainingReviews = await Review.find({ providerId: providerUserId });
      const totalReviews = remainingReviews.length;
      const sumRatings = remainingReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalReviews > 0 ? parseFloat((sumRatings / totalReviews).toFixed(1)) : 0;

      await ProviderProfile.findOneAndUpdate(
        { userId: providerUserId },
        { averageRating, totalReviews }
      );
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: error.message || 'Server error deleting review' });
  }
};

// @desc    Get all deactivation requests
// @route   GET /api/admin/deactivation-requests
// @access  Private (Admin & Sub-Admin)
const getDeactivationRequests = async (req, res) => {
  try {
    const requests = await DeactivationRequest.find()
      .populate('targetUser', 'name email role isActive')
      .populate('requestedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching deactivation requests:', error);
    res.status(500).json({ message: error.message || 'Server error fetching deactivation requests' });
  }
};

// @desc    Master Admin responds to deactivation request (Approve or Reject)
// @route   PUT /api/admin/deactivation-requests/:id/respond
// @access  Private (Master Admin only)
const respondDeactivationRequest = async (req, res) => {
  try {
    const { action } = req.body;
    if (!['APPROVE', 'REJECT'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be APPROVE or REJECT' });
    }

    const deactivationReq = await DeactivationRequest.findById(req.params.id);
    if (!deactivationReq) {
      return res.status(404).json({ message: 'Deactivation request not found' });
    }

    if (action === 'APPROVE') {
      const user = await User.findById(deactivationReq.targetUser);
      if (user) {
        user.isActive = false;
        await user.save();
      }
      deactivationReq.status = 'APPROVED';
    } else {
      deactivationReq.status = 'REJECTED';
    }

    await deactivationReq.save();

    res.json({
      message: `Deactivation request ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`,
      request: deactivationReq
    });
  } catch (error) {
    console.error('Error responding to deactivation request:', error);
    res.status(500).json({ message: error.message || 'Server error responding to deactivation request' });
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  updateUserStatus,
  getAllProviders,
  toggleProviderVerification,
  getAllBookings,
  getAllReviews,
  deleteReview,
  getDeactivationRequests,
  respondDeactivationRequest
};

