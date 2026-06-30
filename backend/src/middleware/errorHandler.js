export default function errorHandler(error, _req, res, _next) {
  const statusCode = res.statusCode >= 400 && res.statusCode !== 200 ? res.statusCode : 500;

  if (process.env.NODE_ENV !== 'production') {
    console.error(error);
  }

  res.status(statusCode).json({
    message: error?.message || 'Something went wrong.',
  });
}
