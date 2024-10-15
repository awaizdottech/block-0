import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/helpers.js";
import { ApiError } from "../utils/standards.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies.accessToken ||
    req.body.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token)
    return res.status(400).json(new ApiError(500, "access token not found"));

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decodedToken)
      return res.status(400).json(new ApiError(500, "invalid access token"));

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) return res.status(400).json(new ApiError(500, "user not found"));

    req.user = user;

    next();
  } catch (error) {
    return res
      .status(400)
      .json(
        new ApiError(
          500,
          "unauthorised, something went wrong while validating access token"
        )
      );
  }
});
