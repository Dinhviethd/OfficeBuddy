import { getSupabase } from '@/configs/supabase.config';
import { User } from '@/modules/auth/entities/user.model';
import { CreateUserInput, UpdateProfileInput } from '@/modules/auth/schemas/auth.schema';

export class SupabaseUserRepository {
  private tableName = 'users';

  private getClient() {
    return getSupabase();
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await this.getClient()
        .from(this.tableName)
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        throw error;
      }

      return this.mapRowToUser(data);
    } catch (error: any) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      const { data, error } = await this.getClient()
        .from(this.tableName)
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        throw error;
      }

      return this.mapRowToUser(data);
    } catch (error: any) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  async findById(idUser: string): Promise<User | null> {
    try {
      const { data, error } = await this.getClient()
        .from(this.tableName)
        .select('*')
        .eq('idUser', idUser)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        throw error;
      }

      return this.mapRowToUser(data);
    } catch (error: any) {
      console.error('Error finding user by id:', error);
      throw error;
    }
  }

  async create(userData: CreateUserInput): Promise<User> {
    try {
      const newUser = {
        username: userData.username,
        password: userData.password,
      };

      const { data, error } = await this.getClient()
        .from(this.tableName)
        .insert([newUser])
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log(`✅ User created in Supabase: ${newUser.username}`);
      return this.mapRowToUser(data);
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async update(idUser: string, updateData: UpdateProfileInput): Promise<User | null> {
    try {
      const updatePayload = {
        ...updateData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.getClient()
        .from(this.tableName)
        .update(updatePayload)
        .eq('idUser', idUser)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapRowToUser(data);
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async delete(idUser: string): Promise<boolean> {
    try {
      const { error } = await this.getClient()
        .from(this.tableName)
        .delete()
        .eq('idUser', idUser);

      if (error) {
        throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  private mapRowToUser(row: any): User {
    return {
      idUser: row.id,
    //   name: row.username, // Use username as name for now
      username: row.username,
    //   email: '',
      password: row.password,
    //   emailVerified: false,
    //   avatarUrl: '',
    //   phone: '',
    //   resetOTP: '',
    //   resetOTPExpires: new Date(),
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    //   role: undefined,
    } as User;
  }
}

export const supabaseUserRepository = new SupabaseUserRepository();
