const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.frogotPassword);
router.patch('/restPassword/:token', authController.resetPassword);

//use protect for the rest of the middelwar
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
//photo is the field in the requiest that is going to hold the file
//this middelwar put info in req
router.patch(
  '/updateMe',
  userController.uploaduserPhoto,
  userController.resizeuserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

//use restrect for the rest of the middelwar
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
