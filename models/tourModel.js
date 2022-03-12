const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'A tour must have a unique name'],
    unique: true,
    trim: true,
  },
  duration: {
    type: Number,
    require: [true, `A tour must have a duration`],
  },
  difficulty: {
    type: String,
    require: [true, `A tour must have a difficulty`],
    trim: true,
  },

  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    require: [true, 'A tour must have a price'],
  },
  summary: {
    type: String,
    require: [true, 'A tour must have a summary'],
    trim: true,
  },
  description: {
    type: String,
    require: [true, 'A tour must have a description'],
    trim: true,
  },
  imageCover: {
    type: String,
  },
  images: [String],
  startDates: [String],
  createdAt: { type: Date, default: Date.now() },
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
