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
import { OrgId } from '../../../common/decorators/org-id.decorator';
import { FiltersService } from '../services/filters.service';
import { CreateFilterDto } from '../dto/create-filter.dto';
import { UpdateFilterDto } from '../dto/update-filter.dto';
import { Filter } from '../schema/filter.schema';

@ApiTags('filters')
@Controller('filters')
export class FiltersController {
  constructor(private readonly filtersService: FiltersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List filters for the current organization' })
  @ApiResponse({ status: HttpStatus.OK, type: [Filter] })
  list(@OrgId() orgId: string) {
    return this.filtersService.list(orgId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a single filter' })
  getOne(@Param('id') id: string, @OrgId() orgId: string) {
    return this.filtersService.getById(id, orgId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a filter' })
  create(@Body() dto: CreateFilterDto, @OrgId() orgId: string) {
    return this.filtersService.create(dto, orgId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a filter' })
  update(@Param('id') id: string, @Body() dto: UpdateFilterDto, @OrgId() orgId: string) {
    return this.filtersService.update(id, dto, orgId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a filter' })
  remove(@Param('id') id: string, @OrgId() orgId: string) {
    return this.filtersService.remove(id, orgId);
  }
}
