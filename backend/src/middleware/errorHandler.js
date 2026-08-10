export default function errorHandler(error, _req, res, _next) {
  let statusCode = res.statusCode >= 400 && res.statusCode !== 200 ? res.statusCode : 500;

  if (error?.status && typeof error.status === 'number') {
    statusCode = error.status;
  } else if (error?.statusCode && typeof error.statusCode === 'number') {
    statusCode = error.statusCode;
  } else if (error?.name === 'MulterError') {
    statusCode = 400;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(error);
  }

  res.status(statusCode).json({
    message: error?.message || 'Something went wrong.',
  });
}
