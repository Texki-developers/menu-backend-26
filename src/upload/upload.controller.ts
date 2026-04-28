import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { UploadApiResponse } from 'cloudinary';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { OrgId } from '../common/decorators/org-id.decorator';

const ALLOWED_FOLDERS = [
  'products',
  'categories',
  'menu-items',
  'branches',
  'logos',
  'users',
] as const;

type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload an image to Cloudinary (scoped to caller\'s organization)' })
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_IMAGE_BYTES }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|avif|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('folder') folder: string | undefined,
    @OrgId() orgId: string,
  ) {
    if (!folder || !ALLOWED_FOLDERS.includes(folder as AllowedFolder)) {
      throw new BadRequestException(
        `folder must be one of: ${ALLOWED_FOLDERS.join(', ')}`,
      );
    }

    const scopedFolder = `organizations/${orgId}/${folder}`;
    const result = (await this.cloudinaryService.uploadImage(
      file,
      scopedFolder,
    )) as UploadApiResponse;

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  }

  @Delete('image')
  @ApiOperation({ summary: 'Delete a previously uploaded image by public_id' })
  async deleteImage(
    @Body('public_id') publicId: string | undefined,
    @OrgId() orgId: string,
  ) {
    if (!publicId) {
      throw new BadRequestException('public_id is required');
    }
    if (!publicId.startsWith(`organizations/${orgId}/`)) {
      throw new BadRequestException('Cannot delete assets outside your organization');
    }
    const result = await this.cloudinaryService.deleteImage(publicId);
    return { result: result.result };
  }
}
