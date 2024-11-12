import { z } from "zod"
import { emailTypesArray } from "../constants.js"

export const usernameSchema = z
  .string()
  .trim()
  .min(2, "Username must be at least 2 characters")
  .max(20, "Username must be no more than 20 characters")
  .toLowerCase()

export const passwordSchema = z
  .string()
  .trim()
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,12}$/,
    {
      message:
        "Password must be 6-12 characters long, and include at least one lowercase letter, one uppercase letter, one number, and one special character.",
    }
  )

const emailSchema = z
  .string()
  .trim()
  .email({ message: "Invalid email address" })

export const signupSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
})

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const sendEmailRequestSchema = z.object({
  email: emailSchema,
  userId: z
    .string()
    .trim()
    .regex(/^[a-f\d]{24}$/i, { message: "Invalid user id" })
    .optional(),
  emailVerificationStatus: z.boolean().optional(),
  emailType: z.string().refine(val => emailTypesArray.includes(val), {
    message:
      "emailType is required & must be one of the allowed email types: emailVerification, forgotPassword, emailUpdate, loginViaEmail",
  }),
})

export const emailActionSchema = z.object({
  emailToken: z.string(),
  authStatus: z.boolean(),
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
})

export const updateSchema = z
  .object({
    password: passwordSchema,
    newPassword: passwordSchema,
    newUsername: usernameSchema,
  })
  .partial()
