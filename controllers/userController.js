const multer = require('multer');
const User = require('../models/userModel');
const catchAsync = require('../utilities/catchAsync');
const ApiError = require('../utilities/ApiError');
const factory = require('./handleFactory');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(file);
    cb(null, './public/img/users');
  },
  filename: (req, file, cb) => {
    const fileType = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${fileType}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new ApiError('Wrong file type, Please use an image!', 404), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadImage = upload.single('photo');

const filterData = (obj, ...filterEl) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (filterEl.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new ApiError(
        `You're not allowed to change password here, Please visit /updateMyPassword`,
        400
      )
    );
  }

  const filteredBody = filterData(req.body, 'name', 'email');

  if (req.file) filteredBody.photo = req.file.filename;

  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: 'success', data: user });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({ status: 'success', data: {} });
});

// exports.createUser = (req, res) => {
//   res
//     .status(500)
//     .json({ status: 'error', message: 'This route need to be implement' });
// };

exports.getUser = factory.getOne(User);

exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
