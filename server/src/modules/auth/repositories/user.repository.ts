import { Repository } from 'typeorm';
import { User } from '@/modules/auth/entities/user.model';
import { CreateUserInput, UpdateProfileInput } from '@/modules/auth/schemas/auth.schema';
import { supabaseUserRepository } from './supabase-user.repository';

export class UserRepository {
  // Using Supabase for user data persistence

  async findByEmail(email: string): Promise<User | null> {
    return supabaseUserRepository.findByEmail(email);
  }

  async findByUsername(username: string): Promise<User | null> {
    return supabaseUserRepository.findByUsername(username);
  }

  async findById(idUser: string): Promise<User | null> {
    return supabaseUserRepository.findById(idUser);
  }

  async create(userData: CreateUserInput): Promise<User> {
    return supabaseUserRepository.create(userData);
  }

  async update(idUser: string, updateData: UpdateProfileInput): Promise<User | null> {
    return supabaseUserRepository.update(idUser, updateData);
  }

  async delete(idUser: string): Promise<boolean> {
    return supabaseUserRepository.delete(idUser);
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
