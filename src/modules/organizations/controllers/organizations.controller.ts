import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrganizationsService } from '../services/organizations.service';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { Organization } from '../schemas/organization.schema';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Public() 
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an organization' })
  @ApiResponse({ status: HttpStatus.CREATED, type: Organization })
  async create(@Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all organizations' })
  async findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get an organization by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: Organization })
  async findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an organization' })
  @ApiResponse({ status: HttpStatus.OK, type: Organization })
  async update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.organizationsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an organization' })
  async remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }
}
