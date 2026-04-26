import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { Customer } from '../schemas/customer.schema';
import { Address } from '../schemas/address.schema';
import { CreateAddressDto, UpdateAddressDto } from '../dto/address.dto';

type StoredAddress = Address & { _id: Types.ObjectId };

@Injectable()
export class CustomerAddressService {
  constructor(
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
  ) {}

  async list(customerId: string): Promise<StoredAddress[]> {
    const customer = await this.findCustomerOrFail(customerId);
    return customer.addresses ?? [];
  }

  async create(customerId: string, dto: CreateAddressDto): Promise<StoredAddress> {
    const customer = await this.findCustomerOrFail(customerId);
    const isFirst = (customer.addresses?.length ?? 0) === 0;
    const shouldBeDefault = dto.is_default || isFirst;

    if (shouldBeDefault) this.unsetDefaults(customer);

    customer.addresses.push({
      ...dto,
      is_default: shouldBeDefault,
    } as StoredAddress);

    await customer.save();
    return customer.addresses[customer.addresses.length - 1];
  }

  async update(
    customerId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ): Promise<StoredAddress> {
    if (!isValidObjectId(addressId)) {
      throw new BadRequestException('Invalid address id');
    }
    const customer = await this.findCustomerOrFail(customerId);
    const address = customer.addresses.find((a) => a._id.toString() === addressId);
    if (!address) throw new NotFoundException('Address not found');

    if (dto.is_default === true) this.unsetDefaults(customer);

    Object.assign(address, dto);
    if (dto.is_default === true) address.is_default = true;

    await customer.save();
    return address;
  }

  async remove(customerId: string, addressId: string): Promise<void> {
    if (!isValidObjectId(addressId)) {
      throw new BadRequestException('Invalid address id');
    }
    const customer = await this.findCustomerOrFail(customerId);
    const before = customer.addresses.length;
    const wasDefault = customer.addresses.find(
      (a) => a._id.toString() === addressId,
    )?.is_default;

    customer.addresses = customer.addresses.filter(
      (a) => a._id.toString() !== addressId,
    ) as StoredAddress[];

    if (customer.addresses.length === before) {
      throw new NotFoundException('Address not found');
    }

    if (wasDefault && customer.addresses.length > 0) {
      customer.addresses[0].is_default = true;
    }

    await customer.save();
  }

  async setDefault(customerId: string, addressId: string): Promise<StoredAddress> {
    if (!isValidObjectId(addressId)) {
      throw new BadRequestException('Invalid address id');
    }
    const customer = await this.findCustomerOrFail(customerId);
    const target = customer.addresses.find((a) => a._id.toString() === addressId);
    if (!target) throw new NotFoundException('Address not found');

    this.unsetDefaults(customer);
    target.is_default = true;
    await customer.save();
    return target;
  }

  private unsetDefaults(customer: Customer): void {
    for (const addr of customer.addresses ?? []) addr.is_default = false;
  }

  private async findCustomerOrFail(customerId: string): Promise<Customer> {
    if (!isValidObjectId(customerId)) {
      throw new BadRequestException('Invalid customer id');
    }
    const customer = await this.customerModel.findById(customerId);
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }
}
