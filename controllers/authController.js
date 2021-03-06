const { promisify } = require('util');
const crypto = require('crypto');

const jwt = require('jsonwebtoken');
const catchAsync = require('../utilities/catchAsync');
const User = require('../models/userModel');
const ApiError = require('../utilities/ApiError');
const sendMail = require('../utilities/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECURE_KEY, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 60 * 60 * 24 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({ status: 'success', token, data: user });
};

exports.signup = catchAsync(async (req, res, next) => {
  const userData = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    role: req.body.role,
  });

  createSendToken(userData, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //CHECKS IF EMAILS OR PASSWORDS ARE THERE
  if (!email || !password)
    return next(new ApiError('Please enter email and password!', 400));

  //CHECKS IF THERE IS USER WITH THAT PASSWORD
  const user = await User.findOne({ email }).select('+password');

  //IF USER ENTER CORRECT PASSWORD
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new ApiError('Please check your email or password!', 400));
  }

  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'logout', {
    expires: new Date(Date.now + 1000 * 10),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decode = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECURE_KEY
      );

      const user = await User.findById(decode.id).select('+photo');

      if (!user) return next();

      if (user.passwordChangedAfter(decode.iat)) {
        return next();
      }

      res.locals.user = user;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) token = req.cookies.jwt;

  if (!token) {
    return next(
      new ApiError('Please Login first to get access this route!'),
      401
    );
  }

  //CHECK IF THE TOKEN IS VALID
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECURE_KEY);

  const currentUser = await User.findById(decode.id);

  if (!currentUser) {
    return next(
      new ApiError(`The user to whom the token is belong doesn't exists`, 401)
    );
  }

  if (currentUser.passwordChangedAfter(decode.iat)) {
    return next(
      new ApiError(`The user changed the password, Please login again!`, 401)
    );
  }

  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.restrict =
  (...args) =>
  (req, res, next) => {
    //checks if the user role doesn't exits in the list
    if (!args.includes(req.user.role)) {
      return next(
        new ApiError(`You don't have permission to perform this task.`, 403)
      );
    }
    next();
  };

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(new ApiError('There is no user with this email.', 401));

  //generateToken
  const resetToken = user.createRandomTokenResetPassword();

  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forget your password? Submit a patch request with password and confirm password.\n${resetURL}.
  If your haven't request for that then please ignore this message.`;

  // console.log(resetURL, message);

  try {
    await sendMail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res
      .status(200)
      .json({ status: 'success', message: 'Token send to your email!' });
  } catch (err) {
    // console.log(err);
    user.passwordReset = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    next(new ApiError('Failed to reset password', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //check token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new ApiError('Token is invalid or expired!', 400));

  //check if its expire
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //Generate new token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECURE_KEY, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });

  //set new password
  res.status(200).json({ status: 'success', token });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new ApiError('The current password is incorrect!', 401));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  createSendToken(user, 200, res);
});
