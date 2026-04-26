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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerAddressService } from '../services/customer-address.service';
import { CreateAddressDto, UpdateAddressDto } from '../dto/address.dto';
import { UserId } from '../../../common/decorators/user-id.decorator';

@ApiTags('Customer Addresses')
@ApiBearerAuth()
@Controller('customer/me/addresses')
export class CustomerAddressController {
  constructor(private readonly addressService: CustomerAddressService) {}

  @Get()
  @ApiOperation({ summary: 'List the current customer\'s addresses' })
  list(@UserId() customerId: string) {
    return this.addressService.list(customerId);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new address' })
  create(@UserId() customerId: string, @Body() dto: CreateAddressDto) {
    return this.addressService.create(customerId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing address' })
  update(
    @UserId() customerId: string,
    @Param('id') addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressService.update(customerId, addressId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an address' })
  remove(@UserId() customerId: string, @Param('id') addressId: string) {
    return this.addressService.remove(customerId, addressId);
  }

  @Post(':id/default')
  @ApiOperation({ summary: 'Mark an address as default' })
  setDefault(@UserId() customerId: string, @Param('id') addressId: string) {
    return this.addressService.setDefault(customerId, addressId);
  }
}
