import { Router } from "express";
import { healthCheck } from "../controllers/healthCheck.controllers.js";

export const healthCheckRouter = Router();
healthCheckRouter.route("/").get(healthCheck);
