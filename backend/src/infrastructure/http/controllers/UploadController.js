const multer = require('multer');
const { uploadToGCS } = require('../../storage/gcsStorage');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

class UploadController {
  constructor() {
    this.uploadMiddleware = upload.single('image');
  }

  /**
   * Upload a single image
   * POST /api/upload
   */
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: { message: 'No image file provided' } });
      }

      const folder = req.body.folder || 'products';
      
      const imageUrl = await uploadToGCS(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        folder
      );

      res.json({ 
        success: true,
        imageUrl,
        message: 'Image uploaded successfully'
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: { message: error.message || 'Failed to upload image' } });
    }
  }

  /**
   * Upload multiple images
   * POST /api/upload/multiple
   */
  async uploadMultipleImages(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: { message: 'No image files provided' } });
      }

      const folder = req.body.folder || 'products';
      const uploadPromises = req.files.map(file => 
        uploadToGCS(file.buffer, file.originalname, file.mimetype, folder)
      );

      const imageUrls = await Promise.all(uploadPromises);

      res.json({ 
        success: true,
        imageUrls,
        message: `${imageUrls.length} images uploaded successfully`
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: { message: error.message || 'Failed to upload images' } });
    }
  }
}

module.exports = UploadController;
