import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Get, Query, Param, Patch, Delete, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateStaffDto } from '../dto/create-staff.dto';
import { GetAllStaffDto } from '../dto/get-all-staff.dto';
import { UpdateStaffDto } from '../dto/update-staff.dto';
import { ChangeStaffPasswordDto } from '../dto/change-staff-password.dto';
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
  async create(@Body() createStaffDto: CreateStaffDto, @Req() req: any) {
    // Automatically scope new staff to the admin's organization
    createStaffDto.organization_id = req.user.organizationId;
    return this.usersService.createStaff(createStaffDto);
  }

  @Get()
  @Roles(USER_ROLES.ORG_ADMIN, USER_ROLES.BRANCH_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all Staff members' })
  @ApiResponse({ status: 200, description: 'Staff members retrieved successfully' })
  async listStaff(@Query() query: GetAllStaffDto, @Req() req: any) {
    // Always scope to the admin's organization — frontend doesn't need to send it
    query.organization_id = req.user.organizationId;
    return this.usersService.getAllStaff(query);
  }

  @Get('download')
  @Roles(USER_ROLES.ORG_ADMIN, USER_ROLES.BRANCH_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Download staff list as CSV' })
  async downloadStaff(@Req() req: any, @Res() res: any) {
    return this.usersService.downloadStaffCsv(res, req.user.organizationId);
  }

  @Get(':id')
  @Roles(USER_ROLES.ORG_ADMIN, USER_ROLES.BRANCH_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Staff member details' })
  @ApiResponse({ status: 200, description: 'Staff member details retrieved successfully' })
  async getDetail(@Param('id') id: string) {
    return this.usersService.getStaffById(id);
  }

  @Patch(':id')
  @Roles(USER_ROLES.ORG_ADMIN, USER_ROLES.BRANCH_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update Staff member' })
  @ApiResponse({ status: 200, description: 'Staff member updated successfully' })
  async update(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.usersService.updateStaff(id, updateStaffDto);
  }

  @Patch(':id/change-password')
  @Roles(USER_ROLES.ORG_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change staff member password (admin only)' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(@Param('id') id: string, @Body() dto: ChangeStaffPasswordDto) {
    return this.usersService.changeStaffPassword(id, dto.password);
  }

  @Delete(':id')
  @Roles(USER_ROLES.ORG_ADMIN, USER_ROLES.BRANCH_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete Staff member' })
  @ApiResponse({ status: 200, description: 'Staff member deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.usersService.deleteStaff(id);
  }
}
