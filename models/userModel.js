const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'user must have name'],
  },
  email: {
    type: String,
    required: [true, 'user must have e-mail'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'this is not valid email'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'user must have password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'user must have passwordConfirm'],
    validate: {
      validator: function (el) {
        return this.password === el;
      },
      message: 'the password and th passwordConfrm must be the same',
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'guide', 'lead-guide', 'user'],
      message:
        'the role must be one of the following: admin, guide, lead-guide, user ',
    },
    default: 'user',
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetTokenExpiration: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  userPassword,
  HashedPassword
) {
  return await bcrypt.compare(userPassword, HashedPassword);
};

// it should retun false if the token valid in terms of changePassword
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const ChangePasswordtimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimeStamp < ChangePasswordtimestamp;
  }
  return false;
};

userSchema.methods.generateRandomResetPassword = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetTokenExpiration = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
