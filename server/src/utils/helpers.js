import { ApiError } from "./standards.js";
import { User } from "../models/user.model.js";
import nodemailer from "nodemailer";

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

export async function sendMail() {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    return transporter.sendMail({
      from: {
        name: "awaizdottech",
        address: process.env.GMAIL,
      },
      to: ["awaiz29249@gmail.com"], // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    });
  } catch (error) {
    throw new ApiError(400, "couldnt send mail");
  }
}
