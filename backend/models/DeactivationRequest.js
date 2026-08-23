const mongoose = require('mongoose');

const deactivationRequestSchema = new mongoose.Schema(
  {
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requestType: {
      type: String,
      enum: ['DEACTIVATE', 'ACTIVATE'],
      default: 'DEACTIVATE'
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    },
    reason: {
      type: String,
      default: 'Deactivation requested by sub-admin'
    }
  },
  {
    timestamps: true
  }
);

const DeactivationRequest = mongoose.model('DeactivationRequest', deactivationRequestSchema);

module.exports = DeactivationRequest;
