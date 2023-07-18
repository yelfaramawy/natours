const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const Email = require('../utils/email');
const catchAsync = require('../utils/catchAsync');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // This isn't useful as anyone can register as an admin for example
  // const newUser = await User.create(req.body);

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
    confirmPassword: req.body.confirmPassword,
    changedPasswordAt: req.body.changedPasswordAt,
  });
  const url = `${req.protocol}://${req.get('host')}/profile`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please enter email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Invalid email or password'), 401);
  }
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'LoggedOut', {
    expiresIn: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

// To protect Routes from unsigned users
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get the token and check if it exists
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
    return next(
      new AppError('You are not logged in. Please login to get access.', 401)
    );
  }

  // 2) Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists not deleted
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token is no longer exist', 401)
    );
  }
  // 4) Check if user changed password after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please login again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTES
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 2) Verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 3) Check if user still exists not deleted
      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
        return next();
      }

      // 4) Check if user changed password after token was issued
      // if (currentUser.changedPasswordAfter(decoded.iat)) {
      //   return next();
      // }

      // There is a logged in user
      // Pug has access on res.locals
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }

  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`You don't have permission for this action`, 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) check for user email in the database
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address.', 404));
  }

  // 2) Generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send email to the user
  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token is valid for only 10 minutes',
    //   message,
    // });
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/resetPassword/${resetToken}`;
    // const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}. If you didn't forgot your password, ignore this email.`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError("Couldn't send the email. Try again later.", 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get the user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2) If the token is not expired and the user exists, Set new password
  if (!user) {
    return next(new AppError('Token is invalid or expired.'));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt field
  // 4) Log the user in
  createSendToken(user, 200, res);
});

// exports.updatePassword = catchAsync(async (req, res, next) => {
//   // 1) Get user from collection
//   const user = await User.findById(req.user.id).select('+password');

//   // 2) check if POSTed password matches the user password
//   if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
//     next(new AppError('Password is incorrect', 401));
//   }
//   // 3) if so, update password
//   user.password = req.body.newPassword;
//   user.confirmPassword = req.body.confirmPassword;
//   await user.save();
// });

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed password matches user's password
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Current password is not correct!', 401));
  }
  // 3) if so, update user password
  user.password = req.body.newPassword;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  // 4) log the user in
  createSendToken(user, 200, res);
});
