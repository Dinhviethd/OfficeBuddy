"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const database_config_1 = require("../../../configs/database.config");
const user_model_1 = require("../../../modules/auth/entities/user.model");
class UserRepository {
    get repository() {
        return database_config_1.AppDataSource.getRepository(user_model_1.User);
    }
    async findByEmail(email) {
        return null;
    }
    async findByUsername(username) {
        return this.repository.findOne({ where: { username } });
    }
    async findById(idUser) {
        return this.repository.findOne({ where: { idUser } });
    }
    async create(userData) {
        const user = this.repository.create(userData);
        return this.repository.save(user);
    }
    async update(idUser, updateData) {
        const result = await this.repository.update({ idUser }, updateData);
        if (!result.affected) {
            return null;
        }
        return this.findById(idUser);
    }
    async delete(idUser) {
        const result = await this.repository.delete({ idUser });
        return Boolean(result.affected);
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
