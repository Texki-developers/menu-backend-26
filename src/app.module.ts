import { Module } from '@nestjs/common';
import * as Joi from 'joi';
import {ConfigModule, ConfigService} from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BranchModule } from './branch/branch.module';
import { OrganizationModule } from './organization/organization.module';

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
          dbName: config.get('MONGO_DB_NAME'),
        };
      }
    }),
    OrganizationModule,
    BranchModule, 
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
