const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  updateUserStatus,
  getAllProviders,
  toggleProviderVerification,
  getAllBookings,
  getAllReviews,
  deleteReview
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/stats', protect, adminOnly, getAdminStats);
router.get('/users', protect, adminOnly, getAllUsers);
router.patch('/users/:id/status', protect, adminOnly, updateUserStatus);
router.put('/users/:id/toggle-active', protect, adminOnly, updateUserStatus);
router.get('/providers', protect, adminOnly, getAllProviders);
router.put('/providers/:id/toggle-verify', protect, adminOnly, toggleProviderVerification);
router.get('/bookings', protect, adminOnly, getAllBookings);
router.get('/reviews', protect, adminOnly, getAllReviews);
router.delete('/reviews/:id', protect, adminOnly, deleteReview);

module.exports = router;

