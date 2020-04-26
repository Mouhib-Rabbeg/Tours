const User = require('../models/userModel');
const handler = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
//configure multer storage
/* const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    //give files unique name so that they wont be overwritten
    const extention = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${extention}`);
  },
}); */
//save it to memorie if there is image processing image will be in req.file.buffer
const multerStorage = multer.memoryStorage();
//Multer filter
const multerFilter = (req, file, cb) => {
  //test if uploaded file is a image
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('please a upload a image'), false);
  }
};

//configure multer
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploaduserPhoto = upload.single('photo');

exports.resizeuserPhoto = (req, res, next) => {
  if (!req.file) {
    return next();
  }
  //put filename in the request remove data if u want file to be overwritten
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(240, 240)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
};
exports.createUser = async (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is undefined please use sign up',
  });
};

exports.getAllUsers = handler.getAll(User);
exports.getUser = handler.getOne(User);
//DO note update password here
exports.updateUser = handler.updateOne(User);
exports.deleteUser = handler.deleteOne(User);
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.updateMe = async (req, res, next) => {
  try {
    //1) create error if user post password
    if (req.body.password || req.body.passwordConfirm) {
      throw 'you are not allowed to change password here';
    }
    //2) update user docuement
    const filterBody = filterObj(req.body, 'name', 'email');
    if (req.file) {
      filterBody.photo = req.file.filename;
    }
    const user = await User.findByIdAndUpdate(req.user.id, filterBody, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      user,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err,
    });
  }
};

const filterObj = function (obj, ...fields) {
  let newObject = {};
  //return array of object keys
  Object.keys(obj).forEach((el) => {
    if (fields.includes(el)) {
      newObject[el] = obj[el];
    }
  });
  return newObject;
};

exports.deleteMe = async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
