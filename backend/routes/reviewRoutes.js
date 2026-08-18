const express = require('express');
const router = express.Router();
const { createReview, getProviderReviews } = require('../controllers/reviewController');
const { protect, customerOnly } = require('../middleware/authMiddleware');

router.post('/', protect, customerOnly, createReview);
router.get('/provider/:providerId', getProviderReviews);

module.exports = router;
