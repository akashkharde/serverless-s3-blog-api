// utils/errorMiddleware.js
export const errorMiddleware = (err, req, res, next) => {
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format: ${err.value}`,
    });
  }

  const status = err.statusCode || 500;

  return res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
