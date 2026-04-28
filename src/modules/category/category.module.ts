import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryController } from './controller/category.controller';
import { CategoryService } from './services/category.service';
import { Category, CategorySchema } from './schema/category.schema';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
    CloudinaryModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [MongooseModule]
})
export class CategoryModule {}
