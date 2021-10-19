// const multer = require('multer');
// const { CloudinaryStorage } = require('multer-storage-cloudinary')
// connecter to Cloudinary
var cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key:process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// var storage = CloudinaryStorage({
//   cloudinary: cloudinary,
//   folder: "samples",
//   allowedFormats: ['jpg', 'png', 'jpeg'],
// });

// var parser = multer({ storage: storage });
module.export = cloudinary;
// module.exports = parser
