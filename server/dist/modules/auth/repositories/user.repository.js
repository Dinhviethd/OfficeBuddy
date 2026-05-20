"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const mock_user_store_1 = require("./mock-user.store");
class UserRepository {
    // Using mock store for development without database
    // Replace with actual database repository when database is ready
    async findByEmail(email) {
        return mock_user_store_1.mockUserStore.findByEmail(email);
    }
    async findByUsername(username) {
        return mock_user_store_1.mockUserStore.findByUsername(username);
    }
    async findById(idUser) {
        return mock_user_store_1.mockUserStore.findById(idUser);
    }
    async create(userData) {
        return mock_user_store_1.mockUserStore.create(userData);
    }
    async update(idUser, updateData) {
        return mock_user_store_1.mockUserStore.update(idUser, updateData);
    }
    async delete(idUser) {
        return mock_user_store_1.mockUserStore.delete(idUser);
    }
}
exports.UserRepository = UserRepository;
// Export singleton instance
exports.userRepository = new UserRepository();
