import { v2 as cloudinary } from 'cloudinary';
import fs from 'node:fs/promises';
import type { Express } from 'express';
import { env } from '../config/env.js';
import { localFileUrl } from '../middlewares/fileUpload.js';

// Configure Cloudinary with explicit credentials
if (env.CLOUDINARY_URL) {
  cloudinary.config({ 
    secure: true,
    // Cloudinary URL is automatically parsed by the SDK
  });
}

/**
 * Local disk is always used as Multer's safe ingestion point. When CLOUDINARY_URL is set,
 * the durable URL stored for a product is Cloudinary's secure URL; otherwise the local URL is stored.
 */
export async function resolveProductImageUrls(files: Express.Multer.File[]): Promise<string[]> {
  if (!env.CLOUDINARY_URL) {
    throw new Error('CLOUDINARY_URL must be configured in production. Images cannot be stored locally on Render.');
  }
  
  // Upload to Cloudinary (required)
  const uploaded = await Promise.all(
    files.map((file) => cloudinary.uploader.upload(file.path, { 
      folder: 'electronics-commerce/products', 
      resource_type: 'image',
      timeout: 60000
    }))
  );
  
  // Clean up local temp files
  await Promise.all(files.map(async (file) => {
    try { 
      await fs.unlink(file.path); 
    } catch {
      // Ignore cleanup errors - temp files will be cleaned up by system
    }
  }));
  
  return uploaded.map((result) => result.secure_url);
}

