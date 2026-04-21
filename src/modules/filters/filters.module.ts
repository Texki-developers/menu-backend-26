import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Filter, FilterSchema } from './schema/filter.schema';
import { SortOption, SortOptionSchema } from './schema/sort-option.schema';
import { FiltersService } from './services/filters.service';
import { SortOptionsService } from './services/sort-options.service';
import { FiltersController } from './controller/filters.controller';
import { SortOptionsController } from './controller/sort-options.controller';
import { CustomerFiltersController } from './controller/customer-filters.controller';
import { Branch, BranchSchema } from '../branches/schema/branches.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Filter.name, schema: FilterSchema },
      { name: SortOption.name, schema: SortOptionSchema },
      { name: Branch.name, schema: BranchSchema },
    ]),
  ],
  controllers: [FiltersController, SortOptionsController, CustomerFiltersController],
  providers: [FiltersService, SortOptionsService],
  exports: [FiltersService, SortOptionsService],
})
export class FiltersModule {}
