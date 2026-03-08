import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from './schemas/admin.schema';
import { Staff, StaffSchema } from './schemas/staff.schema';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import { UsersService } from './services/users.service';
import { AdminManagementController } from './controllers/admin-management.controller';
import { StaffManagementController } from './controllers/staff-management.controller';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    OrganizationsModule,
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: Staff.name, schema: StaffSchema },
      { name: Customer.name, schema: CustomerSchema },
    ]),
  ],
  controllers: [AdminManagementController, StaffManagementController],
  providers: [UsersService],
  exports: [MongooseModule, UsersService],
})
export class UsersModule {}
