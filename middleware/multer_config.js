// const multer = require('multer');

// const MIME_TYPE = {
//     'image/jpg': 'jpg',
//     'image/jpeg': 'jpg',
//     'image/png': 'png'
// }

// const storage = multer.diskStorage({
//     destination: (req, file, callback) => {
//         callback(null, 'images')
//     },
//     filename: (req, file, callback) => {
//         const name = file.originalname.split('.')[0].split(' ').join('_');
//         const extension = MIME_TYPE[file.mimetype];
//         mimetypeValid(extension, req);
//         const finalname = name + Date.now() + '.' + extension;
//         callback(null, finalname )
//     }
// })

// module.exports = multer ({storage: storage}).single('image')

// function mimetypeValid(extension, req) {
//     if(extension!='jpg' && extension !='png' && extension != 'jpeg') {
//         req.body.errorMessage = "Le format d'image n'est pas valid!"
//     }
// }

const multer = require("multer");
const path = require("path");

// Multer config
module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);  
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      cb(new Error("File type is not supported"), false);
      return;
    }
    cb(null, true);
  },
});
 