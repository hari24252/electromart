# Changelog

## [Unreleased] - 2026-08-29

### 🔥 CRITICAL FIX: Product Images Now Load Consistently

#### The Problem
Product images were inconsistent across devices - working sometimes, broken other times. Root cause: Render's free tier uses **ephemeral storage** which gets wiped on every deploy, restart, or spin-down.

#### The Solution
**THREE-TIER IMAGE STRATEGY:**

1. **Cloudinary (RECOMMENDED)** - Permanent cloud storage with global CDN
   - Set `CLOUDINARY_URL` environment variable
   - Images stored forever at `https://res.cloudinary.com/...`
   - Free tier: 25GB storage + 25GB bandwidth/month
   - See `IMAGE_FIX_GUIDE.md` for setup instructions

2. **BASE_URL Fallback** - Full URLs for local storage
   - Set `BASE_URL=https://your-api.onrender.com` in production
   - Converts relative paths to absolute URLs
   - Works until next restart (temporary fix)

3. **Development Mode** - Relative paths for local dev
   - No configuration needed
   - Works with `VITE_API_URL=/api`

### Added
- **Image Upload Preview Component** with progress bar (like ChatGPT/Gemini)
  - Real-time preview of uploading images
  - Progress indicator for each image
  - Visual confirmation when upload completes
  - Easy removal of unwanted images before saving

- **Category Product Count** - MongoDB aggregation for accurate counts
  - Fixed `/categories/tree` endpoint
  - Shows real product counts for all categories
  - Counts both main category and subcategories

- **Enhanced Image Upload UI**
  - Live previews with loading states
  - Upload progress indicators
  - Better file validation and error messages
  - Clear visual feedback

### Changed
- `backend/src/middlewares/fileUpload.ts` - Added BASE_URL support for production URLs
- `backend/src/config/env.ts` - Added optional BASE_URL environment variable
- `backend/src/modules/category/category.repository.ts` - Added efficient product count aggregation
- `backend/src/modules/category/category.service.ts` - Returns productCount for all categories
- `frontend/src/pages/admin/ProductFormPage.tsx` - Uses new ImageUploadPreview component
- `frontend/src/components/admin/ImageUploadPreview.tsx` - New component (created)

### Fixed
- ✅ Product images now have consistent URLs
- ✅ Category filtering works correctly (was already correct, verified)
- ✅ Category product counts display accurately
- ✅ Image upload UI provides better user feedback
- ✅ Images work across all devices when using Cloudinary

### Documentation
- Added `IMAGE_FIX_GUIDE.md` - Complete guide for permanent image fix
- Updated `.env.example` - Added BASE_URL and documentation

### Migration Guide

#### For Production (Render):
1. **REQUIRED**: Set up Cloudinary (see `IMAGE_FIX_GUIDE.md`)
   ```bash
   # Add to Render environment variables:
   CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
   ```

2. **OPTIONAL**: Set BASE_URL for better URL resolution
   ```bash
   BASE_URL=https://electromart-api-sc91.onrender.com
   ```

3. Redeploy the service

4. Re-upload any existing products with broken images

#### For Development:
No changes required - everything works as before.

### Technical Details

#### Image Storage Flow (with Cloudinary):
```
1. Admin uploads image → Multer saves to /public/uploads/products/temp-file.jpg
2. Backend uploads to Cloudinary → https://res.cloudinary.com/.../products/abc123.jpg
3. Backend deletes local temp file
4. Database stores Cloudinary URL (permanent)
5. Frontend displays image from Cloudinary CDN (fast, global)
```

#### Image Storage Flow (without Cloudinary):
```
1. Admin uploads image → Saved to /public/uploads/products/file.jpg
2. Database stores: /uploads/products/file.jpg
3. Backend serves from local disk via Express static
4. ⚠️  FILE DELETED on next deploy/restart (Render free tier limitation)
```

### Breaking Changes
None - all changes are backward compatible.

### Known Issues
- Existing products uploaded before Cloudinary setup will still have broken images
  - **Fix**: Re-upload their images from the admin panel
- Local uploads on Render free tier will be lost on restart
  - **Fix**: Set up Cloudinary (permanent solution)

### Performance
- Category tree endpoint optimized with aggregation (reduced from N queries to 1)
- Images served from Cloudinary CDN (faster than Render static files)
- Frontend image previews use local object URLs (instant feedback)

---

## Previous Versions
See git history for earlier changes.
