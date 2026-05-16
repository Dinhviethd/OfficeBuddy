import { Repository } from 'typeorm';
import { User } from '@/modules/auth/entities/user.model';
import { CreateUserInput, UpdateProfileInput } from '@/modules/auth/schemas/auth.schema';
import { mockUserStore } from './mock-user.store';

export class UserRepository {
  // Using mock store for development without database
  // Replace with actual database repository when database is ready

  async findByEmail(email: string): Promise<User | null> {
    return mockUserStore.findByEmail(email);
  }

  async findByUsername(username: string): Promise<User | null> {
    return mockUserStore.findByUsername(username);
  }

  async findById(idUser: string): Promise<User | null> {
    return mockUserStore.findById(idUser);
  }

  async create(userData: CreateUserInput): Promise<User> {
    return mockUserStore.create(userData);
  }

  async update(idUser: string, updateData: UpdateProfileInput): Promise<User | null> {
    return mockUserStore.update(idUser, updateData);
  }

  async delete(idUser: string): Promise<boolean> {
    return mockUserStore.delete(idUser);
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
