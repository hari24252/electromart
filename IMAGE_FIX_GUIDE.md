# IMAGE FIX GUIDE - PERMANENT SOLUTION

## THE PROBLEM
Images stored locally on Render's free tier are **EPHEMERAL** - they get deleted on:
- Every deployment
- Service restarts
- Instance spin-downs

This is why images work sometimes and not other times.

## THE PERMANENT SOLUTION: CLOUDINARY

### Step 1: Create Free Cloudinary Account
1. Go to https://cloudinary.com/users/register_free
2. Sign up (100% free tier includes 25GB storage + 25GB bandwidth/month)
3. After signup, go to Dashboard
4. Copy your **Cloud Name**, **API Key**, and **API Secret**

### Step 2: Configure Cloudinary URL
Your Cloudinary URL format is:
```
cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

Example:
```
cloudinary://123456789012345:abcdefghijklmnopqrstuvwxyz123456@yourcloudname
```

### Step 3: Add to Render Environment Variables
1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your `electromart-api` service
3. Go to **Environment** tab
4. Add this environment variable:
   - **Key**: `CLOUDINARY_URL`
   - **Value**: `cloudinary://YOUR_API_KEY:YOUR_API_SECRET@YOUR_CLOUD_NAME`
5. Click **Save Changes**

Your service will automatically redeploy with Cloudinary enabled.

### Step 4: (Optional but Recommended) Add BASE_URL
For better image URL resolution, also add:
- **Key**: `BASE_URL`
- **Value**: `https://electromart-api-sc91.onrender.com`

## HOW IT WORKS

### WITHOUT Cloudinary (Current - BROKEN):
```
Upload → Saved to /public/uploads/products/image.jpg
         (gets deleted on restart/deploy)
API returns → /uploads/products/image.jpg (404 error after restart)
```

### WITH Cloudinary (PERMANENT FIX):
```
Upload → Temporarily saved to disk
      → Immediately uploaded to Cloudinary
      → Local file deleted
API returns → https://res.cloudinary.com/yourcloud/image/upload/v123/products/image.jpg
              (PERMANENT, NEVER DELETED, FAST CDN)
```

## BENEFITS OF CLOUDINARY

✅ **Permanent Storage** - Images never get deleted
✅ **Global CDN** - Fast loading from anywhere in the world
✅ **Automatic Optimization** - Images are compressed and optimized
✅ **Transformations** - Can resize, crop, format images on-the-fly
✅ **Free Tier** - 25GB storage + 25GB bandwidth/month (plenty for small stores)
✅ **Works Across Devices** - Same URL everywhere, always available

## AFTER SETUP

Once Cloudinary is configured, all NEW product images will be stored permanently.

### For Existing Products with Broken Images:
1. Go to Admin → Products
2. Edit each product with broken images
3. Re-upload the images
4. Save the product

The new uploads will go to Cloudinary and work forever.

## ALTERNATIVE: Self-Hosted Storage (Advanced)

If you don't want to use Cloudinary, you need persistent storage:

### Option A: Render Disk (Paid)
- Upgrade to Render's paid tier with persistent disks
- Add a disk mount at `/opt/render/project/src/backend/public/uploads`
- Cost: ~$7/month + instance cost

### Option B: AWS S3 / DigitalOcean Spaces
- Set up S3 bucket or Spaces
- Modify `media.service.ts` to upload there
- Requires code changes + AWS/DO account

### Option C: Separate File Server
- Deploy a separate persistent file storage service
- Host images there
- Requires infrastructure management

**Recommendation: Use Cloudinary** - It's free, reliable, and requires zero code changes.

## VERIFICATION

After setting up Cloudinary, verify it works:

1. Upload a new product with images
2. Check the image URL in the product response - it should start with:
   ```
   https://res.cloudinary.com/yourcloud/...
   ```
3. Test on multiple devices/browsers
4. Redeploy your service - images should still work

## SUPPORT

If you have issues:
- Check Cloudinary dashboard to see if uploads are appearing
- Check Render logs for Cloudinary upload errors
- Verify CLOUDINARY_URL format is correct
- Ensure no spaces or special characters in the URL

---

**TL;DR: Add `CLOUDINARY_URL` to Render environment variables and redeploy. Images will work permanently.**
