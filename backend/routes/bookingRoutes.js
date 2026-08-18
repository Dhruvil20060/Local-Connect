const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/bookingController');
const { protect, customerOnly, providerOnly } = require('../middleware/authMiddleware');

router.post('/', protect, customerOnly, createBooking);
router.get('/my', protect, getCustomerBookings);
router.get('/provider', protect, providerOnly, getProviderBookings);
router.patch('/:id/accept', protect, providerOnly, acceptBooking);
router.patch('/:id/reject', protect, providerOnly, rejectBooking);
router.patch('/:id/start', protect, providerOnly, startBooking);
router.patch('/:id/complete', protect, providerOnly, completeBooking);
router.patch('/:id/pay-sent', protect, customerOnly, markPaymentSent);
router.patch('/:id/confirm-payment', protect, providerOnly, confirmPaymentReceived);
router.patch('/:id/cancel', protect, cancelBooking);
router.patch('/:id/status', protect, updateStatus);

module.exports = router;
