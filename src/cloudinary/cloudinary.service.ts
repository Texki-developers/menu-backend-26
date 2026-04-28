import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
    private readonly logger = new Logger(CloudinaryService.name);

    async uploadImage(file: Express.Multer.File, folder = 'uploads'): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder, resource_type: 'image' },
                (error, result) => {
                    if (error || !result) return reject(error ?? new Error('Upload failed'));
                    resolve(result);
                },
            );
            Readable.from(file.buffer).pipe(uploadStream);
        });
    }

    async deleteImage(publicId: string) {
        return cloudinary.uploader.destroy(publicId);
    }

    /** Best-effort delete; logs and swallows errors so it can be safely called from delete flows. */
    async safeDelete(publicId: string | undefined | null): Promise<void> {
        if (!publicId) return;
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (err) {
            this.logger.warn(`Failed to delete cloudinary asset ${publicId}: ${err instanceof Error ? err.message : err}`);
        }
    }

    async safeDeleteMany(publicIds: (string | undefined | null)[]): Promise<void> {
        const ids = publicIds.filter((id): id is string => !!id);
        if (ids.length === 0) return;
        await Promise.all(ids.map((id) => this.safeDelete(id)));
    }
}