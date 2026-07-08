// backend/src/controllers/UploadController.ts

import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { v4 as uuidv4 } from 'uuid';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  getPublicIdFromUrl,
} from '../config/cloudinary';
import { asyncHandler, AppError } from '../middlewares/errorHandler';
import { UploadedFile } from '../types';

// ============================================================
// Upload Controller
// ============================================================
export class UploadController {
  /**
   * Upload a single file
   * Expects a file in req.file (from multer)
   */
  static uploadSingle = asyncHandler(async (req: AuthRequest, res: Response) => {
    const file = req.file as UploadedFile;
    if (!file) {
      throw new AppError('No file uploaded', 400, 'NO_FILE');
    }

    const folder = req.body.folder || 'general';
    const tags = req.body.tags ? req.body.tags.split(',') : [];

    const result = await uploadToCloudinary(file.buffer, {
      folder: `panditji/${folder}`,
      tags,
      public_id: req.body.publicId || uuidv4(),
      quality: req.body.quality || 'auto:good',
      format: req.body.format || 'webp',
    });

    res.status(201).json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      },
    });
  });

  /**
   * Upload multiple files (array)
   * Expects files in req.files (from multer array)
   */
  static uploadMultiple = asyncHandler(async (req: AuthRequest, res: Response) => {
    const files = req.files as UploadedFile[];
    if (!files || files.length === 0) {
      throw new AppError('No files uploaded', 400, 'NO_FILES');
    }

    const folder = req.body.folder || 'general';
    const tags = req.body.tags ? req.body.tags.split(',') : [];

    const uploadPromises = files.map((file) =>
      uploadToCloudinary(file.buffer, {
        folder: `panditji/${folder}`,
        tags,
        public_id: uuidv4(),
        quality: req.body.quality || 'auto:good',
        format: req.body.format || 'webp',
      })
    );

    const results = await Promise.all(uploadPromises);

    res.status(201).json({
      success: true,
      data: results.map((r) => ({
        url: r.secure_url,
        publicId: r.public_id,
        format: r.format,
        width: r.width,
        height: r.height,
        bytes: r.bytes,
      })),
    });
  });

  /**
   * Upload product images
   * Expects files in req.files (from multer array)
   * productId can be passed in body to associate with product
   */
  static uploadProductImages = asyncHandler(async (req: AuthRequest, res: Response) => {
    const files = req.files as UploadedFile[];
    if (!files || files.length === 0) {
      throw new AppError('No images uploaded', 400, 'NO_FILES');
    }

    const productId = req.body.productId || 'unknown';
    const folder = `products/${productId}`;
    const tags = ['product', productId];

    const uploadPromises = files.map((file) =>
      uploadToCloudinary(file.buffer, {
        folder: `panditji/${folder}`,
        tags,
        public_id: uuidv4(),
        quality: 'auto:good',
        format: 'webp',
        width: 800,
        crop: 'scale',
      })
    );

    const results = await Promise.all(uploadPromises);

    res.status(201).json({
      success: true,
      data: {
        productId,
        images: results.map((r) => ({
          url: r.secure_url,
          publicId: r.public_id,
        })),
      },
    });
  });

  /**
   * Upload avatar for user
   * Expects file in req.file
   */
  static uploadAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
    const file = req.file as UploadedFile;
    if (!file) {
      throw new AppError('No avatar file uploaded', 400, 'NO_FILE');
    }

    const userId = req.user?.id || 'unknown';

    const result = await uploadToCloudinary(file.buffer, {
      folder: `panditji/avatars`,
      tags: ['avatar', userId],
      public_id: `${userId}_${Date.now()}`,
      quality: 'auto:good',
      format: 'webp',
      width: 400,
      height: 400,
      crop: 'fill',
      gravity: 'center',
    });

    res.status(201).json({
      success: true,
      data: {
        avatarUrl: result.secure_url,
        publicId: result.public_id,
      },
    });
  });

  /**
   * Upload gallery images
   * Expects files in req.files
   * galleryId can be passed in body
   */
  static uploadGalleryImages = asyncHandler(async (req: AuthRequest, res: Response) => {
    const files = req.files as UploadedFile[];
    if (!files || files.length === 0) {
      throw new AppError('No gallery images uploaded', 400, 'NO_FILES');
    }

    const galleryId = req.body.galleryId || 'general';
    const folder = `gallery/${galleryId}`;

    const uploadPromises = files.map((file) =>
      uploadToCloudinary(file.buffer, {
        folder: `panditji/${folder}`,
        tags: ['gallery', galleryId],
        public_id: uuidv4(),
        quality: 'auto:good',
        format: 'webp',
      })
    );

    const results = await Promise.all(uploadPromises);

    res.status(201).json({
      success: true,
      data: results.map((r) => ({
        url: r.secure_url,
        publicId: r.public_id,
      })),
    });
  });

  /**
   * Upload blog images
   * Expects files in req.files
   * blogId can be passed in body
   */
  static uploadBlogImages = asyncHandler(async (req: AuthRequest, res: Response) => {
    const files = req.files as UploadedFile[];
    if (!files || files.length === 0) {
      throw new AppError('No blog images uploaded', 400, 'NO_FILES');
    }

    const blogId = req.body.blogId || 'unknown';
    const folder = `blogs/${blogId}`;

    const uploadPromises = files.map((file) =>
      uploadToCloudinary(file.buffer, {
        folder: `panditji/${folder}`,
        tags: ['blog', blogId],
        public_id: uuidv4(),
        quality: 'auto:good',
        format: 'webp',
      })
    );

    const results = await Promise.all(uploadPromises);

    res.status(201).json({
      success: true,
      data: results.map((r) => ({
        url: r.secure_url,
        publicId: r.public_id,
      })),
    });
  });

  /**
   * Delete a single file from Cloudinary
   */
  static deleteFile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { publicId } = req.params;

    if (!publicId) {
      throw new AppError('Public ID is required', 400, 'MISSING_PUBLIC_ID');
    }

    const result = await deleteFromCloudinary(publicId);

    if (result.result !== 'ok') {
      throw new AppError('Failed to delete file', 500, 'DELETE_FAILED');
    }

    res.json({
      success: true,
      message: 'File deleted successfully',
      data: { publicId },
    });
  });

  /**
   * Delete multiple files from Cloudinary
   */
  static deleteMultipleFiles = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { publicIds } = req.body;

    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      throw new AppError('Public IDs array is required', 400, 'MISSING_PUBLIC_IDS');
    }

    const results = await deleteMultipleFromCloudinary(publicIds);

    const failed = results.filter((r) => r.result !== 'ok');
    const succeeded = results.filter((r) => r.result === 'ok');

    res.json({
      success: true,
      message: `Deleted ${succeeded.length} files, ${failed.length} failed`,
      data: {
        succeeded: succeeded.map((_, i) => publicIds[i]),
        failed: failed.map((_, i) => publicIds[i]),
      },
    });
  });

  /**
   * Get a signed upload URL for client-side direct upload (optional)
   * Returns a timestamp and signature for secure upload
   */
  static getSignedUploadUrl = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { type = 'general', folder } = req.query;

    // If you need to generate a signed URL, you can implement Cloudinary's
    // upload preset or generate a signature. Here's a simple example:

    const timestamp = Math.round(new Date().getTime() / 1000);
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
    const apiKey = process.env.CLOUDINARY_API_KEY!;

    // For production, you'd generate a signature using your secret
    // const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, process.env.CLOUDINARY_API_SECRET);

    // For simplicity, we'll return an upload preset approach
    // You can create upload presets in Cloudinary dashboard and use them.

    res.json({
      success: true,
      data: {
        cloudName,
        apiKey,
        timestamp,
        // signature, // uncomment when implementing signature
        folder: `panditji/${folder || type}`,
        uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || `panditji_${type}`,
      },
    });
  });

  /**
   * Get file info from Cloudinary (optional)
   */
  static getFileInfo = asyncHandler(async (req: AuthRequest, res: Response) => {
    // In a real implementation, you'd fetch info from Cloudinary using publicId
    // For now, we'll just return a placeholder
    res.json({
      success: true,
      message: 'File info endpoint (implement with Cloudinary API)',
    });
  });

  /**
   * Get list of files in a folder (optional)
   */
  static listFiles = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Implement using Cloudinary API's list resources
    // For now, placeholder
    res.json({
      success: true,
      message: 'List files endpoint (implement with Cloudinary API)',
    });
  });
}

export default UploadController;