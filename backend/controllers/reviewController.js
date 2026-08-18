const Review = require('../models/Review');
const Booking = require('../models/Booking');
const ProviderProfile = require('../models/ProviderProfile');

// @desc    Create a new review for a completed service booking
// @route   POST /api/reviews
// @access  Private (Customer)
const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ message: 'Booking ID and rating are required' });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    // 1. Find Booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // 2. Check customer ownership
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only review services booked by you' });
    }

    // 3. Verify status is COMPLETED or CLOSED
    if (!['COMPLETED', 'CLOSED'].includes(booking.status)) {
      return res.status(400).json({ message: 'You can only review services that have been completed' });
    }

    // 4. Check for duplicate review
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'A review has already been submitted for this booking' });
    }

    // 5. Identify provider user ID
    const providerUserId = booking.providerId || booking.offeredTo;
    if (!providerUserId) {
      return res.status(400).json({ message: 'No service provider associated with this booking' });
    }

    // 6. Create Review document
    const review = await Review.create({
      bookingId,
      customerId: req.user._id,
      providerId: providerUserId,
      rating: numRating,
      comment: comment ? comment.trim() : ''
    });

    // 7. Recalculate provider average rating and total reviews in ProviderProfile
    const providerReviews = await Review.find({ providerId: providerUserId });
    const totalReviews = providerReviews.length;
    const sumRatings = providerReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalReviews > 0 ? parseFloat((sumRatings / totalReviews).toFixed(1)) : 0;

    await ProviderProfile.findOneAndUpdate(
      { userId: providerUserId },
      {
        averageRating,
        totalReviews
      }
    );

    const populatedReview = await Review.findById(review._id)
      .populate('customerId', 'name email')
      .populate('providerId', 'name email');

    res.status(201).json(populatedReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: error.message || 'Server error creating review' });
  }
};

// @desc    Get reviews for a specific provider
// @route   GET /api/reviews/provider/:providerId
// @access  Public
const getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;

    let targetUserId = providerId;
    const profile = await ProviderProfile.findById(providerId);
    if (profile) {
      targetUserId = profile.userId;
    }

    const reviews = await Review.find({ providerId: targetUserId })
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 });

    const formatted = reviews.map(r => ({
      _id: r._id,
      bookingId: r.bookingId,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      customerId: r.customerId ? { _id: r.customerId._id, name: r.customerId.name } : { name: 'Customer' }
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching provider reviews:', error);
    res.status(500).json({ message: error.message || 'Server error fetching provider reviews' });
  }
};

module.exports = {
  createReview,
  getProviderReviews
};
