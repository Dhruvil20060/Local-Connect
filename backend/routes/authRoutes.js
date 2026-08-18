const express = require('express');
const router = express.Router();
const {
  registerUser,
  registerProvider,
  loginUser,
  getMe,
  becomeProvider
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/register-provider', registerProvider);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/become-provider', protect, becomeProvider);

module.exports = router;
