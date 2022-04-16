const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Please tell us about the expriernce of the tour.'],
    },
    rating: {
      type: Number,
      max: [5, 'The rating should be less than or equal to 5'],
      min: [1, 'The rating should be greater than or equal to 1'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
    },
    createAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const reviewModel = mongoose.model('Review', reviewSchema);

module.exports = reviewModel;
