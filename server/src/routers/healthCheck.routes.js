import { Router } from "express";
import { healthCheck } from "../controllers/healthCheck.controllers.js";

export const healthCheckRouter = Router();

healthCheckRouter.route("/").get(healthCheck);

healthCheckRouter.use((req, res, next) => {
  return res
    .status(404)
    .json(
      new ApiError(
        404,
        "Oops! u might wanna check the route or request method!"
      )
    );
});
