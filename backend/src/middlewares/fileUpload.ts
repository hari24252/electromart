import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

const uploadDirectory = path.resolve(process.cwd(), 'public', 'uploads', 'products');
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
  },
});

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const extensionsForMimeType: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/avif': ['.avif'],
};
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (allowedMimeTypes.has(file.mimetype) && extensionsForMimeType[file.mimetype]?.includes(extension)) callback(null, true);
    else callback(new ApiError(422, 'Only JPEG, PNG, WebP, and AVIF images are allowed', 'INVALID_IMAGE_TYPE'));
  },
});

export const productUpload = upload.fields([
  { name: 'images', maxCount: 8 },
  { name: 'thumbnail', maxCount: 1 },
]);

export const productImageUpload = upload.array('images', 8);
export const localFileUrl = (filename: string): string => `/uploads/products/${filename}`;
export const cloudinaryEnabled = Boolean(env.CLOUDINARY_URL);

export async function removeUploadedFiles(files: Express.Request['files'] | undefined): Promise<void> {
  const flattened = Array.isArray(files) ? files : Object.values(files ?? {}).flat();
  await Promise.all(flattened.map(async (file) => {
    try { await fs.promises.unlink(file.path); } catch {
      // Original request failure wins; local upload cleanup is best effort.
    }
  }));
}
