import { ApiError } from "./standards.js";
import { User } from "../models/user.model.js";
import nodemailer from "nodemailer";
import { emailTypes } from "../constants.js";

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

export async function mailSender({ emailType, token, recieverEmail }) {
  const emailSubjects = {
    [emailTypes.emailVerification]: "Verify your email",
    [emailTypes.forgotPassword]: "Password reset",
    [emailTypes.loginViaEmail]: "You can log in from here",
    [emailTypes.emailUpdate]: "Your email has been updated, please confirm",
  };

  const emailHtmlContent = () => {
    const baseUrl = process.env.FRONTEND_URL;
    const courtesy =
      "<p>The token expires in 15 mins.<br/>Do not share the link with anyone.</p>";

    switch (emailType) {
      case emailTypes.emailVerification:
        return (
          `<p> Please click <a href="${baseUrl}/email/verify/${token}">here</a> to verify your email</p>` +
          courtesy
        );
      case emailTypes.forgotPassword:
        return (
          `<p> Please click <a href="${baseUrl}/email/reset-password/${token}">here</a> to reset your password</p>` +
          courtesy
        );
      case emailTypes.loginViaEmail:
        return (
          `<p> Please click <a href="${baseUrl}/email/login/${token}">here</a> to login</p>` +
          courtesy
        );
      case emailTypes.emailUpdate:
        return (
          `<p> Please click <a href="${baseUrl}/email/verify-email-update/${token}">here</a> to confirm your updated email</p>` +
          courtesy
        );
      default:
        return "<p>Something went wrong. Please contact support</p>";
    }
  };

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

    const mailOptions = {
      from: {
        name: "awaizdottech",
        address: process.env.GMAIL,
      },
      to: [recieverEmail],
      subject: emailSubjects[emailType] || "Unknown email type",
      html: emailHtmlContent(),
    };

    return await transporter.sendMail(mailOptions).messageId;
  } catch (error) {
    console.error(`Failed to send email to ${recieverEmail}:`, error);
    throw new ApiError(500, "Failed to send email");
  }
}
