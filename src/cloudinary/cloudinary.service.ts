import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
    async uploadImage(file: Express.Multer.File, folder = 'uploads') {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                },
            );

            // Convert buffer to stream and pipe it
            Readable.from(file.buffer).pipe(uploadStream);
        });
    }

    async deleteImage(publicId: string) {
        return cloudinary.uploader.destroy(publicId);
    }
}