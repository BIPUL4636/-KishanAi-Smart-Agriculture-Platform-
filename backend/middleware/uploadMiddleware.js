const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'leaves');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configures disk storage with unique filenames to prevent collisions
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Format: userId-timestamp-originalname (e.g., 665a1b2c-1718901234567-leaf.jpg)
    const uniqueName = `${req.user?._id || 'anon'}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Restricts uploads to image files only (JPEG, PNG, WebP)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP image files are allowed'), false);
  }
};

// Multer instance configured for single leaf image upload (max 5MB)
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

// Middleware for single leaf image upload — expects field name "file"
const uploadLeafImage = upload.single('file');

// Wraps multer in a proper error handler that forwards errors to errorMiddleware
const handleUpload = (req, res, next) => {
  uploadLeafImage(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400);
        return next(new Error('Image file is too large — maximum size is 5MB'));
      }
      res.status(400);
      return next(new Error(`Upload error: ${err.message}`));
    }
    if (err) {
      res.status(400);
      return next(err);
    }
    next();
  });
};

module.exports = { handleUpload };
