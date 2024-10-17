import mongoose, { Schema } from "mongoose";
import { emailTypes } from "../constants";

const tokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true },
    type: { type: String, enum: emailTypes, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Token = mongoose.model("Token", tokenSchema);
