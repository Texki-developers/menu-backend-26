import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from '../schemas/product.schema';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { GetAllProductsDto } from '../dto/get-all-products.dto';
import { SortOrder } from '../../../common/interfaces/pagination.interface';
import { handleDbError, escapeRegex, paginate } from '../../../common/utils';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async createProduct(dto: CreateProductDto): Promise<Product> {
    try {
      const product = new this.productModel({
        ...dto,
        product_uuid: `prod_${crypto.randomUUID()}`,
      });
      return await product.save();
    } catch (error) {
      handleDbError(error, 'creating the product');
      throw error;
    }
  }

  async getAllProducts(dto: GetAllProductsDto) {
    try {
      const {
        query,
        page = '1',
        limit = '10',
        organization_id,
        type,
        is_active,
        is_featured,
        sortBy = 'created_at',
        sortOrder = SortOrder.DESC,
      } = dto;

      const baseFilter: Record<string, any> = { is_deleted: false };
      if (organization_id) {
        baseFilter.organization_id = new Types.ObjectId(organization_id);
      }

      const searchFilter: Record<string, any> = {};
      if (type) searchFilter.type = type;
      if (is_active !== undefined) searchFilter.is_active = is_active;
      if (is_featured !== undefined) searchFilter.is_featured = is_featured;

      if (query) {
        const safe = escapeRegex(query);
        searchFilter.$or = [
          { name: { $regex: safe, $options: 'i' } },
          { slug: { $regex: safe, $options: 'i' } },
          { description: { $regex: safe, $options: 'i' } },
        ];
      }

      return await paginate(this.productModel, {
        page,
        limit,
        sortBy,
        sortOrder: sortOrder as any,
        baseFilter,
        searchFilter,
        extraFacets: {
          totalActive: [
            { $match: { is_active: true } },
            { $count: 'count' },
          ],
        },
      });
    } catch (error) {
      handleDbError(error, 'getting all products');
      throw error;
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const product = await this.productModel.findById(id).lean();
      if (!product) throw new NotFoundException('Product not found');
      return product as unknown as Product;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handleDbError(error, 'getting the product');
      throw error;
    }
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    try {
      const updated = await this.productModel.findByIdAndUpdate(
        id,
        { $set: dto },
        { new: true, runValidators: true },
      );
      if (!updated) throw new NotFoundException('Product not found');
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handleDbError(error, 'updating the product');
      throw error;
    }
  }

  async deleteProduct(id: string) {
    try {
      // Soft delete
      const result = await this.productModel.findByIdAndUpdate(
        id,
        { $set: { is_deleted: true, is_active: false } },
        { new: true },
      );
      if (!result) throw new NotFoundException('Product not found');
      return { message: 'Product deleted successfully', id };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handleDbError(error, 'deleting the product');
      throw error;
    }
  }
}
