const multer = require('multer');

const path = require('path');

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(null, 'uploads/');
  },

  filename: (req, file, cb) => {

    const uniqueName =
      `${Date.now()}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});

/**
 * PDF FILTER
 */
const fileFilter = (
  req,
  file,
  cb
) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/x-pdf',
  ];

  if (
    !allowedMimeTypes.includes(file.mimetype)
  ) {

    return cb(null, false);
  }

  cb(null, true);
};

const uploadResume = multer({

  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = uploadResume;