import { Repository } from 'typeorm';
import { AppDataSource } from '@/configs/database.config';
import { User } from '@/modules/auth/entities/user.model';
import { CreateUserInput, UpdateProfileInput } from '@/modules/auth/schemas/auth.schema';
export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  // Tìm user theo email
  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email },
    });
  }

  // Tìm user theo ID
  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  // Tạo user mới
  async create(userData: CreateUserInput): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  // Cập nhật user
  async update(id: string, updateData: UpdateProfileInput): Promise<User | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  // Xóa user
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }


}

// Export singleton instance
export const userRepository = new UserRepository();
