import { Controller, Get, Param, Query, Req, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { GetAllCustomersDto } from '../dto/get-all-customers.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { USER_ROLES } from '../../../constants/user-roles.constant';
import { OrganizationScopeGuard } from '../../../common/guards/organization-scope.guard';

@ApiTags('Customer Management')
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard, OrganizationScopeGuard)
@ApiBearerAuth()
export class CustomerManagementController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(USER_ROLES.ORG_ADMIN, USER_ROLES.BRANCH_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all customers (Next.js app users)' })
  @ApiResponse({ status: 200, description: 'Customers retrieved successfully' })
  async listCustomers(@Query() query: GetAllCustomersDto, @Req() req: any) {
    query.organization_id = req.user.organizationId;
    return this.usersService.getAllCustomers(query);
  }

  @Get(':id')
  @Roles(USER_ROLES.ORG_ADMIN, USER_ROLES.BRANCH_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get customer details' })
  @ApiResponse({ status: 200, description: 'Customer details retrieved successfully' })
  async getDetail(@Param('id') id: string) {
    return this.usersService.getCustomerById(id);
  }
}
