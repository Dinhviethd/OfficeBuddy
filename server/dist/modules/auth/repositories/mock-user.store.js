"use strict";
// In-memory user store for development/testing without database
// This will be replaced with actual database repository later
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockUserStore = void 0;
// Simple ID generator
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
class MockUserStore {
    users = new Map();
    usernameIndex = new Map(); // username -> id mapping
    async findByEmail(email) {
        for (const user of this.users.values()) {
            if (user.email === email) {
                return user;
            }
        }
        return null;
    }
    async findByUsername(username) {
        const userId = this.usernameIndex.get(username);
        if (userId) {
            return this.users.get(userId) || null;
        }
        return null;
    }
    async findById(idUser) {
        return this.users.get(idUser) || null;
    }
    async create(userData) {
        const user = {
            idUser: generateId(),
            ...userData,
            emailVerified: userData.emailVerified || false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.users.set(user.idUser, user);
        this.usernameIndex.set(user.username, user.idUser);
        console.log(`✅ User created in memory: ${user.username}`);
        return user;
    }
    async update(idUser, updateData) {
        const user = this.users.get(idUser);
        if (!user)
            return null;
        const updatedUser = {
            ...user,
            ...updateData,
            updatedAt: new Date(),
        };
        this.users.set(idUser, updatedUser);
        return updatedUser;
    }
    async delete(idUser) {
        const user = this.users.get(idUser);
        if (user) {
            this.usernameIndex.delete(user.username);
            this.users.delete(idUser);
            return true;
        }
        return false;
    }
}
exports.mockUserStore = new MockUserStore();
