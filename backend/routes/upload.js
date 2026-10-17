const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary if credentials are present
const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });
    return true;
  }
  return false;
};

// POST /api/upload
router.post('/', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }

    // 1. If it's already an external online URL (https://...), return it directly
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return res.json({ success: true, url: image });
    }

    // 2. If Cloudinary is configured with a cloud name, upload to Cloudinary CDN
    const hasCloud = configureCloudinary();
    if (hasCloud) {
      try {
        const uploadResult = await cloudinary.uploader.upload(image, {
          folder: 'zerfe_lounge_menu',
          resource_type: 'image'
        });
        return res.json({
          success: true,
          url: uploadResult.secure_url || uploadResult.url
        });
      } catch (cloudErr) {
        console.warn('⚠️ Cloudinary upload warning:', cloudErr.message);
        // Fallback to storing the image directly so user never loses their data!
        return res.json({
          success: true,
          url: image,
          warning: 'Uploaded locally; Cloudinary error: ' + cloudErr.message
        });
      }
    }

    // 3. Fallback: If CLOUDINARY_CLOUD_NAME is not yet specified, return the image data URL directly
    return res.json({
      success: true,
      url: image,
      note: 'Saved directly as image data'
    });
  } catch (err) {
    console.error('Upload endpoint error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
