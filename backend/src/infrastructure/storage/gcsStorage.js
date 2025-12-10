const { Storage } = require('@google-cloud/storage');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'ioio-products';

let storage;

// Initialize storage - works with Application Default Credentials in GCP
// or with GOOGLE_APPLICATION_CREDENTIALS env var locally
try {
  storage = new Storage();
} catch (error) {
  console.warn('GCS Storage not configured, using fallback');
  storage = null;
}

/**
 * Upload a file to Google Cloud Storage
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} originalName - Original filename
 * @param {string} mimeType - File MIME type
 * @param {string} folder - Folder in bucket (e.g., 'products', 'events')
 * @returns {Promise<string>} - Public URL of uploaded file
 */
async function uploadToGCS(fileBuffer, originalName, mimeType, folder = 'products') {
  if (!storage) {
    throw new Error('GCS Storage not configured');
  }

  const bucket = storage.bucket(BUCKET_NAME);
  
  // Generate unique filename
  const ext = path.extname(originalName);
  const filename = `${folder}/${uuidv4()}${ext}`;
  
  const file = bucket.file(filename);
  
  await file.save(fileBuffer, {
    metadata: {
      contentType: mimeType,
    },
    public: true,
  });

  // Return public URL
  return `https://storage.googleapis.com/${BUCKET_NAME}/${filename}`;
}

/**
 * Delete a file from Google Cloud Storage
 * @param {string} fileUrl - The public URL of the file
 */
async function deleteFromGCS(fileUrl) {
  if (!storage || !fileUrl) return;
  
  try {
    // Extract filename from URL
    const urlParts = fileUrl.split(`${BUCKET_NAME}/`);
    if (urlParts.length < 2) return;
    
    const filename = urlParts[1];
    const bucket = storage.bucket(BUCKET_NAME);
    await bucket.file(filename).delete();
  } catch (error) {
    console.error('Error deleting file from GCS:', error.message);
  }
}

module.exports = {
  uploadToGCS,
  deleteFromGCS,
  BUCKET_NAME
};
