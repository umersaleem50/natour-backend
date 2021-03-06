const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
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
    slug: String,
    difficulty: {
      type: String,
      require: [true, `A tour must have a difficulty`],
      trim: true,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'A tour can be easy, medium or hard',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'A tour must have rating equal or greater than 1'],
      max: [5, 'A tour must have rating equal or less than 5'],
      set: (val) => Math.round(val * 10) / 10,
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
    maxGroupSize: Number,
    createdAt: { type: Date, default: Date.now(), select: false },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      description: String,
      address: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        description: String,
        address: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// tourSchema.pre('save', async function (next) {
//   const guidePromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidePromises);
//   next();
// });

tourSchema.index({ price: 1, ratingAverage: -1 });
tourSchema.index({ slug: 1 });

tourSchema.index({ startLocation: '2dSphere' });

// Virtual Populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true, trim: true });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

// AGGREGATION MIDDLEWARE FOR MONGOS
// THIS WILL ADD $MATCH TO EVERY AGGREGATION , DISABILING IT TO BECAUSE $GEONEAR NEED ALWAYS THE FIRST AGGREGATION

// tourSchema.pre('aggregate', function (next) {
//   this.pipeline.unshift({ $match: { secretTour: { $ne: true } } });

//   console.log(this.pipeline);

//   next();
// });

//so there are also pre and post hocks on mongodb

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
