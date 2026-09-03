import { v2 as cloudinary } from 'cloudinary';
import fs from 'node:fs/promises';
import type { Express } from 'express';
import { env } from '../config/env.js';
import { localFileUrl } from '../middlewares/fileUpload.js';

if (env.CLOUDINARY_URL) cloudinary.config({ secure: true });

/**
 * Local disk is always used as Multer's safe ingestion point. When CLOUDINARY_URL is set,
 * the durable URL stored for a product is Cloudinary's secure URL; otherwise the local URL is stored.
 */
export async function resolveProductImageUrls(files: Express.Multer.File[]): Promise<string[]> {
  if (!env.CLOUDINARY_URL) return files.map((file) => localFileUrl(file.filename));
  try {
    const uploaded = await Promise.all(files.map((file) => cloudinary.uploader.upload(file.path, { folder: 'electronics-commerce/products', resource_type: 'image' })));
    return uploaded.map((result) => result.secure_url);
  } finally {
    await Promise.all(files.map(async (file) => {
      try { await fs.unlink(file.path); } catch {
        // The Cloudinary URL is durable; failure to remove transient local intake is non-fatal.
      }
    }));
  }
}

