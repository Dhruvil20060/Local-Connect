const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    // Array of candidate provider user ObjectIds ordered by match score
    candidateProviders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    offeredTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    offeredAt: {
      type: Date,
      default: null
    },
    offerExpiresAt: {
      type: Date,
      default: null
    },
    rejectedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    service: {
      type: String,
      required: [true, 'Service category is required'],
      trim: true
    },
    problemDescription: {
      type: String,
      required: [true, 'Problem description is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Service address is required'],
      trim: true
    },
    preferredDate: {
      type: String,
      required: [true, 'Preferred date is required'],
      trim: true
    },
    preferredTime: {
      type: String,
      required: [true, 'Preferred time is required'],
      trim: true
    },
    visitCharge: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'OFFERED',
        'ACCEPTED',
        'REJECTED',
        'CANCELLED_BY_CUSTOMER',
        'CANCELLED_BY_PROVIDER',
        'IN_PROGRESS',
        'COMPLETED',
        'CLOSED'
      ],
      default: 'PENDING'
    },
    paymentStatus: {
      type: String,
      enum: [
        'NONE',
        'PAYMENT_PENDING',
        'PAYMENT_SENT',
        'PAYMENT_RECEIVED'
      ],
      default: 'NONE'
    },
    paymentAmount: {
      type: Number,
      default: 0
    },
    acceptedAt: {
      type: Date,
      default: null
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    paymentSentAt: {
      type: Date,
      default: null
    },
    paymentReceivedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
