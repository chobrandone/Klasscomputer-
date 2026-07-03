import {
  BadRequestException,
  Controller,
  Module,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuid } from 'uuid';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

const storage = diskStorage({
  destination: join(process.cwd(), process.env.UPLOAD_PATH || 'uploads'),
  filename: (_req, file, cb) => cb(null, `${uuid()}${extname(file.originalname).toLowerCase()}`),
});

const imageFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  if (!/^image\/(jpe?g|png|webp|gif|avif|svg\+xml)$/.test(file.mimetype)) {
    return cb(new BadRequestException('Only image files are allowed'), false);
  }
  cb(null, true);
};

const publicUrl = (filename: string) =>
  `${process.env.PUBLIC_URL || 'http://localhost:3001'}/uploads/${filename}`;

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UploadController {
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter: imageFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return { url: publicUrl(file.filename) };
  }

  @Post('images')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage,
      fileFilter: imageFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files?.length) throw new BadRequestException('No files uploaded');
    return { urls: files.map((f) => publicUrl(f.filename)) };
  }
}

@Module({
  controllers: [UploadController],
})
export class UploadModule {}
