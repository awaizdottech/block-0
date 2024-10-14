import { ApiResponse } from "../utils/standards.js";

export const healthCheck = (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "ok", "health check passed"));
};
