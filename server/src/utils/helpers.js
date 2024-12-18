import { ApiError } from "./standards.js"
import { User } from "../models/user.model.js"
import nodemailer from "nodemailer"
import { emailTypesObject } from "../constants.js"

export const asyncHandler = requestHandler => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch(err => next(err))
  }
}

export const generateAuthTokens = async userId => {
  try {
    const user = await User.findById(userId)
    if (!user) throw new ApiError(500, "user not found")

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    return { accessToken, refreshToken }
  } catch (error) {
    throw new ApiError(500, "something went wrong while finding user")
  }
}

export async function mailSender({ emailType, token, recieverEmail }) {
  const emailSubjects = {
    [emailTypesObject.emailVerification]: "Verify your email",
    [emailTypesObject.forgotPassword]: "Password reset",
    [emailTypesObject.loginViaEmail]: "You can log in from here",
    [emailTypesObject.emailUpdate]:
      "Your email has been updated, please confirm",
  }

  const emailHtmlContent = () => {
    const baseUrl = process.env.FRONTEND_URL
    const courtesy =
      "<p>The link expires in 15 mins.<br/>Do not share the link with anyone.</p><p>This email is not monitored, please contact the support through our app or website</p>"

    switch (emailType) {
      case emailTypesObject.emailVerification:
        return (
          `<p> Please click <a href="${baseUrl}/email/verify/${token}">here</a> to verify your email</p>` +
          courtesy
        )
      case emailTypesObject.forgotPassword:
        return (
          `<p> Please click <a href="${baseUrl}/email/reset-password/${token}">here</a> to reset your password</p>` +
          courtesy
        )
      case emailTypesObject.loginViaEmail:
        return (
          `<p> Please click <a href="${baseUrl}/email/login/${token}">here</a> to login</p>` +
          courtesy
        )
      case emailTypesObject.emailUpdate:
        return (
          `<p> Please click <a href="${baseUrl}/email/verify-update/${token}">here</a> to confirm your email update</p>` +
          courtesy
        )
      default:
        return "<p>Something went wrong. Please contact support</p>"
    }
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    const mailOptions = {
      from: {
        name: "awaizdottech",
        address: process.env.GMAIL,
      },
      to: [recieverEmail],
      subject: emailSubjects[emailType] || "Unknown email type",
      html: emailHtmlContent(),
    }
    const response = await transporter.sendMail(mailOptions) // await is needed as stated in the docs
    return response.messageId
  } catch (error) {
    console.error(`Failed to send email to ${recieverEmail}:`, error)
    throw new ApiError(500, "Failed to send email")
  }
}
