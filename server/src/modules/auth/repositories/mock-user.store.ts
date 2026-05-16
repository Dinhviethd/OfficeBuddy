// In-memory user store for development/testing without database
// This will be replaced with actual database repository later

import { User } from '@/modules/auth/entities/user.model';
import { CreateUserInput, UpdateProfileInput } from '@/modules/auth/schemas/auth.schema';

// Simple ID generator
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

class MockUserStore {
  private users: Map<string, User> = new Map();
  private usernameIndex: Map<string, string> = new Map(); // username -> id mapping

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const userId = this.usernameIndex.get(username);
    if (userId) {
      return this.users.get(userId) || null;
    }
    return null;
  }

  async findById(idUser: string): Promise<User | null> {
    return this.users.get(idUser) || null;
  }

  async create(userData: CreateUserInput): Promise<User> {
    const user = {
      idUser: generateId(),
      ...userData,
      emailVerified: userData.emailVerified || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;

    this.users.set(user.idUser, user);
    this.usernameIndex.set(user.username, user.idUser);
    
    console.log(`✅ User created in memory: ${user.username}`);
    return user;
  }

  async update(idUser: string, updateData: UpdateProfileInput): Promise<User | null> {
    const user = this.users.get(idUser);
    if (!user) return null;

    const updatedUser = {
      ...user,
      ...updateData,
      updatedAt: new Date(),
    };

    this.users.set(idUser, updatedUser);
    return updatedUser;
  }

  async delete(idUser: string): Promise<boolean> {
    const user = this.users.get(idUser);
    if (user) {
      this.usernameIndex.delete(user.username);
      this.users.delete(idUser);
      return true;
    }
    return false;
  }
}

export const mockUserStore = new MockUserStore();
