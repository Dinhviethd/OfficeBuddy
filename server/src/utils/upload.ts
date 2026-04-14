import multer from 'multer';
import { Readable } from 'stream';
import type { UploadApiResponse } from 'cloudinary';
import cloudinary from '@/configs/cloudinary';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const uploadAvatar = multer({
	storage: multer.memoryStorage(),
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

export function uploadBufferToCloudinary(
	fileBuffer: Buffer,
	options: {
		folder: string;
		publicId?: string;
	},
): Promise<UploadApiResponse> {
	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{
				folder: options.folder,
				public_id: options.publicId,
				resource_type: 'image',
			},
			(error, result) => {
				if (error || !result) {
					reject(error ?? new Error('Upload thất bại'));
					return;
				}
				resolve(result);
			},
		);

		Readable.from(fileBuffer).pipe(uploadStream);
	});
}
