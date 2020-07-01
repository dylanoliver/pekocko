// We need multer to allow users to upload images
const multer = require('multer');
// We first need to make sure that only certain formats are allowed, since we only want images
const MIME_TYPES = {
    "image/jpg": "jpg",
    "image/jpeg": "jpeg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif"
};

const storage = multer.diskStorage ({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(".")[0].split(" ").join("_");
        const extension = MIME_TYPES[file.mimetype];
        mimeTypeIsValid(extension,req);
         // We name the image using Date.now to ensure a unique name
         // We then export this image upload function to use it in our routes
        const finalFilename = name +"_"+Date.now()+"."+extension;
        req.body.finalFileName = finalFilename;
        callback(null, finalFilename);
    }
});

module.exports = multer({storage: storage}).single('image');
// If the MIME_TYPE doesn't match, the user will receive an error
const mimeTypeIsValid = (ext,req) => {
    if(ext!="jpg"&&ext!="jpeg"&&ext!="png"&&ext!="webp"&&ext!="gif") {
        req.body.errorMessage = "This file format is not supported!";
    }
}