// // We need multer to allow users to upload images

const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { nextTick } = require('process');

const MIME_TYPES = {
    "image/jpg": "jpg",
    "image/jpeg": "jpeg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif"
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        const dir = path.join(__dirname, '../images');
        try {
            if (fs.existsSync(dir)) {
                callback(null, 'images');
            } else {
                fs.mkdirSync(dir);
                callback(null, 'images');
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        try {
            const extension = MIME_TYPES[file.mimetype];
            mimeTypeIsValid(extension, req);
            callback(null, name + '_' + Date.now() + '.' + extension);
        }
        catch(error) {
            console.error(error);
            next(error);
        }
    }
});

const mimeTypeIsValid = (ext, req) => {
    if (ext!="jpg"&&ext!="jpeg"&&ext!="png"&&ext!="webp"&&ext!="gif") {
        req.body.errorMessage = "Invalid image format!";
    }
}

module.exports = multer({storage: storage}).single('image');