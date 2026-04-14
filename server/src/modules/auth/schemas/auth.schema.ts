import { z } from 'zod';

export const PRESET_AVATAR_URLS = [
  '/avatar/meo.jpg',
  '/avatar/ti.jpg',
  '/avatar/dan.jpg',
  '/avatar/dau.jpg',
  '/avatar/hoi.jpg',
  '/avatar/mui.jpg',
  '/avatar/ngo.jpg',
  '/avatar/suu.jpg',
  '/avatar/than.jpg',
  '/avatar/thin.jpg',
  '/avatar/tuat.jpg',
  '/avatar/ty.jpg',
] as const;

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(100, 'Tên không được vượt quá 100 ký tự'),
  email: z
    .string()
    .email('Email không hợp lệ'),
  password: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(50, 'Mật khẩu không được vượt quá 50 ký tự')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'
    ),
  confirmPassword: z.string(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('Email không hợp lệ'),
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
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(255),
  emailVerified: z.boolean().optional(),
  avatarUrl: z.string().optional(),
  phone: z.string().optional(),
  resetOTP: z.string().optional(),
  resetOTPExpires: z.date().optional(),
});

export const updateProfileSchema = createUserSchema.partial();

export const updateCurrentProfileSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(100, 'Tên không được vượt quá 100 ký tự').optional(),
  phone: z.string().max(20, 'Số điện thoại không được vượt quá 20 ký tự').optional(),
  avatarUrl: z.string().url('Avatar URL không hợp lệ').optional(),
});

export const uploadAvatarSchema = z.object({
  imageBase64: z.string().min(1, 'Ảnh đại diện là bắt buộc'),
});

export const updatePresetAvatarSchema = z.object({
  avatarUrl: z.enum(PRESET_AVATAR_URLS, {
    message: 'Avatar không hợp lệ',
  }),
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
export type UpdatePresetAvatarInput = z.infer<typeof updatePresetAvatarSchema>;
export type PresetAvatarUrl = (typeof PRESET_AVATAR_URLS)[number];

export type UserResponse = {
  idUser: string;
  name: string;
  email: string;
  emailVerified: boolean;
  avatarUrl?: string;
  phone?: string;
  createdAt: Date;
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
