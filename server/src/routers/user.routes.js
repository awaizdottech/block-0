import { Router } from "express"
import {
  loginUser,
  updateTokens,
  signupUser,
  logoutUser,
  sendEmail,
  emailAction,
  updateAccount,
  deleteAccount,
} from "../controllers/user.controllers.js"
import { upload } from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import { ApiError } from "../utils/standards.js"

export const userRouter = Router()

userRouter.route("/signup").post(upload.single("avatar"), signupUser)
userRouter.route("/login").post(loginUser)
userRouter.route("/update-tokens").patch(updateTokens)
userRouter.route("/send-email").post(sendEmail)
userRouter.route("/email-action").post(emailAction, sendEmail)

userRouter.use(verifyJWT)
userRouter.route("/logout").post(logoutUser)
userRouter
  .route("/account")
  .patch(upload.single("avatar"), updateAccount)
  .delete(deleteAccount)

userRouter.use((req, res, next) => {
  return res
    .status(404)
    .json(
      new ApiError(
        404,
        "Oops! u might wanna check the route or request method!"
      )
    )
})
