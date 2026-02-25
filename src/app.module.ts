import { Module } from '@nestjs/common';
import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { SystemModule } from './modules/system/system.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { BranchesModule } from './modules/branches/branches.module';
import { MigrationsModule } from './migrations/migrations.module';
import { CategoryModule } from './modules/category/category.module';
import { MenuModule } from './modules/menu/menu.module';
import { ProductsModule } from './modules/products/products.module';
import { MenuItemsModule } from './modules/menu-items/menu-items.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        MONGO_URI: Joi.string().required(),
        MONGO_DB_NAME: Joi.string().required(),
        PORT: Joi.number().default(3333),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().required(),
        REFRESH_TOKEN_SECRET: Joi.string().required(),
        REFRESH_TOKEN_EXPIRATION: Joi.string().required(),
        SYSTEM_ACCESS_KEY: Joi.string().required(),
      }),
      validationOptions: {
        abortEarly: true,
      }
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          uri: config.get('MONGO_URI'),
        };
      }
    }),
    AuthModule,
    OrganizationsModule,
    SystemModule,
    BranchesModule,
    MigrationsModule,
    CategoryModule,
    MenuModule,
    ProductsModule,
    MenuItemsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
