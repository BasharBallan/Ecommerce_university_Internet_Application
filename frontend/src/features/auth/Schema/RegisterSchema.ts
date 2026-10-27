import { z } from "zod";

export const registerSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(1, "الاسم الكامل مطلوب")
      .min(3, "يجب أن يتكون الاسم من 3 أحرف على الأقل"),

    email: z
      .string()
      .trim()
      .min(1, "البريد الإلكتروني مطلوب")
      .email("يرجى إدخال بريد إلكتروني صحيح"),

    password: z
      .string()
      .min(8, "كلمة المرور يجب أن تتكون من 8 أحرف على الأقل")
      .regex(/[A-Z]/, "يجب أن تحتوي على حرف إنجليزي كبير")
      .regex(/[a-z]/, "يجب أن تحتوي على حرف إنجليزي صغير")
      .regex(/[0-9]/, "يجب أن تحتوي على رقم"),

    password_confirmation: z
      .string()
      .min(1, "تأكيد كلمة المرور مطلوب"),
  })
  .refine(
    (data) => data.password === data.password_confirmation,
    {
      message: "كلمتا المرور غير متطابقتين",
      path: ["password_confirmation"],
    }
  );

export type RegisterFormValues = z.infer<typeof registerSchema>;