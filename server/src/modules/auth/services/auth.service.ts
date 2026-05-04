import jwt from 'jsonwebtoken';
import { UserRepository, userRepository } from '@/modules/auth/repositories/user.repository';
import {
  RegisterInput,
  LoginInput,
  UpdateCurrentProfileInput,
  AuthResponse,
  UserResponse,
} from '@/modules/auth/schemas/auth.schema';
import { AppError } from '@/utils/error.response';
import { User } from "@/modules/auth/entities/user.model";


export class AuthService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = userRepository;
  }

  
  async register(input: RegisterInput): Promise<AuthResponse> {
    const { fullName, email } = input;

    
    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser) {
      throw new AppError(400, 'Email đã được sử dụng');
    }

    
    const newUser = await this.userRepo.create({
      fullName,
      email,
    });

    
    const tokens = this.generateTokens(newUser.id);

    return {
      user: this.toUserResponse(newUser),
      ...tokens,
    };
  }

  
  async login(input: LoginInput): Promise<AuthResponse> {
    const { email } = input;

    
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new AppError(401, 'Email hoặc mật khẩu không chính xác');
    }

    
    const tokens = this.generateTokens(user.id);

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

      
      return this.generateTokens(user.id);
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

    const updatedUser = await this.userRepo.update(userId, input);
    if (!updatedUser) {
      throw new AppError(404, 'User không tồn tại');
    }

    return this.toUserResponse(updatedUser);
  }

  async logout(userId: string): Promise<void> {
    // Có thể thêm logic để invalidate token ở đây
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
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}


export const authService = new AuthService();
