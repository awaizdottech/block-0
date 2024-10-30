import mongoose, { Schema } from "mongoose"

const tokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
    },
    emailToken: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
)

tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const EmailToken = mongoose.model("emailToken", tokenSchema)
