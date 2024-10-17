import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .min(2, "Username must be at least 2 characters")
  .max(20, "Username must be no more than 20 characters")
  .toLowerCase();

const passwordSchema = z
  .string()
  .trim()
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,12}$/,
    {
      message:
        "Password must be 6-12 characters long, and include at least one lowercase letter, one uppercase letter, one number, and one special character.",
    }
  );

export const emailSchema = z
  .string()
  .trim()
  .email({ message: "Invalid email address" });

export const signupSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const updateSchema = z
  .object({
    oldEmail: z.string().trim().email({ message: "Invalid old email address" }),
    newEmail: z.string().trim().email({ message: "Invalid new email address" }),
    oldPassword: passwordSchema,
    newPassword: passwordSchema,
  })
  .partial();
