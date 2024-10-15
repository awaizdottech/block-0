import { ApiError } from "./standards.js";
import { User } from "../models/user.model.js";

export const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export const generateTokensAndSaveRefreshTokenToDb = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(500, "user not found");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while saving new refresh token"
    );
  }
};
