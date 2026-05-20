"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAvatar = void 0;
exports.uploadBufferToCloudinary = uploadBufferToCloudinary;
const multer_1 = __importDefault(require("multer"));
const stream_1 = require("stream");
const cloudinary_1 = __importDefault(require("../configs/cloudinary"));
const MAX_FILE_SIZE = 5 * 1024 * 1024;
exports.uploadAvatar = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            cb(new Error('Chỉ chấp nhận file ảnh'));
            return;
        }
        cb(null, true);
    },
});
function uploadBufferToCloudinary(fileBuffer, options) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.default.uploader.upload_stream({
            folder: options.folder,
            public_id: options.publicId,
            resource_type: 'image',
        }, (error, result) => {
            if (error || !result) {
                reject(error ?? new Error('Upload thất bại'));
                return;
            }
            resolve(result);
        });
        stream_1.Readable.from(fileBuffer).pipe(uploadStream);
    });
}
