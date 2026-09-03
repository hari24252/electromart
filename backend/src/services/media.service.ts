import { v2 as cloudinary } from 'cloudinary';
import fs from 'node:fs/promises';
import type { Express } from 'express';
import { env } from '../config/env.js';
import { localFileUrl } from '../middlewares/fileUpload.js';
import { logger } from '../config/logger.js';

// Configure Cloudinary if URL is provided
if (env.CLOUDINARY_URL) {
  try {
    cloudinary.config({ 
      secure: true,
      // Cloudinary automatically parses CLOUDINARY_URL environment variable
    });
    logger.info({ cloudinaryEnabled: true }, 'Cloudinary configured for image uploads');
  } catch (error) {
    logger.error({ error }, 'Failed to configure Cloudinary');
  }
}

/**
 * Local disk is always used as Multer's safe ingestion point. When CLOUDINARY_URL is set,
 * the durable URL stored for a product is Cloudinary's secure URL; otherwise the local URL is stored.
 */
export async function resolveProductImageUrls(files: Express.Multer.File[]): Promise<string[]> {
  if (!env.CLOUDINARY_URL) {
    logger.info({ fileCount: files.length }, 'Using local storage for images (no CLOUDINARY_URL)');
    return files.map((file) => localFileUrl(file.filename));
  }
  
  try {
    logger.info({ fileCount: files.length }, 'Uploading images to Cloudinary');
    const uploaded = await Promise.all(
      files.map((file) =>
        cloudinary.uploader.upload(file.path, {
          folder: 'electronics-commerce/products',
          resource_type: 'image',
        })
      )
    );
    logger.info({ uploadedCount: uploaded.length }, 'Images uploaded to Cloudinary successfully');
    return uploaded.map((result) => result.secure_url);
  } catch (error) {
    logger.error({ error, fileCount: files.length }, 'Cloudinary upload failed, falling back to local storage');
    // Fallback to local storage if Cloudinary fails
    return files.map((file) => localFileUrl(file.filename));
  } finally {
    // Clean up local temp files
    await Promise.all(
      files.map(async (file) => {
        try {
          await fs.unlink(file.path);
        } catch (error) {
          logger.warn({ error, filePath: file.path }, 'Failed to delete temp file');
        }
      })
    );
  }
}
