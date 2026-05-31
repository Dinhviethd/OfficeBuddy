import { Router } from "express";
import multer from "multer";
import * as fs from "fs";
import * as path from "path";
import { ingestDocument } from "@/modules/ai/upload_service";
import { AppError } from "@/utils/error.response";
import { asyncHandler } from "@/utils/error.response";

const router = Router();

// Ensure local temporary directory exists
const tempDir = path.join(process.cwd(), "tmp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configure multer storage
const upload = multer({ dest: tempDir });

/**
 * POST /api/admin/upload
 * Multi-part form upload for RAG documents
 */
router.post(
  "/upload",
  upload.single("file"),
  asyncHandler(async (req: any, res: any) => {
    const file = req.file;
    const { category, uploadedBy, fileDescription } = req.body;

    if (!file) {
      throw new AppError(400, "Vui lòng chọn file tài liệu cần upload");
    }

    if (!fileDescription || fileDescription.trim().length === 0) {
      // Clean up temporary file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new AppError(400, "Mô tả tài liệu là bắt buộc và không được để trống");
    }

    try {
      const result = await ingestDocument(
        file.path,
        file.originalname,
        category || "chung",
        uploadedBy || "admin",
        fileDescription
      );

      // Clean up temporary file on success
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      res.status(200).json(result);
    } catch (err: any) {
      // Clean up temporary file on error
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw err;
    }
  })
);

export default router;
