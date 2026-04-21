import { BadRequestException, Controller, Get, HttpCode, HttpStatus, NotFoundException, Param } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { isValidObjectId, Model } from 'mongoose';
import { Public } from '../../../common/decorators/public.decorator';
import { Branch } from '../../branches/schema/branches.schema';
import { BranchStatus } from '../../branches/constants/constant';
import { FiltersService } from '../services/filters.service';
import { SortOptionsService } from '../services/sort-options.service';

@ApiTags('customer-filters')
@Controller('public/branches/:branchId')
export class CustomerFiltersController {
  constructor(
    private readonly filtersService: FiltersService,
    private readonly sortOptionsService: SortOptionsService,
    @InjectModel(Branch.name) private readonly branchModel: Model<Branch>,
  ) {}

  @Public()
  @Get('filters')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Active filters + sort options for this branch' })
  async get(@Param('branchId') branchId: string) {
    if (!isValidObjectId(branchId)) throw new BadRequestException('Invalid branchId');
    const branch = await this.branchModel.findById(branchId).lean();
    if (!branch || branch.status !== BranchStatus.ACTIVE) {
      throw new NotFoundException('Branch not found or inactive');
    }
    const orgId = branch.organization_id?.toString() ?? '';
    const [filters, sort_options] = await Promise.all([
      this.filtersService.listActive(orgId),
      this.sortOptionsService.listActive(orgId),
    ]);
    return { filters, sort_options };
  }
}
