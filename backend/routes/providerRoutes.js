const express = require('express');
const router = express.Router();
const {
  getCategories,
  getProviders,
  getProviderById,
  getMyProviderProfile,
  updateAvailability,
  updateProfile
} = require('../controllers/providerController');
const { protect, providerOnly } = require('../middleware/authMiddleware');

router.get('/categories', getCategories);
router.get('/', getProviders);
router.get('/profile/me', protect, providerOnly, getMyProviderProfile);
router.patch('/availability', protect, providerOnly, updateAvailability);
router.put('/profile', protect, providerOnly, updateProfile);
router.get('/:id', getProviderById);

module.exports = router;
