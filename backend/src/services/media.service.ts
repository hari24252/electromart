import { v2 as cloudinary } from 'cloudinary';
import fs from 'node:fs/promises';
import type { Express } from 'express';
import { env } from '../config/env.js';
import { localFileUrl } from '../middlewares/fileUpload.js';

// Configure Cloudinary if URL is provided
if (env.CLOUDINARY_URL) {
  cloudinary.config({ 
    secure: true,
    // Cloudinary automatically parses CLOUDINARY_URL environment variable
  });
}

/**
 * Local disk is always used as Multer's safe ingestion point. When CLOUDINARY_URL is set,
 * the durable URL stored for a product is Cloudinary's secure URL; otherwise the local URL is stored.
 */
export async function resolveProductImageUrls(files: Express.Multer.File[]): Promise<string[]> {
  if (!env.CLOUDINARY_URL) {
    return files.map((file) => localFileUrl(file.filename));
  }
  
  try {
    const uploaded = await Promise.all(
      files.map((file) =>
        cloudinary.uploader.upload(file.path, {
          folder: 'electronics-commerce/products',
          resource_type: 'image',
        })
      )
    );
    return uploaded.map((result) => result.secure_url);
  } catch (error) {
    // Fallback to local storage if Cloudinary fails
    console.error('Cloudinary upload failed:', error);
    return files.map((file) => localFileUrl(file.filename));
  } finally {
    // Clean up local temp files
    await Promise.all(
      files.map(async (file) => {
        try {
          await fs.unlink(file.path);
        } catch (error) {
          // Non-fatal - temp file cleanup failed
        }
      })
    );
  }
}
