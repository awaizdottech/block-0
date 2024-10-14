import {
  asyncHandler,
  generateAccessAndRefreshToken,
} from "../utils/helpers.js";
import { User } from "../models/user.model.js";
import { deleteFromCloud, uploadOnCloud } from "../utils/cloud.js";
import { ApiResponse, ApiError } from "../utils/standards.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import { signUpSchema } from "../schemas/user.schema.js";

export const signupUser = asyncHandler(async (req, res) => {
  const validatedData = await signUpSchema.spa(req.body);
  if (!validatedData.success)
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "seems like validation error",
          validatedData.error.issues
        )
      );

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    return res.status(400).json(new ApiError(400, "avatar file is missing"));
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    fs.unlinkSync(avatarLocalPath);
    if (coverLocalPath) fs.unlinkSync(coverLocalPath);
    return res
      .status(400)
      .json(new ApiError(409, "User with email or username already exists"));
  }

  let avatar;
  try {
    avatar = await uploadOnCloud(avatarLocalPath, `${username}_avatar.jpg`);
  } catch (error) {
    return res.status(400).json(new ApiError(400, "failed to upload avatar"));
  }
  let coverImage;
  if (coverLocalPath) {
    try {
      coverImage = await uploadOnCloud(
        coverLocalPath,
        `${username}_coverImage.jpg`
      );
      console.log("uploaded coverImage", coverImage);
    } catch (error) {
      console.log("error uploading coverImage to azure", error);
      return res
        .status(400)
        .json(new ApiError(400, "failed to upload coverImage"));
    }
  }

  try {
    const user = await User.create({
      fullname,
      avatar,
      coverImage,
      email,
      password,
      username,
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      return res
        .status(400)
        .json(
          new ApiError(500, "Something went wrong while registering a user")
        );
    }

    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "user registered successfully"));
  } catch (error) {
    console.log("user creation failed");
    if (avatar) {
      // todo delete it from azure & similalry for coverImage
      await deleteFromCloud(`${username}_avatar.jpg`);
    }
    if (coverImage) {
      // todo delete it from azure & similalry for coverImage
      await deleteFromCloud(`${username}_coverImage.jpg`);
    }
    return res
      .status(400)
      .json(
        new ApiError(
          500,
          "Something went wrong while registering a user & images were deleted"
        )
      );
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  // todo more validation needed
  if (!email)
    return res.status(400).json(new ApiError(400, "email is required"));
  // todo as we're finding user either from username or email if one of them is wrong there's no error
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) return res.status(400).json(new ApiError(400, "user not found"));

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid)
    return res.status(400).json(new ApiError(401, "invalid password"));

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  // todo check for loggedInUser

  const options = {
    httpOnly: true, // makes cookie safe, not modifiable by he client
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options) // cookies cant be set in mobile apps
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "user logged in successfully"
      )
    );
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken; // it'll come in body from mobile app

  if (!incomingRefreshToken)
    return res.status(400).json(new ApiError(401, "refresh token is required"));

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user)
      return res.status(400).json(new ApiError(401, "invalid refresh token"));

    if (incomingRefreshToken !== user?.refreshToken)
      return res.status(400).json(new ApiError(401, "invalid refresh token"));

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "access token refreshed successfully"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) return res.status(400).json(error);
    return res
      .status(400)
      .json(
        new ApiError(500, "something went wrong while refreshing access token")
      );
  }
});

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $unset: { refreshToken: 1 }, // removes feild from mongo
  }),
    { new: true };

  // todo make options globally accessible or something similar
  const options = {
    httpsOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out successfully"));
});

export const updateCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid)
    return res.status(400).json(new ApiError(401, "Old password is incorrect"));

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user details"));
});

export const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;
  if (!fullname || !email)
    return res
      .status(400)
      .json(new ApiError(400, "fullname & email are required"));

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { fullname, email } },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "account details updated successfully"));
});

export const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath)
    return res.status(400).json(new ApiError(400, "file is required"));

  const avatar = await uploadOnCloud(
    avatarLocalPath,
    `${req.user?.username}_avatar.jpg`
  );

  if (!avatar)
    return res
      .status(400)
      .json(new ApiError(500, "something went wrong while uploading avatar"));
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar } },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "avatar updated successfully"));
});
