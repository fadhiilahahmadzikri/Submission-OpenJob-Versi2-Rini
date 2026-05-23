const errorHandler = (err, req, res, next) => {

  /**
   * MALFORMED JSON
   */
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'failed',
      message: 'Invalid JSON payload',
    });
  }

  /**
   * FILE SIZE ERROR
   */
  if (
    err.code === 'LIMIT_FILE_SIZE'
  ) {

    return res.status(400).json({
      status: 'failed',
      message: 'File size exceeds 5 MB',
    });
  }

  /**
   * MULTER ERROR
   */
  if (err.name === 'MulterError') {

    return res.status(400).json({
      status: 'failed',
      message: err.message,
    });
  }

  /**
   * FILE TYPE ERROR
   */
  if (
    err.message ===
    'Only PDF files are allowed'
  ) {

    return res.status(400).json({
      status: 'failed',
      message: err.message,
    });
  }

  /**
   * AUTH ERROR
   */
  if (
    err.message === 'Missing authentication'
  ) {

    return res.status(401).json({
      status: 'failed',
      message: err.message,
    });
  }

  /**
   * DEFAULT ERROR
   */
  return res.status(500).json({
    status: 'failed',
    message:
      err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;