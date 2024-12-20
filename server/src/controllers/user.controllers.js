import {
  asyncHandler,
  generateAuthTokens,
  mailSender,
} from "../utils/helpers.js"
import { User } from "../models/user.model.js"
import { deleteFromCloud, uploadOnCloud } from "../utils/cloud.js"
import { ApiResponse, ApiError } from "../utils/standards.js"
import jwt from "jsonwebtoken"
import fs from "fs"
import {
  emailActionSchema,
  loginSchema,
  passwordSchema,
  sendEmailRequestSchema,
  signupSchema,
  updateSchema,
} from "../schemas/user.schema.js"
import { EmailToken } from "../models/emailToken.model.js"
import { emailTypesObject } from "../constants.js"

const options = {
  httpsOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Lax",
  signed: true,
  ...(process.env.NODE_ENV === "production" && {
    domain: process.env.FRONTEND_URL,
  }),
  // domain & path options lets us decide where the cookie is accessible in frontend to be sent to backend
}

export const signupUser = asyncHandler(async (req, res) => {
  const validatedData = signupSchema.safeParse(req.body)
  if (!validatedData.success)
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "seems like validation error",
          validatedData.error.issues
        )
      )
  const { username, email, password } = validatedData.data

  try {
    const ExistingUser = await User.findOne({ $or: [{ username }, { email }] })
    if (ExistingUser) {
      fs.unlinkSync(avatarLocalPath)
      return res
        .status(400)
        .json(new ApiError(409, "User with email or username already exists"))
    }
  } catch (error) {
    // todo remove temp stored file in a way that u dont have to repeat it, as it is needed here as well as many places because whenever we are throwing error we need to first clear the recieved file in the controller
    return res
      .status(400)
      .json(
        new ApiError(
          500,
          "something went wrong while checking for existing user with same credentials"
        )
      )
  }

  let user
  try {
    user = await User.create({
      email,
      password,
      username,
    })
  } catch (error) {
    return res.status(400).json(new ApiError(400, "failed to create user"))
  }

  const avatarLocalPath = req.file?.path
  let avatar
  try {
    avatar = await uploadOnCloud(avatarLocalPath, `${user._id}_avatar.jpg`)
  } catch (error) {
    return res.status(400).json(new ApiError(400, "failed to upload avatar"))
  }

  try {
    const { accessToken, refreshToken } = await generateAuthTokens(user._id)
    user.refreshToken = refreshToken
    if (avatar) user.avatar = avatar
    const savedUser = await user.save({ validateBeforeSave: false })

    return res
      .status(201)
      .cookie("accessToken", accessToken, {
        ...options,
        maxAge: eval(process.env.ACCESS_TOKEN_COOKIE_EXPIRY),
      })
      .cookie("refreshToken", refreshToken, {
        ...options,
        maxAge: eval(process.env.REFRESH_TOKEN_COOKIE_EXPIRY),
      })
      .json(
        new ApiResponse(
          200,
          { savedUser, accessToken, refreshToken },
          "user registered successfully"
        )
      )
  } catch (error) {
    if (avatar) await deleteFromCloud(`${user._id}_avatar.jpg`)

    return res
      .status(400)
      .json(
        new ApiError(
          500,
          "Something went wrong while saving the user & images were deleted. try logging in."
        )
      )
  }
})

export const sendEmail = asyncHandler(async (req, res) => {
  console.log("received at send mail", req.body)

  const validatedData = sendEmailRequestSchema.safeParse(req.body)
  if (!validatedData.success)
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "seems like validation error",
          validatedData.error.issues
        )
      )
  let { email, userId, emailVerificationStatus, emailType } = validatedData.data

  if (!userId) {
    try {
      const user = await User.findOne({ email }).select("_id")
      userId = user?._id
      emailVerificationStatus = user?.isEmailVerified
      // console.log("userId", userId)

      if (!userId)
        return res
          .status(400)
          .json(new ApiError(500, "user with given email not found"))
    } catch (error) {
      console.error(error)

      return res
        .status(400)
        .json(
          new ApiError(500, "something went wrong while trying to find user")
        )
    }
  }

  if (
    emailType !== emailTypesObject.emailVerification &&
    emailVerificationStatus == false
  )
    return res
      .status(400)
      .json(new ApiError(500, "unauthorised. email not verified"))

  const emailToken = jwt.sign(
    { userId, emailType },
    process.env.EMAIL_TOKEN_SECRET,
    {
      expiresIn: process.env.EMAIL_TOKEN_EXPIRY,
    }
  )

  try {
    const newOrUpdatedToken = await EmailToken.findOneAndUpdate(
      { userId },
      {
        emailToken,
        expiresAt: Date.now() + eval(process.env.DB_EMAIL_TOKEN_EXPIRY_IN_MS),
      },
      { upsert: true }
    )
    console.log("newOrUpdatedToken", newOrUpdatedToken)
  } catch (error) {
    console.error(error)

    return res
      .status(400)
      .json(new ApiError(500, "something went wrong while saving token"))
  }

  try {
    const response = await mailSender({
      emailType: emailType,
      token: emailToken,
      recieverEmail: email,
    })
    return res
      .status(200)
      .json(new ApiResponse(200, response, "email sent successfully"))
  } catch (error) {
    if (error instanceof ApiError) return res.status(400).json(error)
    return res
      .status(400)
      .json(new ApiError(500, {}, "something went wrong while sending email"))
  }
})

export const emailAction = asyncHandler(async (req, res, next) => {
  console.log("email action recieved body", req.body)
  const validatedData = emailActionSchema.safeParse(req.body)
  if (!validatedData.success)
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "seems like validation error",
          validatedData.error.issues
        )
      )
  const { emailToken, authStatus, email, password } = validatedData.data

  let emailTokenPayload
  try {
    emailTokenPayload = jwt.verify(emailToken, process.env.EMAIL_TOKEN_SECRET)
    console.log("emailTokenPayload", emailTokenPayload)
  } catch (error) {
    return res
      .status(400)
      .json(new ApiError(500, "invalid token. it probably expired"))
  }

  let dbToken
  try {
    dbToken = await EmailToken.findOne({
      userId: emailTokenPayload?.userId,
    }).select("emailToken")
    console.log("dbToken", dbToken)
    if (!dbToken)
      return res.status(400).json(new ApiError(500, "token not found in db"))
  } catch (error) {
    return res
      .status(400)
      .json(new ApiError(401, "something went wrong while finding token in db"))
  }

  console.log("isTokenMatching", emailToken == dbToken.emailToken)
  if (emailToken !== dbToken.emailToken)
    return res.status(400).json(new ApiError(500, "token didnt match"))

  let user
  try {
    user = await User.findOne({ _id: emailTokenPayload?.userId })
    console.log("user", user)
    if (!user)
      return res
        .status(400)
        .json(new ApiError(500, "user with given token not found"))
  } catch (error) {
    return res
      .status(400)
      .json(new ApiError(401, "something went wrong while finding user in db"))
  }

  let savedUser
  console.log("hello before the switch")
  switch (emailTokenPayload?.emailType) {
    case emailTypesObject.emailUpdate:
      try {
        const existingEmail = await User.findOne({ email })
        if (existingEmail)
          return res
            .status(400)
            .json(new ApiError(500, "email already exists with another user"))
      } catch (error) {
        return res
          .status(400)
          .json(
            new ApiError(
              500,
              "something went wrong while checking if email already exists with another user"
            )
          )
      }

      user.email = email

      try {
        savedUser = await user?.save({ validateBeforeSave: false })
        console.log("savedUser?._id", savedUser?._id)
      } catch (error) {
        return res
          .status(400)
          .json(
            new ApiError(500, "something went wrong while trying to save user")
          )
      }

      req.body = {
        email,
        userId: savedUser?._id.toString(),
        emailType: emailTypesObject.emailVerification,
      }
      next()
      return
    case emailTypesObject.emailVerification:
      user.isEmailVerified = true
      break
    case emailTypesObject.forgotPassword:
      user.password = password
      break
    default:
      console.log(
        "default should be wtf is this email type: ",
        emailTokenPayload?.emailType
      )
      break
  }

  try {
    let accessToken, refreshToken
    if (!authStatus) {
      const authTokens = await generateAuthTokens(user._id)
      accessToken = authTokens.accessToken
      refreshToken = authTokens.refreshToken
      user.refreshToken = refreshToken
    }

    savedUser = await user?.save({ validateBeforeSave: false })
    console.log("saveduser", savedUser)

    if (!authStatus) {
      return res
        .status(200)
        .cookie("accessToken", accessToken, {
          ...options,
          maxAge: eval(process.env.ACCESS_TOKEN_COOKIE_EXPIRY),
        })
        .cookie("refreshToken", refreshToken, {
          ...options,
          maxAge: eval(process.env.REFRESH_TOKEN_COOKIE_EXPIRY),
        })
        .json(
          new ApiResponse(
            200,
            { savedUser, accessToken, refreshToken },
            "user logged in successfully"
          )
        )
    } else
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { savedUser },
            "email action completed successfully"
          )
        )
  } catch (error) {
    console.error(error)

    return res
      .status(400)
      .json(new ApiError(500, "something went wrong while trying to save user"))
  }
})

export const loginUser = asyncHandler(async (req, res) => {
  try {
    const validatedData = loginSchema.safeParse(req.body)
    if (!validatedData.success)
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            "seems like validation error",
            validatedData.error.issues
          )
        )
    const { email, password } = validatedData.data

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json(new ApiError(400, "user not found"))

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid)
      return res.status(400).json(new ApiError(401, "invalid password"))

    const { accessToken, refreshToken } = await generateAuthTokens(user._id)
    user.refreshToken = refreshToken
    const savedUser = await user.save({ validateBeforeSave: false })

    return res
      .status(200)
      .cookie("accessToken", accessToken, {
        ...options,
        maxAge: eval(process.env.ACCESS_TOKEN_COOKIE_EXPIRY),
      })
      .cookie("refreshToken", refreshToken, {
        ...options,
        maxAge: eval(process.env.REFRESH_TOKEN_COOKIE_EXPIRY),
      })
      .json(
        new ApiResponse(
          200,
          { savedUser, accessToken, refreshToken },
          "user logged in successfully"
        )
      )
  } catch (error) {
    if (error instanceof ApiError) return res.status(400).json(error)
    return res
      .status(400)
      .json(new ApiError(500, "something went wrong while logging in user"))
  }
})

export const updateTokens = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.signedCookies.refreshToken || req.body.refreshToken
  if (!incomingRefreshToken)
    return res.status(400).json(new ApiError(401, "refresh token is required"))

  let decodedToken
  try {
    decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
  } catch (error) {
    return res
      .status(400)
      .json(new ApiError(401, "invalid refresh token. it probably expired"))
  }

  try {
    const user = await User.findById(decodedToken?._id)
    if (!user) return res.status(400).json(new ApiError(401, "user not found"))

    if (incomingRefreshToken !== user?.refreshToken)
      return res
        .status(400)
        .json(
          new ApiError(
            401,
            "invalid refresh token. doesnt match refresh token in db"
          )
        )

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAuthTokens(user._id)
    user.refreshToken = newRefreshToken
    const savedUser = await user.save({ validateBeforeSave: false })
    return res
      .status(200)
      .cookie("accessToken", accessToken, {
        ...options,
        maxAge: eval(process.env.ACCESS_TOKEN_COOKIE_EXPIRY),
      })
      .cookie("refreshToken", newRefreshToken, {
        ...options,
        maxAge: eval(process.env.REFRESH_TOKEN_COOKIE_EXPIRY),
      })
      .json(
        new ApiResponse(
          200,
          { savedUser, accessToken, refreshToken: newRefreshToken },
          "access token refreshed successfully"
        )
      )
  } catch (error) {
    if (error instanceof ApiError) return res.status(400).json(error)
    return res
      .status(400)
      .json(new ApiError(500, "something went wrong while updating tokens"))
  }
})

export const logoutUser = asyncHandler(async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: { refreshToken: 1 },
      },
      { new: true }
    )

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "user logged out successfully"))
  } catch (error) {
    return res
      .status(400)
      .json(new ApiError(500, "something went wrong while logging out user"))
  }
})

export const updateAccount = asyncHandler(async (req, res) => {
  const validatedData = updateSchema.safeParse(req.body)
  if (!validatedData.success)
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "seems like validation error",
          validatedData.error.issues
        )
      )
  const { password, newPassword, newUsername } = validatedData.data

  const isPasswordValid = await req.user?.isPasswordCorrect(password)
  if (!isPasswordValid)
    return res.status(400).json(new ApiError(401, "invalid password"))

  if (newPassword) req.user.password = newPassword
  if (newUsername) {
    try {
      const existingUsername = await User.findOne({ username: newUsername })
      if (existingUsername)
        return res
          .status(400)
          .json(new ApiError(500, "username exists with another user"))
    } catch (error) {
      return res
        .status(400)
        .json(
          new ApiError(
            500,
            "something went wrong while trying to check if username exists with another user"
          )
        )
    }
    req.user.username = newUsername
  }

  const avatarLocalPath = req.file?.path
  let avatar
  if (avatarLocalPath) {
    try {
      avatar = await uploadOnCloud(
        avatarLocalPath,
        `${req.user._id}_avatar.jpg`
      )
    } catch (error) {
      return res.status(400).json(new ApiError(400, "failed to update avatar"))
    }
    req.user.avatar = avatar
  }

  try {
    const user = await req.user.save({ validateBeforeSave: false })
    return res
      .status(200)
      .json(new ApiResponse(200, user, "account details updated successfully"))
  } catch (error) {
    if (avatar) {
      await deleteFromCloud(`${req.user._id}_avatar.jpg`)
    }
    return res
      .status(400)
      .json(
        new ApiError(
          500,
          "Something went wrong while saving user changes & images were deleted"
        )
      )
  }
})

export const deleteAccount = asyncHandler(async (req, res) => {
  const validatedData = passwordSchema.safeParse(req.body)
  if (!validatedData.success)
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "seems like validation error",
          validatedData.error.issues
        )
      )
  const { password } = validatedData.data

  const isPasswordValid = await req.user.isPasswordCorrect(password)
  if (!isPasswordValid)
    return res.status(400).json(new ApiError(401, "invalid password"))

  try {
    req.user?.deleteOne()
  } catch (error) {
    return res
      .status(400)
      .json(new ApiError(401, "couldnt delete the user account"))
  }

  try {
    if (req.user?.avatar) await deleteFromCloud(`${req.user._id}_avatar.jpg`)
  } catch (error) {
    return res
      .status(400)
      .json(new ApiError(401, "couldnt delete the user avatar"))
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user deleted successfully"))
})
