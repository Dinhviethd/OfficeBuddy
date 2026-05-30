import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository, userRepository } from '@/modules/auth/repositories/user.repository';
import {
  RegisterInput,
  LoginInput,
  SendOTPInput,
  ResetPasswordInput,
  VerifyOTPInput,
  UpdateCurrentProfileInput,
  ChangePasswordInput,
  AuthResponse,
  UserResponse,
} from '@/modules/auth/schemas/auth.schema';
import { AppError } from '@/utils/error.response';
import { User } from "@/modules/auth/entities/user.model";
import { generateOTP, sendOTPEmail } from '@/utils/email';
import { uploadBufferToCloudinary } from '@/utils/upload';

export class AuthService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = userRepository;
  }

  
  async register(input: RegisterInput): Promise<AuthResponse> {
    const username = input.username.trim();
    const { password } = input;

    const existingUser = await this.userRepo.findByUsername(username);
    if (existingUser) {
      throw new AppError(400, 'Tên tài khoản đã được sử dụng');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await this.userRepo.create({
      username,
      password: hashedPassword,
    });

    const tokens = this.generateTokens(newUser.idUser);

    return {
      user: this.toUserResponse(newUser),
      ...tokens,
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const username = input.username.trim();
    const { password } = input;

    const user = await this.userRepo.findByUsername(username);
    if (!user) {
      throw new AppError(401, 'Tên tài khoản hoặc mật khẩu không chính xác');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Tên tài khoản hoặc mật khẩu không chính xác');
    }

    const tokens = this.generateTokens(user.idUser);

    return {
      user: this.toUserResponse(user),
      ...tokens,
    };
  }

  
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const secret = process.env.JWT_REFRESH_SECRET;
      if (!secret) {
        throw new Error('JWT_REFRESH_SECRET is not defined');
      }

      const decoded = jwt.verify(refreshToken, secret) as { userId: string };
      
      
      const user = await this.userRepo.findById(decoded.userId);
      if (!user) {
        throw new AppError(401, 'User không tồn tại');
      }

      
      return this.generateTokens(user.idUser);
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new AppError(401, 'Refresh token không hợp lệ hoặc đã hết hạn');
      }
      throw error;
    }
  }

  
  async getCurrentUser(userId: string): Promise<UserResponse> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError(404, 'User không tồn tại');
    }
    return this.toUserResponse(user);
  }

  async updateCurrentProfile(userId: string, input: UpdateCurrentProfileInput): Promise<UserResponse> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError(404, 'User không tồn tại');
    }

    if (input.username && input.username !== user.username) {
      const existingUser = await this.userRepo.findByUsername(input.username);
      if (existingUser && existingUser.idUser !== userId) {
        throw new AppError(400, 'Tên tài khoản đã được sử dụng');
      }
    }

    const updatedUser = await this.userRepo.update(userId, input);
    if (!updatedUser) {
      throw new AppError(404, 'User không tồn tại');
    }

    return this.toUserResponse(updatedUser);
  }

  async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError(404, 'User không tồn tại');
    }

    const isPasswordValid = await bcrypt.compare(input.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError(400, 'Mật khẩu hiện tại không chính xác');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(input.newPassword, salt);

    await this.userRepo.update(userId, {
      password: hashedPassword,
    });
  }

  async logout(userId: string): Promise<void> {
  }

  async forgotPassword(input: SendOTPInput): Promise<void> {
    const { email } = input;
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new AppError(404, 'Email không tồn tại trong hệ thống');
    }

    
    const otp = generateOTP();
    
    
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    
    await this.userRepo.update(user.idUser, {
      resetOTP: otp,
      resetOTPExpires: otpExpires,
    });

    
    await sendOTPEmail(email, otp);
  }

  
  async verifyOTP(input: VerifyOTPInput): Promise<{ valid: boolean }> {
    const { email, otp } = input;

    
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new AppError(404, 'Email không tồn tại trong hệ thống');
    }

    
    if (!user.resetOTP || !user.resetOTPExpires) {
      throw new AppError(400, 'Bạn chưa yêu cầu đặt lại mật khẩu');
    }

    
    if (new Date() > user.resetOTPExpires) {
      throw new AppError(400, 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới');
    }

    
    if (user.resetOTP !== otp) {
      throw new AppError(400, 'Mã OTP không chính xác');
    }

    return { valid: true };
  }

  
  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const { email, otp, newPassword } = input;

    
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new AppError(404, 'Email không tồn tại trong hệ thống');
    }

    
    if (!user.resetOTP || !user.resetOTPExpires) {
      throw new AppError(400, 'Bạn chưa yêu cầu đặt lại mật khẩu');
    }

    
    if (new Date() > user.resetOTPExpires) {
      throw new AppError(400, 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới');
    }

    
    if (user.resetOTP !== otp) {
      throw new AppError(400, 'Mã OTP không chính xác');
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    
    await this.userRepo.update(user.idUser, {
      password: hashedPassword,
      resetOTP: undefined,
      resetOTPExpires: undefined,
    });
  }

  
  private generateTokens(userId: string): { accessToken: string; refreshToken: string } {
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!accessSecret || !refreshSecret) {
      throw new Error('JWT secrets are not defined in environment');
    }

    const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    const accessToken = jwt.sign(
      { userId },
      accessSecret,
      { expiresIn: accessExpiresIn } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { userId },
      refreshSecret,
      { expiresIn: refreshExpiresIn } as jwt.SignOptions
    );

    return { accessToken, refreshToken };
  }

  
  private toUserResponse(user: User): UserResponse {
    return {
      idUser: user.idUser,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}


export const authService = new AuthService();
