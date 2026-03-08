import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateAdminDto, CreateOrgAdminDto, CreateBranchAdminDto } from '../dto/create-admin.dto';
import { Admin } from '../schemas/admin.schema';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { USER_ROLES } from '../../../constants/user-roles.constant';

@ApiTags('admins')
@ApiExtraModels(CreateOrgAdminDto, CreateBranchAdminDto)
@Controller('admins')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminManagementController {
  constructor(private readonly usersService: UsersService) {}

  @Post('org')
  @Public() 
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new Org Admin' })
  @ApiResponse({ status: 201, description: 'Org Admin created successfully', type: Admin })
  async createOrgAdmin(@Body() dto: CreateOrgAdminDto) {
    return this.usersService.createAdmin(dto, USER_ROLES.ORG_ADMIN);
  }

  @Post('branch')
  // @Public() // Commented: Only Org Admins should be able to create Branch Admins
  @Roles(USER_ROLES.ORG_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new Branch Admin' })
  @ApiResponse({ status: 201, description: 'Branch Admin created successfully', type: Admin })
  async createBranchAdmin(@Body() dto: CreateBranchAdminDto) {
    return this.usersService.createAdmin(dto, USER_ROLES.BRANCH_ADMIN);
  }
}
