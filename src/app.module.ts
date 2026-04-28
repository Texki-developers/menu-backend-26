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
import { OrdersModule } from './modules/orders/orders.module';
import { CustomerMenuModule } from './modules/customer-menu/customer-menu.module';
import { CartModule } from './modules/cart/cart.module';
import { FiltersModule } from './modules/filters/filters.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { OrganizationScopeGuard } from './common/guards/organization-scope.guard';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    // ... imports same as before
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
        THROTTLER_TTL: Joi.number().default(60000),
        THROTTLER_LIMIT: Joi.number().default(10),
      }),
      validationOptions: {
        abortEarly: true,
      }
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLER_TTL') ?? 60000,
          limit: config.get<number>('THROTTLER_LIMIT') ?? 10,
        },
      ],
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
    OrdersModule,
    CustomerMenuModule,
    CartModule,
    FiltersModule,
    CloudinaryModule,
    UploadModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: OrganizationScopeGuard,
    },
  ],
})
export class AppModule { }
