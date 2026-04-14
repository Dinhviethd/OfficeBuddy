import { Request, Response } from 'express';
import { authService } from '@/modules/auth/services/auth.service';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  sendOTPSchema,
  verifyOTPSchema,
  resetPasswordSchema,
  updateCurrentProfileSchema,
  changePasswordSchema,
  updatePresetAvatarSchema,
  ApiResponse,
  AuthResponse,
  UserResponse,
} from '@/modules/auth/schemas/auth.schema';
import { asyncHandler, AppError } from '@/utils/error.response';

class AuthController {
  // Đăng ký tài khoản mới
  register = asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues
        .map((err: any) => err.message)
        .join(', ');
      throw new AppError(400, errorMessage);
    }

    const result = await authService.register(validationResult.data);

    // Set refresh token vào cookie
    this.setRefreshTokenCookie(res, result.refreshToken);

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: 'Đăng ký thành công',
      data: result,
    };

    res.status(201).json(response);
  });

  // Đăng nhập
  login = asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues
        .map((err: any) => err.message)
        .join(', ');
      throw new AppError(400, errorMessage);
    }

    const result = await authService.login(validationResult.data);

    // Set refresh token vào cookie
    this.setRefreshTokenCookie(res, result.refreshToken);

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: 'Đăng nhập thành công',
      data: result,
    };

    res.status(200).json(response);
  });

  // Refresh token
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    // Lấy refresh token từ cookie hoặc body
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      throw new AppError(400, 'Refresh token is required');
    }

    const tokens = await authService.refreshToken(refreshToken);

    // Set refresh token mới vào cookie
    this.setRefreshTokenCookie(res, tokens.refreshToken);

    const response: ApiResponse<{ accessToken: string; refreshToken: string }> = {
      success: true,
      message: 'Token đã được làm mới',
      data: tokens,
    };

    res.status(200).json(response);
  });

  // Lấy thông tin user hiện tại
  getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const user = await authService.getCurrentUser(userId);

    const response: ApiResponse<UserResponse> = {
      success: true,
      message: 'Lấy thông tin user thành công',
      data: user,
    };

    res.status(200).json(response);
  });

  getCurrentAvatar = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const user = await authService.getCurrentUser(userId);

    const response: ApiResponse<{ avatarUrl?: string }> = {
      success: true,
      message: 'Lấy ảnh đại diện thành công',
      data: {
        avatarUrl: user.avatarUrl,
      },
    };

    res.status(200).json(response);
  });

  updateCurrentProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const validationResult = updateCurrentProfileSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues
        .map((err: any) => err.message)
        .join(', ');
      throw new AppError(400, errorMessage);
    }

    const user = await authService.updateCurrentProfile(userId, validationResult.data);

    const response: ApiResponse<UserResponse> = {
      success: true,
      message: 'Cập nhật thông tin cá nhân thành công',
      data: user,
    };

    res.status(200).json(response);
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const validationResult = changePasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues
        .map((err: any) => err.message)
        .join(', ');
      throw new AppError(400, errorMessage);
    }

    await authService.changePassword(userId, validationResult.data);

    const response: ApiResponse<null> = {
      success: true,
      message: 'Đổi mật khẩu thành công',
    };

    res.status(200).json(response);
  });

  uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    if (!req.file?.buffer) {
      throw new AppError(400, 'Vui lòng chọn ảnh đại diện');
    }

    const user = await authService.uploadAvatar(userId, req.file.buffer);

    const response: ApiResponse<UserResponse> = {
      success: true,
      message: 'Cập nhật ảnh đại diện thành công',
      data: user,
    };

    res.status(200).json(response);
  });

  updatePresetAvatar = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const validationResult = updatePresetAvatarSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues
        .map((err: any) => err.message)
        .join(', ');
      throw new AppError(400, errorMessage);
    }

    const user = await authService.updatePresetAvatar(userId, validationResult.data.avatarUrl);

    const response: ApiResponse<UserResponse> = {
      success: true,
      message: 'Cập nhật avatar thành công',
      data: user,
    };

    res.status(200).json(response);
  });

  // Đăng xuất
  logout = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (userId) {
      await authService.logout(userId);
    }

    // Xóa refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    const response: ApiResponse<null> = {
      success: true,
      message: 'Đăng xuất thành công',
    };

    res.status(200).json(response);
  });

  // Quên mật khẩu - gửi OTP
  sendOTP = asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const validationResult = sendOTPSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues
        .map((err: any) => err.message)
        .join(', ');
      throw new AppError(400, errorMessage);
    }

    await authService.forgotPassword(validationResult.data);

    const response: ApiResponse<null> = {
      success: true,
      message: 'Mã OTP đã được gửi đến email của bạn',
    };

    res.status(200).json(response);
  });

  // Xác nhận OTP
  verifyOTP = asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const validationResult = verifyOTPSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues
        .map((err: any) => err.message)
        .join(', ');
      throw new AppError(400, errorMessage);
    }

    const result = await authService.verifyOTP(validationResult.data);

    const response: ApiResponse<{ valid: boolean }> = {
      success: true,
      message: 'Mã OTP hợp lệ',
      data: result,
    };

    res.status(200).json(response);
  });

  // Đặt lại mật khẩu
  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const validationResult = resetPasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues
        .map((err: any) => err.message)
        .join(', ');
      throw new AppError(400, errorMessage);
    }

    await authService.resetPassword(validationResult.data);

    const response: ApiResponse<null> = {
      success: true,
      message: 'Đặt lại mật khẩu thành công',
    };

    res.status(200).json(response);
  });

  // Helper method để set refresh token cookie
  private setRefreshTokenCookie(res: Response, refreshToken: string): void {
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge,
    });
  }
}

export const authController = new AuthController();
