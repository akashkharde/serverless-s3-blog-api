// utils/pickDeviceInfo.js
export const pickDeviceInfo = (req) => {
  return {
    userAgent: req.headers["user-agent"] || "unknown",
    ip: req.ip || req.headers["x-forwarded-for"] || req.connection?.remoteAddress,
    deviceId: req.headers["x-device-id"] || null,
  };
};
