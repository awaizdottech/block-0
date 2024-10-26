import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import { healthCheckRouter } from "./routers/healthCheck.routes.js"
import { userRouter } from "./routers/user.routes.js"
import { ApiError } from "./utils/standards.js"

export const app = express()
// common middleware
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(morgan("dev"))
app.use(
  cors({
    origin:
      process.env.NODE_ENV == "production" ? process.env.CORS_ORIGIN : "*",
    credentials: true,
  })
)

app.use("/api/v1/health", healthCheckRouter)
app.use("/api/v1/user", userRouter)

app.use((req, res, next) => {
  return res.status(404).json(new ApiError(404, "internal server error"))
})
