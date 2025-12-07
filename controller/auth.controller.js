import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { User } from "../models/user.model.js";
import { Session } from "../models/session.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import { pickDeviceInfo } from "../utils/pickDeviceInfo.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";

export const register = asyncHandler(async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details.map((d) => d.message).join(", "));
  }

  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    throw new ApiError(409, "Email already registered");
  }

  const user = await User.create({ name, email, password });

  return res.status(201).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details.map((d) => d.message).join(", "));
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const match = await user.comparePassword(password);
  if (!match) {
    throw new ApiError(401, "Invalid credentials");
  }

  const device = pickDeviceInfo(req);

  // Create session
  const session = await Session.create({
    user: user._id,
    refreshTokenHash: "temp", // will update after token created
    userAgent: device.userAgent,
    ip: device.ip,
    deviceId: device.deviceId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, session._id.toString());

  // hash refresh token before storing
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  session.refreshTokenHash = refreshTokenHash;
  await session.save();

  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new ApiError(400, "Refresh token is required");
  }

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const session = await Session.findById(payload.sid);
  if (!session || !session.isValid) {
    throw new ApiError(401, "Session invalid");
  }

  const device = pickDeviceInfo(req);

  // Device validation: block if device info mismatches
  if (
    session.userAgent !== device.userAgent ||
    (session.deviceId && session.deviceId !== device.deviceId)
  ) {
    throw new ApiError(401, "Token not valid for this device");
  }

  const isMatch = await bcrypt.compare(refreshToken, session.refreshTokenHash);
  if (!isMatch) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await User.findById(session.user);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const accessToken = generateAccessToken(user);

  return res.status(200).json({
    success: true,
    data: { accessToken },
  });
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new ApiError(400, "Refresh token is required");
  }

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid refresh token");
  }

  await Session.findByIdAndUpdate(payload.sid, { isValid: false });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});
