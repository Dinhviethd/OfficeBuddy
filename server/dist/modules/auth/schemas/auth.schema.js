"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.uploadAvatarSchema = exports.updateCurrentProfileSchema = exports.updateProfileSchema = exports.createUserSchema = exports.resetPasswordSchema = exports.verifyOTPSchema = exports.sendOTPSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    username: zod_1.z
        .string()
        .min(3, 'Tên tài khoản phải có ít nhất 3 ký tự')
        .max(50, 'Tên tài khoản không được vượt quá 50 ký tự')
        .regex(/^[a-zA-Z0-9_]+$/, 'Tên tài khoản chỉ chứa chữ, số và dấu gạch dưới'),
    password: zod_1.z
        .string()
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
        .max(50, 'Mật khẩu không được vượt quá 50 ký tự'),
    confirmPassword: zod_1.z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
});
exports.loginSchema = zod_1.z.object({
    username: zod_1.z
        .string()
        .min(1, 'Vui lòng nhập tên tài khoản'),
    password: zod_1.z
        .string()
        .min(1, 'Vui lòng nhập mật khẩu'),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
exports.sendOTPSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .email('Email không hợp lệ'),
});
exports.verifyOTPSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .email('Email không hợp lệ'),
    otp: zod_1.z
        .string()
        .length(6, 'Mã OTP phải có 6 chữ số')
        .regex(/^\d{6}$/, 'Mã OTP chỉ chứa số'),
});
exports.resetPasswordSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .email('Email không hợp lệ'),
    otp: zod_1.z
        .string()
        .length(6, 'Mã OTP phải có 6 chữ số')
        .regex(/^\d{6}$/, 'Mã OTP chỉ chứa số'),
    newPassword: zod_1.z
        .string()
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
        .max(50, 'Mật khẩu không được vượt quá 50 ký tự')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
    confirmPassword: zod_1.z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
});
exports.createUserSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(50),
    password: zod_1.z.string().min(6).max(255),
    resetOTP: zod_1.z.string().optional(),
    resetOTPExpires: zod_1.z.date().optional(),
});
exports.updateProfileSchema = exports.createUserSchema.partial();
exports.updateCurrentProfileSchema = zod_1.z.object({
    username: zod_1.z
        .string()
        .min(3, 'Tên tài khoản phải có ít nhất 3 ký tự')
        .max(50, 'Tên tài khoản không được vượt quá 50 ký tự')
        .regex(/^[a-zA-Z0-9_]+$/, 'Tên tài khoản chỉ chứa chữ, số và dấu gạch dưới')
        .optional(),
});
exports.uploadAvatarSchema = zod_1.z.object({
    imageBase64: zod_1.z.string().min(1, 'Ảnh đại diện là bắt buộc'),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: zod_1.z
        .string()
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
        .max(50, 'Mật khẩu không được vượt quá 50 ký tự')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
    confirmPassword: zod_1.z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
});
