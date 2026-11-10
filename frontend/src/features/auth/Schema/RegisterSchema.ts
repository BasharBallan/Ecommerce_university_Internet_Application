import { z } from "zod";

export const registerSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(1, "name is required")
      .min(3, "name must be at least 3 char"),

    email: z
      .string()
      .trim()
      .min(1, "email is required")
      .email("please enter valid email "),

    password: z
      .string()
      .min(8, "password must be at least 8 char")
      .regex(/[A-Z]/, "password must contain an uppercase English letter")
      .regex(/[a-z]/, "password must contain a lowercase English letter")
      .regex(/[0-9]/, "password must contain a number"),

    password_confirmation: z
      .string()
      .min(1, "password confirmation is required"),
  })
  .refine(
    (data) => data.password === data.password_confirmation,
    {
      message: "passwords do not match",
      path: ["password_confirmation"],
    }
  );

export type RegisterFormValues = z.infer<typeof registerSchema>;