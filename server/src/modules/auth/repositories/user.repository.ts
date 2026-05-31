import { Repository } from 'typeorm';
import { AppDataSource } from '@/configs/database.config';
import { User } from '@/modules/auth/entities/user.model';
import { CreateUserInput, UpdateProfileInput } from '@/modules/auth/schemas/auth.schema';

export class UserRepository {
  private get repository(): Repository<User> {
    return AppDataSource.getRepository(User);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({ where: { username } });
  }

  async findById(idUser: string): Promise<User | null> {
    return this.repository.findOne({ where: { idUser } });
  }

  async create(userData: CreateUserInput): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  async update(idUser: string, updateData: Partial<User>): Promise<User | null> {
    const result = await this.repository.update({ idUser }, updateData);
    if (!result.affected) {
      return null;
    }

    return this.findById(idUser);
  }

  async updateLastLogin(idUser: string): Promise<void> {
    await this.repository.update({ idUser }, { lastLogin: new Date() });
  }

  async delete(idUser: string): Promise<boolean> {
    const result = await this.repository.delete({ idUser });
    return Boolean(result.affected);
  }
}

export const userRepository = new UserRepository();
