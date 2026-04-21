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
import { SortOptionsService } from '../services/sort-options.service';
import { CreateSortOptionDto } from '../dto/create-sort-option.dto';
import { UpdateSortOptionDto } from '../dto/update-sort-option.dto';
import { SortOption } from '../schema/sort-option.schema';

@ApiTags('sort-options')
@Controller('sort-options')
export class SortOptionsController {
  constructor(private readonly sortOptionsService: SortOptionsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List sort options for the current organization' })
  @ApiResponse({ status: HttpStatus.OK, type: [SortOption] })
  list(@OrgId() orgId: string) {
    return this.sortOptionsService.list(orgId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a single sort option' })
  getOne(@Param('id') id: string, @OrgId() orgId: string) {
    return this.sortOptionsService.getById(id, orgId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a sort option' })
  create(@Body() dto: CreateSortOptionDto, @OrgId() orgId: string) {
    return this.sortOptionsService.create(dto, orgId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a sort option' })
  update(@Param('id') id: string, @Body() dto: UpdateSortOptionDto, @OrgId() orgId: string) {
    return this.sortOptionsService.update(id, dto, orgId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a sort option' })
  remove(@Param('id') id: string, @OrgId() orgId: string) {
    return this.sortOptionsService.remove(id, orgId);
  }
}
