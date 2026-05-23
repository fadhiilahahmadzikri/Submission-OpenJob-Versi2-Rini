const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * UPLOAD DIRECTORY
 */
const uploadPath = 'uploads/';

/**
 * CREATE FOLDER IF NOT EXISTS
 */
if (!fs.existsSync(uploadPath)) {

  fs.mkdirSync(uploadPath, {
    recursive: true,
  });
}

/**
 * STORAGE CONFIG
 */
const storage = multer.diskStorage({

  destination: (
    req,
    file,
    cb
  ) => {

    cb(null, uploadPath);
  },

  filename: (
    req,
    file,
    cb
  ) => {

    const uniqueName =
      `${Date.now()}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});

/**
 * PDF ONLY
 */
const fileFilter = (
  req,
  file,
  cb
) => {

  if (
    file.mimetype !==
    'application/pdf'
  ) {

    return cb(
      new Error(
        'Only PDF files are allowed'
      ),
      false
    );
  }

  cb(null, true);
};

/**
 * MULTER INSTANCE
 */
const upload = multer({

  storage,

  fileFilter,

  limits: {
    fileSize:
      5 * 1024 * 1024,
  },
});

module.exports = upload;