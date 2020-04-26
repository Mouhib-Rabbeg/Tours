const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const Email = require('../utilits/email');
const crypto = require('crypto');
//TO PROMOSEFY
const util = require('util');

//CREATE TOKEN FOR THE USER
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    //FOR HTTPS
    secure: false,
    //PREVENT COOKIE FROM BEING MODEFIED
    httponly: true,
  };
  if (process.env.NODE_ENV === 'prod') {
    cookieOptions.secure = true;
  }
  res.cookie('jwt', token, cookieOptions);
  //Remove password from output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    data: {
      token,
      user: user,
    },
  });
};
//SIGING UP THE USER
exports.signup = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser, url).sendWelcome();
    //options like when jwt expires
    createSendToken(newUser, 201, res);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    //destructoring
    const { email, password } = req.body;

    //1 check  for the email and pass exist
    if (!email || !password) {
      res.status(400).json({
        status: 'fail',
        message: 'please provide email and password',
      });
      next();
    }
    //2 check if user exists && pass is correct +  for restrected fields
    const user = await User.findOne({ email: email }).select('+password');
    if (!user || !(await user.correctpassword(password, user.password))) {
      throw 'please check your email or password ';
    }

    //3 if everything ok ,send the token
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httponly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};
exports.protect = async (req, res, next) => {
  try {
    //check if token exisit
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      throw 'You are not loged In';
    }
    //verification token
    const decoded = await util.promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );
    //check if the user still exist
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      throw 'User does not exist  !';
    }
    //check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      throw 'you recently changed your password log in again !';
    }
    //GRANT ACCESS TO ROUTE
    //all views get access to locals
    res.locals.user = currentUser;
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
//WRAPPER FUNCTION TO PASS THE ARGUMENT TO THE MIDEL FUNCTION
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    try {
      if (!roles.includes(req.user.role)) {
        throw 'you dont have the permission';
      }
      next();
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err,
      });
    }
  };
};

exports.frogotPassword = async (req, res, next) => {
  try {
    //Get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      throw 'user does not exist';
    }
    //generate token
    const restToken = user.createPasswordResetToken();

    //ignore schema
    await user.save({ validateBeforeSave: false });
    //send it back to email
    const restUrl = `${req.protocol}://${req.get(
      'host'
    )}/restPassword/${restToken}`;

    const message = `forgot your password ? submit your new password to :${restUrl}`;

    /*  await sendEmail({
      email: user.email,
      subject: 'password reset valid for 10 minutes',
      message,
    });
 */
    await new Email(user, restUrl).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'token sent',
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err,
    });
  }
};
exports.resetPassword = async (req, res, next) => {
  try {
    // 1)get user based on token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    // 2)if token has not expired && user exist set the new password
    if (!user) {
      throw 'token is invalid or expired ! 400';
    }
    //3 )update changedPasswordAt for the user
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    //4) log in the user in ,send jwt
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    //1) get user
    const user = await User.findById(req.user._id).select('+password');
    //2) check if posted password is correct
    if (
      !(await user.correctpassword(req.body.currentPassword, user.password))
    ) {
      throw 'Current password is uncorrect';
    }
    //3) if password is correct then update
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    //4)log user in send the JWT
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err,
    });
  }
};

//Only rendred pages,no errors
exports.isLoggedIn = async (req, res, next) => {
  try {
    //check if token exisit
    let token;
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next();
    }
    //verification token
    const decoded = await util.promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );
    //check if the user still exist
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }
    //check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next();
    }
    //GRANT ACCESS TO ROUTE Pass variable to views using locals
    res.locals.user = currentUser;
    next();
  } catch (err) {
    next();
  }
};
