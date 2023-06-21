const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      validate: {
        validator: function (val) {
          return val <= 5 && val >= 0;
        },
        message: 'rating value must be between 0 and 5',
      },
      required: true,
      set: (val) => Math.round(val * 10) / 10,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'review must belong to tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'review must belong to user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function () {
  this.populate({
    path: 'tour',
    select: 'name',
  }).populate({
    path: 'user',
    select: 'name photo',
  });
});

reviewSchema.statics.calcAvarageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.indexes({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^findOneAnd/, function (next) {
  this.r = this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, function () {
  this.r.constructor.calcAvarageRatings(this.r.tour);
});

reviewSchema.post('save', function () {
  this.constructor.calcAvarageRatings(this.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
