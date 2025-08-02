import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs/promises'; // ✅ Use async fs operations
import * as fsSync from 'fs'; // Keep sync for existence checks only

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  validateFile(file: Express.Multer.File, allowedTypes: string[]): void {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      );
    }

    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        'File size too large. Maximum size is 10MB',
      );
    }
  }

  generateFileName(originalName: string, prefix: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(originalName);
    return `${prefix}_${timestamp}_${randomString}${extension}`;
  }

  async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      // Directory doesn't exist, create it
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  getFileUrl(filename: string, type: 'avatar' | 'resume'): string {
    const baseUrl =
      this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
    return `${baseUrl}/uploads/${type}/${filename}`;
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      // Check if file exists before attempting to delete
      await fs.access(filePath);
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  async cleanupOldFiles(
    directory: string,
    maxAgeMs: number = 30 * 24 * 60 * 60 * 1000,
  ): Promise<void> {
    try {
      const files = await fs.readdir(directory);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(directory, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtime.getTime() > maxAgeMs) {
          await this.deleteFile(filePath);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old files:', error);
    }
  }
}
