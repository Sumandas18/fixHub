require("dotenv").config();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_SECRET_KEY = process.env.CLOUDINARY_SECRET_KEY;

cloudinary.config({
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_SECRET_KEY,
    cloud_name: CLOUDINARY_CLOUD_NAME
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'fixhub/profile',
        allowed_formats: async (req, file) => ["jpg", "jpeg", "png"],
        public_id: (req, file) => 'fixhub-profile_' + file.originalname.split(" ").join("-") + Date.now()
    },
});

const UploadProfilePic = multer({ storage: storage, limits: { fileSize: 3 * 1024 * 1024 } });

module.exports = UploadProfilePic;