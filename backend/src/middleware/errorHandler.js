// Global error handler (4 arguments = Express error middleware)
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Server error",
    // Show stack trace only in development (not in production)
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};