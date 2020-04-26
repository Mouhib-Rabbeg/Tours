const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name is required'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, 'invalid email'],
  },
  photo: { type: String, default: 'default.jpg' },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'please enter a password'],
    minlength: 8,
    //exclude this filed from the output
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please enter a password confirmation'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'password is not matched !',
    },
  },
  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  //delete the confirm password so that it does not show in db
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }
  this.passwordChangeAt = Date.now() - 2000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctpassword = async function (
  givenPassword,
  userPassword
) {
  return await bcrypt.compare(givenPassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (jwtTtime) {
  if (this.passwordChangeAt) {
    const changedTime = parseInt(this.passwordChangeAt.getTime() / 1000);
    return jwtTtime < changedTime;
  }

  //NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const restToken = crypto.randomBytes(32).toString('hex');
  //crypted version of restToken
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(restToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 5 * 60 * 1000;
  return restToken;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
