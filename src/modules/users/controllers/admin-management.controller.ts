import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { USER_ROLES } from '../../../constants/user-roles.constant';

@ApiTags('Admin Management')
@Controller('admins')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminManagementController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(USER_ROLES.ORG_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new Admin' })
  @ApiResponse({ status: 201, description: 'Admin created successfully' })
  async create(@Body() createAdminDto: CreateAdminDto) {
    return this.usersService.createAdmin(createAdminDto);
  }
}
