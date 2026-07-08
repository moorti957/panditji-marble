// backend/src/config/cloudinary.ts

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { Readable } from 'stream';
import {
  UploadApiResponse,
  UploadApiErrorResponse
} from 'cloudinary';

dotenv.config();

// ============================================================
// Cloudinary Configuration
// ============================================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Use HTTPS
});

// ============================================================
// Type Definitions
// ============================================================
export interface CloudinaryUploadResult {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  pages: number;
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  asset_id: string;
  folder: string;
  original_filename: string;
  api_key: string;
}

export interface CloudinaryUploadOptions {
  /** Folder to store the image in Cloudinary */
  folder?: string;
  /** Public ID (filename) for the image */
  public_id?: string;
  /** Tags to associate with the image */
  tags?: string[];
  /** Quality transformation (e.g., 'auto:good') */
  quality?: string;
  /** Format to convert to (e.g., 'webp', 'jpg') */
  format?: string;
  /** Width to resize to */
  width?: number;
  /** Height to resize to */
  height?: number;
  /** Crop mode */
  crop?: 'scale' | 'fit' | 'limit' | 'fill' | 'lpad' | 'mfit' | 'pad' | 'thumb' | 'crop';
  /** Gravity for cropping */
  gravity?: 'center' | 'north' | 'east' | 'south' | 'west' | 'face' | 'faces';
  /** Whether to overwrite existing file */
  overwrite?: boolean;
  /** Whether to invalidate cache */
  invalidate?: boolean;
}

// ============================================================
// Upload Functions
// ============================================================

/**
 * Upload a file buffer or stream to Cloudinary
 * 
 * @param file - Buffer, base64 string, or stream
 * @param options - Upload options
 * @returns Upload result
 * 
 * @example
 * ```ts
 * const result = await uploadToCloudinary(fileBuffer, {
 *   folder: 'products',
 *   public_id: 'ganesh-murti-001',
 *   tags: ['ganesh', 'murti'],
 * });
 * console.log(result.secure_url);
 * ```
 */
export async function uploadToCloudinary(
  file: Buffer | string | Readable,
  options: CloudinaryUploadOptions = {}
): Promise<UploadApiResponse> {
  const {
    folder = 'panditji',
    public_id,
    tags = [],
    quality = 'auto:good',
    format,
    width,
    height,
    crop = 'scale',
    gravity = 'center',
    overwrite = true,
    invalidate = false,
  } = options;

  // Build transformation object
  const transformation: any[] = [];
  if (width || height) {
    const trans: any = { crop };
    if (width) trans.width = width;
    if (height) trans.height = height;
    if (gravity) trans.gravity = gravity;
    transformation.push(trans);
  }
  if (quality) transformation.push({ quality });
  if (format) transformation.push({ format });

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id,
        tags: tags.join(','),
        transformation,
        overwrite,
        invalidate,
        resource_type: 'auto',
      },
  (
  error: UploadApiErrorResponse | undefined,
  result: UploadApiResponse | undefined
) => {
  if (error) {
    return reject(error);
  }

  if (!result) {
    return reject(new Error('Cloudinary upload failed'));
  }

  resolve(result);
}
    );

    if (file instanceof Buffer) {
      uploadStream.end(file);
    } else if (typeof file === 'string') {
      // Assume it's a base64 string or data URL
      uploadStream.end(Buffer.from(file, 'base64'));
    } else if (file instanceof Readable) {
      file.pipe(uploadStream);
    } else {
      reject(new Error('Invalid file type. Expected Buffer, string, or Readable stream.'));
    }
  });
}

/**
 * Upload multiple files to Cloudinary
 * 
 * @param files - Array of buffers, base64 strings, or streams
 * @param options - Upload options (applied to all files)
 * @returns Array of upload results
 */
export async function uploadMultipleToCloudinary(
  files: (Buffer | string | Readable)[],
  options: CloudinaryUploadOptions = {}
): Promise<UploadApiResponse[]> {
  const uploadPromises = files.map((file) =>
    uploadToCloudinary(file, options)
  );
  return Promise.all(uploadPromises);
}

// ============================================================
// Delete Functions
// ============================================================

/**
 * Delete an image from Cloudinary by public_id
 * 
 * @param publicId - The public ID of the image to delete
 * @returns Deletion result
 */
export async function deleteFromCloudinary(publicId: string): Promise<{ result: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    });
  });
}

/**
 * Delete multiple images from Cloudinary
 * 
 * @param publicIds - Array of public IDs
 * @returns Array of deletion results
 */
export async function deleteMultipleFromCloudinary(publicIds: string[]): Promise<{ result: string }[]> {
  const deletePromises = publicIds.map((id) => deleteFromCloudinary(id));
  return Promise.all(deletePromises);
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Get the public ID from a Cloudinary URL
 * 
 * @param url - The Cloudinary URL
 * @returns The public ID
 */
export function getPublicIdFromUrl(url: string): string {
  // Example: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/image.jpg
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  if (uploadIndex === -1) return '';
  const publicIdWithVersion = parts.slice(uploadIndex + 2).join('/');
  // Remove version prefix if exists
  return publicIdWithVersion.replace(/^v\d+\//, '').replace(/\.[^/.]+$/, '');
}

/**
 * Generate a Cloudinary image URL with transformations
 * 
 * @param publicId - The public ID of the image
 * @param options - Transformation options
 * @returns The transformed URL
 */
export function getCloudinaryUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'scale' | 'fit' | 'limit' | 'fill' | 'lpad' | 'mfit' | 'pad' | 'thumb' | 'crop';
    quality?: string;
    format?: string;
    gravity?: 'center' | 'north' | 'east' | 'south' | 'west' | 'face' | 'faces';
    effect?: string;
    flags?: string;
    version?: number;
  } = {}
): string {
  const transformations: string[] = [];
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  if (options.gravity) transformations.push(`g_${options.gravity}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.format) transformations.push(`f_${options.format}`);
  if (options.effect) transformations.push(`e_${options.effect}`);
  if (options.flags) transformations.push(`fl_${options.flags}`);

  const transformationStr = transformations.join(',');
  const versionStr = options.version ? `v${options.version}` : '';
  return cloudinary.url(publicId, {
    transformation: transformationStr || undefined,
    version: versionStr || undefined,
    secure: true,
  });
}

// ============================================================
// Export Cloudinary instance for advanced usage
// ============================================================
export { cloudinary };

// ============================================================
// Default export
// ============================================================
export default cloudinary;