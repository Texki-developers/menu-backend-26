import {
    Body,
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('upload')
export class UploadController {
    constructor(private readonly cloudinaryService: CloudinaryService) { }

    @Post('image')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File, @Body() body: { folder?: string }) {
        const result: any = await this.cloudinaryService.uploadImage(file, body.folder ?? "uploads");
        return {
            url: result['secure_url'],       // HTTPS image URL
            publicId: result['public_id'],   // use this to delete later
        };
    }
}