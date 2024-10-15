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

export const signupSchema = z.object({
  username: usernameSchema,
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: passwordSchema,
});
