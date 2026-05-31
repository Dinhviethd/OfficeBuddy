import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string()
    .email('Email không hợp lệ'),
  password: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(50, 'Mật khẩu không được vượt quá 50 ký tự'),
  confirmPassword: z.string(),
  fullName: z
    .string()
    .min(1, 'Vui lòng nhập họ tên')
    .max(100, 'Họ tên không được vượt quá 100 ký tự'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('Vui lòng nhập email hợp lệ'),
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const sendOTPSchema = z.object({
  email: z
    .string()
    .email('Email không hợp lệ'),
});

export const verifyOTPSchema = z.object({
  email: z
    .string()
    .email('Email không hợp lệ'),
  otp: z
    .string()
    .length(6, 'Mã OTP phải có 6 chữ số')
    .regex(/^\d{6}$/, 'Mã OTP chỉ chứa số'),
});

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .email('Email không hợp lệ'),
  otp: z
    .string()
    .length(6, 'Mã OTP phải có 6 chữ số')
    .regex(/^\d{6}$/, 'Mã OTP chỉ chứa số'),
  newPassword: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(50, 'Mật khẩu không được vượt quá 50 ký tự')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(255),
  fullName: z.string().optional().default(''),
  role: z.enum(['user', 'admin']).optional().default('user'),
  username: z.string().optional(),
  resetOTP: z.string().optional(),
  resetOTPExpires: z.date().optional(),
});

export const updateProfileSchema = createUserSchema.partial();

export const updateCurrentProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Tên tài khoản phải có ít nhất 3 ký tự')
    .max(50, 'Tên tài khoản không được vượt quá 50 ký tự')
    .regex(/^[a-zA-Z0-9_]+$/, 'Tên tài khoản chỉ chứa chữ, số và dấu gạch dưới')
    .optional(),
  fullName: z
    .string()
    .max(100, 'Họ tên không được vượt quá 100 ký tự')
    .optional(),
});

export const uploadAvatarSchema = z.object({
  imageBase64: z.string().min(1, 'Ảnh đại diện là bắt buộc'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(50, 'Mật khẩu không được vượt quá 50 ký tự')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type SendOTPInput = z.infer<typeof sendOTPSchema>;
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateCurrentProfileInput = z.infer<typeof updateCurrentProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export type UserResponse = {
  idUser: string;
  email: string;
  role: string;
  fullName: string;
  username?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthResponse = {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};
