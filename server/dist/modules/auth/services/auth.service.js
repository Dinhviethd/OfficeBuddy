"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_repository_1 = require("../../../modules/auth/repositories/user.repository");
const error_response_1 = require("../../../utils/error.response");
const email_1 = require("../../../utils/email");
class AuthService {
    userRepo;
    constructor() {
        this.userRepo = user_repository_1.userRepository;
    }
    async register(input) {
        const username = input.username.trim();
        const { password } = input;
        const existingUser = await this.userRepo.findByUsername(username);
        if (existingUser) {
            throw new error_response_1.AppError(400, 'Tên tài khoản đã được sử dụng');
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
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
    async login(input) {
        const username = input.username.trim();
        const { password } = input;
        const user = await this.userRepo.findByUsername(username);
        if (!user) {
            throw new error_response_1.AppError(401, 'Tên tài khoản hoặc mật khẩu không chính xác');
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new error_response_1.AppError(401, 'Tên tài khoản hoặc mật khẩu không chính xác');
        }
        const tokens = this.generateTokens(user.idUser);
        return {
            user: this.toUserResponse(user),
            ...tokens,
        };
    }
    async refreshToken(refreshToken) {
        try {
            const secret = process.env.JWT_REFRESH_SECRET;
            if (!secret) {
                throw new Error('JWT_REFRESH_SECRET is not defined');
            }
            const decoded = jsonwebtoken_1.default.verify(refreshToken, secret);
            const user = await this.userRepo.findById(decoded.userId);
            if (!user) {
                throw new error_response_1.AppError(401, 'User không tồn tại');
            }
            return this.generateTokens(user.idUser);
        }
        catch (error) {
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                throw new error_response_1.AppError(401, 'Refresh token không hợp lệ hoặc đã hết hạn');
            }
            throw error;
        }
    }
    async getCurrentUser(userId) {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new error_response_1.AppError(404, 'User không tồn tại');
        }
        return this.toUserResponse(user);
    }
    async updateCurrentProfile(userId, input) {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new error_response_1.AppError(404, 'User không tồn tại');
        }
        if (input.username && input.username !== user.username) {
            const existingUser = await this.userRepo.findByUsername(input.username);
            if (existingUser && existingUser.idUser !== userId) {
                throw new error_response_1.AppError(400, 'Tên tài khoản đã được sử dụng');
            }
        }
        const updatedUser = await this.userRepo.update(userId, input);
        if (!updatedUser) {
            throw new error_response_1.AppError(404, 'User không tồn tại');
        }
        return this.toUserResponse(updatedUser);
    }
    async changePassword(userId, input) {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new error_response_1.AppError(404, 'User không tồn tại');
        }
        const isPasswordValid = await bcryptjs_1.default.compare(input.currentPassword, user.password);
        if (!isPasswordValid) {
            throw new error_response_1.AppError(400, 'Mật khẩu hiện tại không chính xác');
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(input.newPassword, salt);
        await this.userRepo.update(userId, {
            password: hashedPassword,
        });
    }
    async logout(userId) {
    }
    async forgotPassword(input) {
        const { email } = input;
        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            throw new error_response_1.AppError(404, 'Email không tồn tại trong hệ thống');
        }
        const otp = (0, email_1.generateOTP)();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
        await this.userRepo.update(user.idUser, {
            resetOTP: otp,
            resetOTPExpires: otpExpires,
        });
        await (0, email_1.sendOTPEmail)(email, otp);
    }
    async verifyOTP(input) {
        const { email, otp } = input;
        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            throw new error_response_1.AppError(404, 'Email không tồn tại trong hệ thống');
        }
        if (!user.resetOTP || !user.resetOTPExpires) {
            throw new error_response_1.AppError(400, 'Bạn chưa yêu cầu đặt lại mật khẩu');
        }
        if (new Date() > user.resetOTPExpires) {
            throw new error_response_1.AppError(400, 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới');
        }
        if (user.resetOTP !== otp) {
            throw new error_response_1.AppError(400, 'Mã OTP không chính xác');
        }
        return { valid: true };
    }
    async resetPassword(input) {
        const { email, otp, newPassword } = input;
        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            throw new error_response_1.AppError(404, 'Email không tồn tại trong hệ thống');
        }
        if (!user.resetOTP || !user.resetOTPExpires) {
            throw new error_response_1.AppError(400, 'Bạn chưa yêu cầu đặt lại mật khẩu');
        }
        if (new Date() > user.resetOTPExpires) {
            throw new error_response_1.AppError(400, 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới');
        }
        if (user.resetOTP !== otp) {
            throw new error_response_1.AppError(400, 'Mã OTP không chính xác');
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
        await this.userRepo.update(user.idUser, {
            password: hashedPassword,
            resetOTP: undefined,
            resetOTPExpires: undefined,
        });
    }
    generateTokens(userId) {
        const accessSecret = process.env.JWT_ACCESS_SECRET;
        const refreshSecret = process.env.JWT_REFRESH_SECRET;
        if (!accessSecret || !refreshSecret) {
            throw new Error('JWT secrets are not defined in environment');
        }
        const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
        const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
        const accessToken = jsonwebtoken_1.default.sign({ userId }, accessSecret, { expiresIn: accessExpiresIn });
        const refreshToken = jsonwebtoken_1.default.sign({ userId }, refreshSecret, { expiresIn: refreshExpiresIn });
        return { accessToken, refreshToken };
    }
    toUserResponse(user) {
        return {
            idUser: user.idUser,
            username: user.username,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
