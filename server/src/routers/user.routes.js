import { Router } from "express";
import {
  getCurrentUser,
  loginUser,
  signupUser,
} from "../controllers/user.controllers.js";

export const userRouter = Router();

userRouter.route("/signup").post(signupUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/profile").post(getCurrentUser);
