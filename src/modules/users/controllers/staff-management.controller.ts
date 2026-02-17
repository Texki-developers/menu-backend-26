import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateStaffDto } from '../dto/create-staff.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { USER_ROLES } from '../../../constants/user-roles.constant';
import { OrganizationScopeGuard } from '../../../common/guards/organization-scope.guard';
import { BranchScopeGuard } from '../../../common/guards/branch-scope.guard';

@ApiTags('Staff Management')
@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard, OrganizationScopeGuard, BranchScopeGuard)
@ApiBearerAuth()
export class StaffManagementController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(USER_ROLES.ORG_ADMIN, USER_ROLES.BRANCH_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new Staff member' })
  @ApiResponse({ status: 201, description: 'Staff created successfully' })
  async create(@Body() createStaffDto: CreateStaffDto) {
    return this.usersService.createStaff(createStaffDto);
  }
}
