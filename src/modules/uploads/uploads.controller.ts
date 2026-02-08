import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { CloudinaryService } from './cloudinary.service';

@Controller('upload')
export class UploadsController {
  constructor(private readonly cloudinary: CloudinaryService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype?.startsWith('image/')) {
          cb(new BadRequestException('Only image files are allowed') as any, false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async upload(
    @UploadedFile()
    file?: { buffer: Buffer; originalname: string; mimetype?: string },
  ) {
    if (!file?.buffer) {
      throw new BadRequestException('File is required');
    }

    const baseName = file.originalname
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 60);
    const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const uploaded = await this.cloudinary.uploadBuffer(file.buffer, {
      folder: 'store/products',
      public_id: `${unique}_${baseName || 'image'}`,
    });

    return { url: uploaded.secure_url };
  }
}
