// backend/src/middlewares/upload.ts

import multer, { FileFilterCallback, MulterError } from 'multer';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from './errorHandler';

// ============================================================
// Types
// ============================================================

export interface UploadedFile extends Express.Multer.File {
  /** Generated unique filename for the uploaded file */
  generatedName?: string;
}

export interface UploadOptions {
  /** Maximum file size in bytes (default: 5MB) */
  maxSize?: number;
  /** Allowed MIME types (default: image/jpeg, image/png, image/webp, image/gif) */
  allowedTypes?: string[];
  /** Maximum number of files (for multiple uploads) */
  maxCount?: number;
  /** Destination folder (for disk storage) */
  destination?: string;
  /** Whether to use memory storage (default: true, for Cloudinary) */
  useMemory?: boolean;
}

// ============================================================
// Constants
// ============================================================

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];
const DEFAULT_MAX_COUNT = 10;

// ============================================================
// Memory Storage (for Cloudinary/cloud upload)
// ============================================================

const memoryStorage = multer.memoryStorage();

// ============================================================
// Disk Storage (for local file system)
// ============================================================

/**
 * Create disk storage for local file uploads
 */
const createDiskStorage = (destination: string = 'uploads/') => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destination);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });
};

// ============================================================
// File Filter
// ============================================================

/**
 * Create a file filter for multer
 */
const createFileFilter = (allowedTypes: string[]) => {
  return (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(
        `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
        400,
        'INVALID_FILE_TYPE'
      ) as any);
    }
  };
};

// ============================================================
// Main Upload Configuration
// ============================================================

/**
 * Configure multer with memory storage for Cloudinary uploads
 * 
 * @param options - Upload configuration options
 * @returns Configured multer instance
 * 
 * @example
 * ```ts
 * const upload = configureUpload({
 *   maxSize: 10 * 1024 * 1024, // 10MB
 *   allowedTypes: ['image/jpeg', 'image/png'],
 * });
 * 
 * router.post('/upload', upload.single('image'), controller.uploadSingle);
 * ```
 */
export const configureUpload = (options: UploadOptions = {}) => {
  const {
    maxSize = DEFAULT_MAX_SIZE,
    allowedTypes = DEFAULT_ALLOWED_TYPES,
    maxCount = DEFAULT_MAX_COUNT,
    useMemory = true,
  } = options;

  // Choose storage
  const storage = useMemory ? memoryStorage : createDiskStorage();

  // Configure multer
  return multer({
    storage,
    limits: {
      fileSize: maxSize,
      files: maxCount,
    },
    fileFilter: createFileFilter(allowedTypes),
  });
};

// ============================================================
// Pre-configured Multer Instances
// ============================================================

/**
 * Default upload instance (memory storage, 5MB max, all image types)
 */
export const upload = configureUpload({
  useMemory: true,
});

/**
 * Upload for large files (20MB max)
 */
export const uploadLarge = configureUpload({
  maxSize: 20 * 1024 * 1024, // 20MB
  useMemory: true,
});

/**
 * Upload for documents (PDF, Word, etc.)
 */
export const uploadDocument = configureUpload({
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
  ],
  useMemory: true,
});

/**
 * Disk storage upload for local file storage
 */
export const uploadDisk = (destination: string = 'uploads/') => {
  return multer({
    storage: createDiskStorage(destination),
    limits: {
      fileSize: DEFAULT_MAX_SIZE,
    },
    fileFilter: createFileFilter(DEFAULT_ALLOWED_TYPES),
  });
};

// ============================================================
// Custom Upload Middleware (with validation)
// ============================================================

/**
 * Upload middleware with custom field validation
 * 
 * @param fieldName - Field name for the file
 * @param options - Upload options
 * @returns Express middleware
 * 
 * @example
 * ```ts
 * router.post('/upload', uploadSingle('avatar'), controller.uploadAvatar);
 * ```
 */
export const uploadSingle = (fieldName: string, options: UploadOptions = {}) => {
  const uploadInstance = configureUpload(options);
  return (req: Request, res: Response, next: NextFunction): void => {
    uploadInstance.single(fieldName)(req, res, (err: any) => {
      if (err instanceof MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
  return next(
    new AppError(
      `File too large. Max size: ${(options.maxSize ?? DEFAULT_MAX_SIZE) / 1024 / 1024}MB`,
      400,
      'FILE_TOO_LARGE'
    )
  );
}
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new AppError('Unexpected file field', 400, 'UNEXPECTED_FILE'));
        }
        return next(new AppError(err.message, 400, 'UPLOAD_ERROR'));
      }
      if (err) {
        return next(err);
      }
      next();
    });
  };
};

/**
 * Upload middleware for multiple files with same field name
 */
export const uploadArray = (fieldName: string, maxCount: number = 5, options: UploadOptions = {}) => {
  const uploadInstance = configureUpload({ ...options, maxCount });
  return (req: Request, res: Response, next: NextFunction): void => {
    uploadInstance.array(fieldName, maxCount)(req, res, (err: any) => {
      if (err instanceof MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError(`File too large. Max size: ${options.maxSize || DEFAULT_MAX_SIZE / 1024 / 1024}MB`, 400, 'FILE_TOO_LARGE'));
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return next(new AppError(`Too many files. Max: ${maxCount}`, 400, 'TOO_MANY_FILES'));
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new AppError('Unexpected file field', 400, 'UNEXPECTED_FILE'));
        }
        return next(new AppError(err.message, 400, 'UPLOAD_ERROR'));
      }
      if (err) {
        return next(err);
      }
      next();
    });
  };
};

/**
 * Upload middleware for multiple files with different fields
 */
export const uploadFields = (fields: { name: string; maxCount?: number }[], options: UploadOptions = {}) => {
  const maxCount = fields.reduce((sum, f) => sum + (f.maxCount || 1), 0);
  const uploadInstance = configureUpload({ ...options, maxCount });
  return (req: Request, res: Response, next: NextFunction): void => {
    uploadInstance.fields(fields)(req, res, (err: any) => {
      if (err instanceof MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError(`File too large. Max size: ${options.maxSize || DEFAULT_MAX_SIZE / 1024 / 1024}MB`, 400, 'FILE_TOO_LARGE'));
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new AppError('Unexpected file field', 400, 'UNEXPECTED_FILE'));
        }
        return next(new AppError(err.message, 400, 'UPLOAD_ERROR'));
      }
      if (err) {
        return next(err);
      }
      next();
    });
  };
};

// ============================================================
// Utility Functions
// ============================================================

/**
 * Check if a file is an image
 */
export const isImage = (file: Express.Multer.File): boolean => {
  return file.mimetype.startsWith('image/');
};

/**
 * Check if a file is a video
 */
export const isVideo = (file: Express.Multer.File): boolean => {
  return file.mimetype.startsWith('video/');
};

/**
 * Check if a file is a document (PDF, Word, etc.)
 */
export const isDocument = (file: Express.Multer.File): boolean => {
  const docTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  return docTypes.includes(file.mimetype);
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return path.extname(filename).toLowerCase();
};

/**
 * Get file size in human-readable format
 */
export const getReadableFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ============================================================
// Default Export
// ============================================================

export default {
  configureUpload,
  upload,
  uploadLarge,
  uploadDocument,
  uploadDisk,
  uploadSingle,
  uploadArray,
  uploadFields,
  isImage,
  isVideo,
  isDocument,
  getFileExtension,
  getReadableFileSize,
};