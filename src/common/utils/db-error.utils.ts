import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

/**
 * Handles database errors (like Mongoose ValidationErrors) and throws appropriate NestJS exceptions.
 * @param error The error object caught in the catch block.
 * @param context A string describing what action was being performed (e.g., "creating the branch").
 */
export function handleDbError(error: any, context: string) {
    console.error(`🚀 ~ Database Error during ${context}:`, error);

    // Mongoose Validation Error
    if (error.name === 'ValidationError') {
        throw new BadRequestException(error.message);
    }

    // Mongoose Duplicate Key Error (Code 11000)
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0];
        throw new BadRequestException(`${field || 'Field'} already exists. Please use a unique value.`);
    }

    // Fallback for unexpected errors
    throw new InternalServerErrorException(`An unexpected error occurred while ${context}`);
}
