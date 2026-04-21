import { PartialType } from '@nestjs/swagger';
import { CreateSortOptionDto } from './create-sort-option.dto';

export class UpdateSortOptionDto extends PartialType(CreateSortOptionDto) {}
