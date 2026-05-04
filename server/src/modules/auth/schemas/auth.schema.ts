import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(100, 'Tên không được vượt quá 100 ký tự'),
  email: z
    .string()
    .email('Email không hợp lệ'),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('Email không hợp lệ'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const createUserSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.string().optional(),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  role: z.string().optional(),
});

export const updateCurrentProfileSchema = z.object({
  fullName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(100, 'Tên không được vượt quá 100 ký tự').optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateCurrentProfileInput = z.infer<typeof updateCurrentProfileSchema>;

export type UserResponse = {
  id: string;
  fullName: string;
  email: string;
  role: string;
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
