const Booking = require('../models/Booking');
const ProviderProfile = require('../models/ProviderProfile');
const User = require('../models/User');

const OFFER_TIMEOUT_SECONDS = parseInt(process.env.BOOKING_OFFER_TIMEOUT) || 60;

// Helper to check date/time slot validity
const validateBookingDateTime = (preferredDate, preferredTime) => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // 1. Date cannot be before today
  if (preferredDate < todayStr) {
    return { valid: false, message: 'Preferred date cannot be in the past' };
  }

  // 2. If date is today, check if preferred time slot is already past
  if (preferredDate === todayStr && preferredTime) {
    const currentHour = today.getHours();
    const currentMinutes = today.getMinutes();

    // Map common slot strings to their start/end hour in 24h format
    let slotEndHour = 24;
    if (preferredTime.includes('09:00 AM')) slotEndHour = 11;
    else if (preferredTime.includes('11:00 AM')) slotEndHour = 13;
    else if (preferredTime.includes('02:00 PM')) slotEndHour = 16;
    else if (preferredTime.includes('04:00 PM')) slotEndHour = 18;

    if (currentHour >= slotEndHour) {
      return { valid: false, message: 'The selected time slot has already passed for today. Please select a future time slot.' };
    }
  }

  return { valid: true };
};

// Helper algorithm: Calculate Provider Matching Score
const calculateMatchingScore = (providerProfile, customerCity, requestedService) => {
  let score = 0;

  // 1. Location / Distance Match (40% weight)
  const provCity = (providerProfile.city || '').toLowerCase();
  const provArea = (providerProfile.serviceArea || '').toLowerCase();
  const custCity = (customerCity || '').toLowerCase();

  let locationScore = 0;
  if (provCity && custCity && (provCity.includes(custCity) || custCity.includes(provCity))) {
    locationScore = 100;
  } else if (provArea && custCity && provArea.includes(custCity)) {
    locationScore = 80;
  } else {
    locationScore = 30; // fallback location match
  }
  score += locationScore * 0.40;

  // 2. Provider Rating (25% weight)
  const rating = providerProfile.averageRating || 4.5;
  const ratingScore = (rating / 5) * 100;
  score += ratingScore * 0.25;

  // 3. Availability (20% weight)
  let availabilityScore = 0;
  if (providerProfile.availability === 'Available') availabilityScore = 100;
  else if (providerProfile.availability === 'Busy') availabilityScore = 30;
  else availabilityScore = 0;
  score += availabilityScore * 0.20;

  // 4. Visit Charge (15% weight) - fairer/cheaper visit charge scores higher
  const charge = providerProfile.visitCharge || 200;
  const chargeScore = Math.max(0, 100 - Math.min(100, (charge / 500) * 100));
  score += chargeScore * 0.15;

  return score;
};

// Helper: Auto-advance expired booking offers
const checkAndAdvanceExpiredOffers = async (bookings) => {
  const now = new Date();

  for (const b of bookings) {
    if (b.status === 'OFFERED' && b.offerExpiresAt && b.offerExpiresAt < now) {
      // Offer expired for b.offeredTo
      const expiredProviderId = b.offeredTo;
      if (expiredProviderId && !b.rejectedBy.some(id => id.toString() === expiredProviderId.toString())) {
        b.rejectedBy.push(expiredProviderId);
      }

      // Find next provider in candidateProviders not in rejectedBy
      const nextCandidate = b.candidateProviders.find(
        cp => !b.rejectedBy.some(r => r.toString() === cp.toString())
      );

      if (nextCandidate) {
        b.offeredTo = nextCandidate;
        b.offeredAt = new Date();
        b.offerExpiresAt = new Date(Date.now() + OFFER_TIMEOUT_SECONDS * 1000);
        b.status = 'OFFERED';
      } else {
        b.offeredTo = null;
        b.offerExpiresAt = null;
        b.status = 'REJECTED';
      }

      await b.save();
    }
  }
};

// @desc    Create a new booking request & trigger Provider Dispatching
// @route   POST /api/bookings
// @access  Private (Customer)
const createBooking = async (req, res) => {
  try {
    const { providerId, service, problemDescription, address, preferredDate, preferredTime } = req.body;

    // 1. Validate required fields
    if (!service || !problemDescription || !address || !preferredDate || !preferredTime) {
      return res.status(400).json({
        message: 'Please provide all required fields: service, problemDescription, address, preferredDate, preferredTime'
      });
    }

    // 2. Validate Date and Time Slot
    const dateTimeCheck = validateBookingDateTime(preferredDate, preferredTime);
    if (!dateTimeCheck.valid) {
      return res.status(400).json({ message: dateTimeCheck.message });
    }

    // 3. Extract city from address or default
    const addressParts = address.split(',');
    const customerCity = addressParts[addressParts.length - 1] ? addressParts[addressParts.length - 1].trim() : address;

    // 4. Find suitable active & verified providers for dispatch
    const activeProviderUsers = await User.find({ role: 'provider', isActive: true });
    const activeUserIds = activeProviderUsers.map(u => u._id);

    const providerProfiles = await ProviderProfile.find({
      userId: { $in: activeUserIds },
      profession: new RegExp(`^${service.trim()}$`, 'i'),
      availability: { $ne: 'Unavailable' }
    }).populate('userId', 'name email phone isActive');

    if (providerProfiles.length === 0) {
      return res.status(404).json({
        message: `No available service providers found for ${service} at this time.`
      });
    }

    // Rank candidate providers using Provider Matching Score
    let candidateScores = providerProfiles.map(profile => {
      const score = calculateMatchingScore(profile, customerCity, service);
      return {
        userId: profile.userId._id,
        profile,
        score
      };
    });

    // If specific provider was explicitly requested, bump their score
    if (providerId) {
      candidateScores.forEach(c => {
        if (c.profile._id.toString() === providerId.toString() || c.userId.toString() === providerId.toString()) {
          c.score += 1000; // Prioritize requested provider
        }
      });
    }

    candidateScores.sort((a, b) => b.score - a.score);

    const candidateProviderUserIds = candidateScores.map(c => c.userId);
    const topProvider = candidateScores[0];

    const offerExpiresAt = new Date(Date.now() + OFFER_TIMEOUT_SECONDS * 1000);

    // 5. Create Booking Document in MongoDB
    const booking = await Booking.create({
      customerId: req.user._id,
      candidateProviders: candidateProviderUserIds,
      offeredTo: topProvider.userId,
      offeredAt: new Date(),
      offerExpiresAt,
      service,
      problemDescription: problemDescription.trim(),
      address: address.trim(),
      preferredDate,
      preferredTime,
      visitCharge: topProvider.profile.visitCharge || 199,
      status: 'OFFERED'
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('customerId', 'name email phone')
      .populate('offeredTo', 'name email phone');

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: error.message || 'Server error creating booking request' });
  }
};

// @desc    Get customer's bookings
// @route   GET /api/bookings/my
// @access  Private (Customer)
const getCustomerBookings = async (req, res) => {
  try {
    let bookings = await Booking.find({ customerId: req.user._id })
      .populate('customerId', 'name email phone')
      .populate('providerId', 'name email phone')
      .populate('offeredTo', 'name email phone')
      .sort({ createdAt: -1 });

    await checkAndAdvanceExpiredOffers(bookings);

    // Refetch refreshed state if offers expired
    bookings = await Booking.find({ customerId: req.user._id })
      .populate('customerId', 'name email phone')
      .populate('providerId', 'name email phone')
      .populate('offeredTo', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    res.status(500).json({ message: error.message || 'Server error fetching bookings' });
  }
};

// @desc    Get provider's requests and assigned jobs
// @route   GET /api/bookings/provider
// @access  Private (Provider)
const getProviderBookings = async (req, res) => {
  try {
    // 1. Fetch all bookings offered to this provider or accepted by this provider
    let allOffered = await Booking.find({
      $or: [
        { offeredTo: req.user._id, status: 'OFFERED' },
        { providerId: req.user._id }
      ]
    })
      .populate('customerId', 'name email phone')
      .populate('providerId', 'name email phone')
      .sort({ createdAt: -1 });

    await checkAndAdvanceExpiredOffers(allOffered);

    // 2. Refetch after expiry checks
    const activeBookings = await Booking.find({
      $or: [
        { offeredTo: req.user._id, status: 'OFFERED' },
        { providerId: req.user._id }
      ]
    })
      .populate('customerId', 'name email phone')
      .populate('providerId', 'name email phone')
      .sort({ createdAt: -1 });

    // Format output with clear status flags for Provider UI
    const formatted = activeBookings.map(b => {
      const isNewRequest = b.status === 'OFFERED' && b.offeredTo && b.offeredTo.toString() === req.user._id.toString();
      return {
        _id: b._id,
        customerId: b.customerId,
        providerId: b.providerId,
        service: b.service,
        problemDescription: b.problemDescription,
        address: b.address,
        preferredDate: b.preferredDate,
        preferredTime: b.preferredTime,
        visitCharge: b.visitCharge,
        status: isNewRequest ? 'Requested' : b.status,
        rawStatus: b.status,
        paymentStatus: b.paymentStatus || 'NONE',
        paymentAmount: b.paymentAmount || b.visitCharge || 199,
        paymentSentAt: b.paymentSentAt,
        paymentReceivedAt: b.paymentReceivedAt,
        acceptedAt: b.acceptedAt,
        startedAt: b.startedAt,
        completedAt: b.completedAt,
        createdAt: b.createdAt
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching provider bookings:', error);
    res.status(500).json({ message: error.message || 'Server error fetching provider jobs' });
  }
};

// @desc    Accept a service request (Atomic accept / Race condition protection)
// @route   PATCH /api/bookings/:id/accept
// @access  Private (Provider)
const acceptBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    // Check expiry first
    const existing = await Booking.findById(bookingId);
    if (!existing) {
      return res.status(404).json({ message: 'Booking request not found' });
    }

    if (existing.offerExpiresAt && existing.offerExpiresAt < new Date()) {
      await checkAndAdvanceExpiredOffers([existing]);
      return res.status(400).json({
        message: 'This service offer has expired and was reassigned to another provider.'
      });
    }

    // Atomic findOneAndUpdate ensuring double-accept protection
    const updated = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        $or: [
          { offeredTo: req.user._id, status: 'OFFERED' },
          { status: 'PENDING' }
        ]
      },
      {
        $set: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
          providerId: req.user._id,
          offeredTo: req.user._id,
          offerExpiresAt: null
        }
      },
      { new: true }
    ).populate('customerId providerId');

    if (!updated) {
      return res.status(400).json({
        message: 'This service request has already been accepted by another provider or is no longer available.'
      });
    }

    res.json({
      _id: updated._id,
      status: 'Accepted',
      message: 'Service request accepted successfully!',
      booking: updated
    });
  } catch (error) {
    console.error('Error accepting booking:', error);
    res.status(500).json({ message: error.message || 'Server error accepting booking request' });
  }
};

// @desc    Reject a service request (Triggers fallback dispatch to next provider)
// @route   PATCH /api/bookings/:id/reject
// @access  Private (Provider)
const rejectBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking request not found' });
    }

    if (!booking.rejectedBy.some(r => r.toString() === req.user._id.toString())) {
      booking.rejectedBy.push(req.user._id);
    }

    // Find next candidate provider not in rejectedBy
    const nextCandidate = booking.candidateProviders.find(
      cp => !booking.rejectedBy.some(r => r.toString() === cp.toString())
    );

    if (nextCandidate) {
      booking.offeredTo = nextCandidate;
      booking.offeredAt = new Date();
      booking.offerExpiresAt = new Date(Date.now() + OFFER_TIMEOUT_SECONDS * 1000);
      booking.status = 'OFFERED';
    } else {
      booking.offeredTo = null;
      booking.offerExpiresAt = null;
      booking.status = 'REJECTED';
    }

    await booking.save();

    res.json({
      _id: booking._id,
      status: 'Rejected',
      message: nextCandidate
        ? 'Request rejected. Passed to next fallback provider.'
        : 'Request rejected. No further providers available.'
    });
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(500).json({ message: error.message || 'Server error rejecting booking' });
  }
};

// @desc    Start service (Mark job In Progress)
// @route   PATCH /api/bookings/:id/start
// @access  Private (Provider)
const startBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.providerId?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    booking.status = 'IN_PROGRESS';
    booking.startedAt = new Date();
    await booking.save();

    res.json({
      _id: booking._id,
      status: 'In Progress',
      message: 'Service marked as In Progress'
    });
  } catch (error) {
    console.error('Error starting booking:', error);
    res.status(500).json({ message: error.message || 'Server error starting service' });
  }
};

// @desc    Complete service
// @route   PATCH /api/bookings/:id/complete
// @access  Private (Provider)
const completeBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.providerId?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    booking.status = 'COMPLETED';
    booking.completedAt = new Date();
    booking.paymentStatus = 'PAYMENT_PENDING';
    booking.paymentAmount = booking.visitCharge || 199;
    await booking.save();

    res.json({
      _id: booking._id,
      status: 'Completed',
      paymentStatus: 'PAYMENT_PENDING',
      message: 'Service marked as Completed. Payment pending from customer.'
    });
  } catch (error) {
    console.error('Error completing booking:', error);
    res.status(500).json({ message: error.message || 'Server error completing service' });
  }
};

// @desc    Customer marks payment as sent after scanning QR code
// @route   PATCH /api/bookings/:id/pay-sent
// @access  Private (Customer)
const markPaymentSent = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.customerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update payment status' });
    }

    booking.paymentStatus = 'PAYMENT_SENT';
    booking.paymentSentAt = new Date();
    await booking.save();

    res.json({
      _id: booking._id,
      paymentStatus: 'PAYMENT_SENT',
      message: 'Payment marked as sent. Waiting for provider confirmation.'
    });
  } catch (error) {
    console.error('Error marking payment sent:', error);
    res.status(500).json({ message: error.message || 'Server error marking payment sent' });
  }
};

// @desc    Provider confirms payment received & closes booking
// @route   PATCH /api/bookings/:id/confirm-payment
// @access  Private (Provider)
const confirmPaymentReceived = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.providerId?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to confirm payment for this booking' });
    }

    booking.paymentStatus = 'PAYMENT_RECEIVED';
    booking.paymentReceivedAt = new Date();
    booking.status = 'CLOSED';
    await booking.save();

    res.json({
      _id: booking._id,
      status: 'CLOSED',
      paymentStatus: 'PAYMENT_RECEIVED',
      message: 'Payment confirmed received. Service booking is now closed.'
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: error.message || 'Server error confirming payment' });
  }
};

// @desc    Cancel booking (Customer)
// @route   PATCH /api/bookings/:id/cancel
// @access  Private (Customer)
const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.customerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (['COMPLETED', 'CLOSED'].includes(booking.status)) {
      return res.status(400).json({ message: 'Completed or closed services cannot be cancelled' });
    }

    booking.status = 'CANCELLED_BY_CUSTOMER';
    await booking.save();

    res.json({
      _id: booking._id,
      status: 'Cancelled',
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: error.message || 'Server error cancelling booking' });
  }
};

// @desc    Generic status updater endpoint (supports existing frontend calls)
// @route   PATCH /api/bookings/:id/status
// @access  Private
const updateStatus = async (req, res) => {
  const { status } = req.body;
  if (status === 'Accepted') return acceptBooking(req, res);
  if (status === 'Rejected') return rejectBooking(req, res);
  if (status === 'In Progress') return startBooking(req, res);
  if (status === 'Completed') return completeBooking(req, res);
  if (status === 'Payment Sent' || status === 'PAYMENT_SENT') return markPaymentSent(req, res);
  if (status === 'Payment Received' || status === 'PAYMENT_RECEIVED' || status === 'Closed' || status === 'CLOSED') return confirmPaymentReceived(req, res);
  if (status === 'Cancelled' || status === 'Cancelled_By_Customer') return cancelBooking(req, res);

  return res.status(400).json({ message: 'Invalid status update requested' });
};

module.exports = {
  createBooking,
  getCustomerBookings,
  getProviderBookings,
  acceptBooking,
  rejectBooking,
  startBooking,
  completeBooking,
  markPaymentSent,
  confirmPaymentReceived,
  cancelBooking,
  updateStatus
};
