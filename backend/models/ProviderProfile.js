const mongoose = require('mongoose');

const providerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    profession: {
      type: String,
      required: [true, 'Profession is required'],
      trim: true
    },
    experience: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience cannot be negative']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    serviceArea: {
      type: String,
      required: [true, 'Service area is required'],
      trim: true
    },
    visitCharge: {
      type: Number,
      required: [true, 'Visit charge is required'],
      min: [0, 'Visit charge cannot be negative']
    },
    profileImage: {
      type: String,
      default: ''
    },
    availability: {
      type: String,
      enum: ['Available', 'Busy', 'Unavailable'],
      default: 'Available'
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    averageRating: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const ProviderProfile = mongoose.model('ProviderProfile', providerProfileSchema);

module.exports = ProviderProfile;
