const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'A tour must have a unique name'],
    unique: true,
    maxLength: [40, 'A tour name must have less or equal to 40 characters!'],
    minLength: [10, 'A tour name must have more or equal to 10 characters!'],
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
    enum: {
      values: ['easy', 'medium', 'hard'],
      message: 'A tour can be easy, medium or hard',
    },
  },

  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'A tour must have rating equal or greater than 1'],
    max: [5, 'A tour must have rating equal or less than 5'],
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
  createdAt: { type: Date, default: Date.now(), select: false },
});

//so there are also pre and post hocks on mongodb

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
