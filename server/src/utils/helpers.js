import { ApiError } from "./standards.js";
import { User } from "../models/user.model.js";

export const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    // todo check for user
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    console.log("ac", accessToken, "rf", refreshToken);
    user.refreshToken = refreshToken;
    console.log(user);
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "something went wrong while generating tokens");
  }
};
