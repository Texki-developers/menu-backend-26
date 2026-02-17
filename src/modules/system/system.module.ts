import { Module } from '@nestjs/common';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UsersModule } from '../users/users.module';
import { SystemService } from './services/system.service';
import { SystemController } from './controllers/system.controller';

@Module({
  imports: [OrganizationsModule, UsersModule],
  controllers: [SystemController],
  providers: [SystemService],
})
export class SystemModule {}
