import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { Branch } from '../../branches/schema/branches.schema';
import { Category } from '../../category/schema/category.schema';
import { MenuItem } from '../../menu-items/schemas/menu-item.schema';
import { Menu } from '../../menu/schema/menu.schema';
import { Product } from '../../products/schemas/product.schema';
import { BranchStatus } from '../../branches/constants/constant';
import { MenuStatus } from '../../menu/constants/constant';
import { isMenuActiveAt } from '../../menu/utils/menu-schedule';
import {
  CustomerCategoryDto,
  CustomerMenuItemDto,
  GetBranchMenuResponseDto,
} from '../dto/get-branch-menu.dto';
import {
  GetProductDetailResponseDto,
  ProductDetailDto,
} from '../dto/get-product-detail.dto';
import { handleDbError } from '../../../common/utils';

interface RawMenuItem {
  _id: Types.ObjectId | string;
  product_id: string;
  menu_id: string;
  category_id: string;
  base_price: number;
  selling_price: number;
  discount_price?: number;
  is_available: boolean;
  is_featured: boolean;
  prep_time?: string;
  max_quantity?: number;
  sort_order: number;
  media?: any[];
  variants?: any[];
  extras?: any[];
  max_extras?: number;
}

@Injectable()
export class CustomerMenuService {
  constructor(
    @InjectModel(Branch.name) private readonly branchModel: Model<Branch>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    @InjectModel(MenuItem.name) private readonly menuItemModel: Model<MenuItem>,
    @InjectModel(Menu.name) private readonly menuModel: Model<Menu>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  async getBranchMenu(branchId: string): Promise<GetBranchMenuResponseDto> {
    if (!isValidObjectId(branchId)) {
      throw new BadRequestException('Invalid branchId');
    }

    try {
      const branch = await this.branchModel.findById(branchId).lean();
      if (!branch || branch.status !== BranchStatus.ACTIVE) {
        throw new NotFoundException('Branch not found or inactive');
      }

      const organizationId = branch.organization_id?.toString();

      const [menuItems, categories] = await Promise.all([
        this.menuItemModel
          .find({
            branch_id: branchId,
            organization_id: organizationId,
            is_available: true,
          })
          .sort({ sort_order: 1 })
          .lean<RawMenuItem[]>(),
        this.categoryModel
          .find({
            branch_id: branchId,
            organization_id: organizationId,
            isActive: true,
          })
          .sort({ name: 1 })
          .lean(),
      ]);

      // Filter menu items to those whose parent Menu is currently active (status, isActive, schedule).
      const menuIds = Array.from(new Set(menuItems.map((m) => m.menu_id).filter(Boolean)));
      const menus = menuIds.length
        ? await this.menuModel
            .find({ _id: { $in: menuIds }, status: MenuStatus.ACTIVE, isActive: true })
            .lean()
        : [];
      const activeMenuIds = new Set(
        menus.filter((m) => isMenuActiveAt(m.schedule)).map((m) => m._id?.toString()),
      );
      const activeItems = menuItems.filter((m) => activeMenuIds.has(m.menu_id?.toString()));

      const productIds = Array.from(new Set(activeItems.map((m) => m.product_id)));
      const products = await this.productModel
        .find({ _id: { $in: productIds }, is_deleted: { $ne: true } })
        .lean();
      const productById = new Map(products.map((p) => [p._id?.toString(), p]));

      const itemsByCategory = new Map<string, CustomerMenuItemDto[]>();
      for (const item of activeItems) {
        const product = productById.get(item.product_id?.toString());
        if (!product) continue;

        const dto: CustomerMenuItemDto = {
          id: item._id.toString(),
          product_id: item.product_id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          type: product.type,
          spice_level: product.spice_level,
          is_featured: item.is_featured,
          calories: product.calories,
          tags: product.tags ?? [],
          allergens: product.allergens ?? [],
          base_price: item.base_price,
          selling_price: item.selling_price,
          discount_price: item.discount_price,
          is_available: item.is_available,
          prep_time: item.prep_time,
          max_quantity: item.max_quantity,
          media: (item.media?.length ? item.media : product.media) ?? [],
        };

        const key = item.category_id?.toString();
        if (!itemsByCategory.has(key)) itemsByCategory.set(key, []);
        itemsByCategory.get(key)!.push(dto);
      }

      const categoryDtos: CustomerCategoryDto[] = categories
        .map((cat) => ({
          id: cat._id?.toString() ?? '',
          name: cat.name,
          icon: cat.icon,
          image_url: cat.image_url,
          items: itemsByCategory.get(cat._id?.toString() ?? '') ?? [],
        }))
        .filter((c) => c.items.length > 0);

      return {
        branch: {
          id: branch._id?.toString() ?? branchId,
          name: branch.name,
          organization_id: organizationId ?? '',
          phone: branch.phone,
          email: branch.email,
          address_detail: branch.address_detail as unknown as Record<string, unknown>,
          operating_hours: branch.operating_hours as unknown as Record<string, unknown>[],
          status: branch.status,
        },
        categories: categoryDtos,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      handleDbError(error, 'getting the branch menu');
      throw error;
    }
  }

  async getProductDetail(
    branchId: string,
    slug: string,
  ): Promise<GetProductDetailResponseDto> {
    if (!isValidObjectId(branchId)) {
      throw new BadRequestException('Invalid branchId');
    }

    try {
      const branch = await this.branchModel.findById(branchId).lean();
      if (!branch || branch.status !== BranchStatus.ACTIVE) {
        throw new NotFoundException('Branch not found or inactive');
      }
      const organizationId = branch.organization_id?.toString();

      const product = await this.productModel
        .findOne({
          slug,
          organization_id: organizationId,
          is_active: true,
          is_deleted: { $ne: true },
        })
        .lean();
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const menuItem = await this.menuItemModel
        .findOne({
          product_id: product._id?.toString(),
          branch_id: branchId,
          organization_id: organizationId,
          is_available: true,
        })
        .lean<RawMenuItem>();
      if (!menuItem) {
        throw new NotFoundException('Item not available at this branch');
      }

      const item: ProductDetailDto = {
        id: menuItem._id.toString(),
        product_id: menuItem.product_id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        type: product.type,
        spice_level: product.spice_level,
        is_featured: menuItem.is_featured,
        is_alcohol: product.is_alcohol ?? false,
        calories: product.calories,
        nutritional_info: product.nutritional_info ?? undefined,
        tags: product.tags ?? [],
        allergens: product.allergens ?? [],
        base_price: menuItem.base_price,
        selling_price: menuItem.selling_price,
        discount_price: menuItem.discount_price,
        is_available: menuItem.is_available,
        prep_time: menuItem.prep_time,
        max_quantity: menuItem.max_quantity,
        max_extras: menuItem.max_extras,
        media: (menuItem.media?.length ? menuItem.media : product.media) ?? [],
        variants: (menuItem.variants ?? []).sort(
          (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
        ),
        extras: (menuItem.extras ?? []).sort(
          (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
        ),
        special_note: product.special_note,
        warning_note: product.warning_note,
        rating: null,
        review_count: 0,
      };

      return {
        branch: {
          id: branch._id?.toString() ?? branchId,
          name: branch.name,
          organization_id: organizationId ?? '',
          phone: branch.phone,
          email: branch.email,
          address_detail: branch.address_detail as unknown as Record<string, unknown>,
          operating_hours: branch.operating_hours as unknown as Record<string, unknown>[],
          status: branch.status,
        },
        item,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      handleDbError(error, 'getting the product detail');
      throw error;
    }
  }
}
