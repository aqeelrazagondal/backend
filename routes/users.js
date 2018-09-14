const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const _ = require('lodash');
var multer = require('multer');
const { User, validate } = require('../models/user');
const express = require('express');
const logger = require('../startup/logging');
const router = express.Router();
const nodemailer = require('nodemailer');


router.get('/me/:id', auth, async (req, res) => {
  logger.info('GET /users/me called');
  let id = req.params.id;

  const user = await User.findById({ _id: id });
  if (!user) return res.status(400).send('User not found by Email...');

  res.jsonp({
    status: "success",
    message: "Profile info.",
    object: user
  });
});



router.post('/register', async (req, res) => {

  var URL = 'http://localhost:3030/login';
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('User already registered.');


  let transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    port: 25,
    auth: {
      user: 'aqeelraza146@gmail.com',
      pass: 'gondal3367175537'
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  let HelperOptions = {
    from: '"Rockvillie" <aqeelraza146@gmail.com',
    to: 'aqeelraza146@gmail.com',  //req.body.email,
    subject: 'Email verification',
    html: '<p>Click the following link to confirm your account:</p><p>' + URL + '</p>'
  };



  transporter.sendMail(HelperOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("The message was sent!");
    console.log(info);
    console.log('Message sent: %s', info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

  });

  user = new User(_.pick(req.body, ['email', 'password', 'username', 'phone_number']));

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  res.jsonp({
    status: 'success',
    message: 'successfully created new user',
    user
  });

});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
// var upload = multer({ dest: './public/images/profileImages' });
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/profileImages')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.jpg')
  }
})

var upload = multer({ storage: storage })


router.post("/profileImage", auth, upload.single('profile_photo_url'), (req, res, next) => {

  var id = req.body.id;
  User.findOne({ _id: id }, function (err, user) {
    if (err) {
      res.status(400).send({
        status: "Failure",
        message: 'User not found by this id',
        object: []
      });
    }
    else {
      logger.info(user.length + 'User Found');
      user.profile_photo_url = req.file.path;
      user.save();

      res.jsonp({
        status: 'success',
        message: 'Image uploaded!',
        object: user
      });
    }
  });
});

router.post('/settings', async function (req, res) {

  let user = await User.findOne({ _id: req.body._id });
  if (!user) return res.status(400).send('User Not found.');

  let oldPassword = req.body.oldPassword;
  let newPassword = req.body.newPassword;
  let newPassword1 = req.body.newPassword1;
  var checkPassword = bcrypt.compareSync(oldPassword, user.password);

  if (checkPassword) {
    if (newPassword === newPassword1) {
      const salt = await bcrypt.genSalt(10);
      newPassword = await bcrypt.hash(newPassword, salt);
      user.password = newPassword;
      await user.save();
      res.jsonp({
        status: 'success',
        messgae: 'password changed..!!',
        object: user
      })
    } else {
      res.jsonp({
        status: 'failure',
        messgae: 'password do not match',
        object: []
      });
    }
  }
});


router.post('/profile', async function (req, res) {

  let user = await User.findOne({ _id: req.body._id });
  if (!user) return res.status(400).send('User Not found.');
  let date_of_birth = req.body.date_of_birth;
  let address = req.body.address;
  
  user.address = address;
  user.date_of_birth = date_of_birth;

  await user.save();
  res.jsonp({
    status: 'success',
    messgae: 'Profile updated..!!',
    object: user
  })

});

router.post('/updateLocation', async function (req, res) {

  var longitude = req.body.longitude;
  var latitude = req.body.latitude;

  let user = await User.findOne({ _id: req.body._id });
  if (!user) return res.status(400).send('User Not found.');

  user.loc = [longitude, latitude];
  user.last_shared_loc_time = new Date();
  await user.save();
  logger.info('User Location With email ' + user.email);
  console.log('########### FOUND A USER ##########', user);

  res.jsonp({
    status: 'success',
    messgae: 'Updated user location..!!',
    object: user
  })
});

router.get('/countryCode', (req, res) => {
  var responseobject =

    res.jsonp({
      status: 'success',
      messgae: 'Updated user location..!!',
      object: countryCodes
    })
})




module.exports = router; 