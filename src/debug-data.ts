
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const categoryModel = app.get<Model<any>>(getModelToken('Category'));
  const menuModel = app.get<Model<any>>(getModelToken('Menu'));

  const categories = await categoryModel.find().limit(5).lean();
  console.log('Sample Categories:', JSON.stringify(categories, null, 2));

  if (categories.length > 0) {
    const firstCat = categories[0];
    console.log('Category menuId type:', typeof firstCat.menuId);
    console.log('Category menuId is ObjectId:', firstCat.menuId instanceof Object);
  }

  await app.close();
}
bootstrap();
