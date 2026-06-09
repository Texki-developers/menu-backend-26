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
import {
  CustomerMenuListItemDto,
  ListMenusResponseDto,
} from '../dto/list-menus.dto';
import {
  CustomerCategoryListItemDto,
  ListCategoriesResponseDto,
} from '../dto/list-categories.dto';
import { ListItemsResponseDto } from '../dto/list-items.dto';
import { GetBranchResponseDto } from '../dto/get-branch.dto';
import { SearchItemsQueryDto } from '../dto/search-items.dto';
import { handleDbError } from '../../../common/utils';
import { escapeRegex } from '../../../common/utils/regex.utils';

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
      const menuObjectIds = menuIds
        .filter((id) => isValidObjectId(id))
        .map((id) => new Types.ObjectId(id));
      const menus = menuObjectIds.length
        ? await this.menuModel
            .find({ _id: { $in: menuObjectIds }, status: MenuStatus.ACTIVE, isActive: true })
            .lean()
        : [];
      const activeMenuIds = new Set(
        menus.filter((m) => isMenuActiveAt(m.schedule)).map((m) => m._id?.toString()),
      );
      const activeItems = menuItems.filter((m) => activeMenuIds.has(m.menu_id?.toString()));

      const productIds = Array.from(new Set(activeItems.map((m) => m.product_id)));
      const productObjectIds = productIds
        .filter((id) => isValidObjectId(id))
        .map((id) => new Types.ObjectId(id));
      const products = await this.productModel
        .find({ _id: { $in: productObjectIds }, is_deleted: { $ne: true } })
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

  async getBranch(branchId: string): Promise<GetBranchResponseDto> {
    if (!isValidObjectId(branchId)) {
      throw new BadRequestException('Invalid branchId');
    }
    try {
      const branch = await this.branchModel.findById(branchId).lean();
      if (!branch || branch.status !== BranchStatus.ACTIVE) {
        throw new NotFoundException('Branch not found or inactive');
      }
      return {
        branch: {
          id: branch._id?.toString() ?? branchId,
          name: branch.name,
          organization_id: branch.organization_id?.toString() ?? '',
          phone: branch.phone,
          email: branch.email,
          address_detail: branch.address_detail as unknown as Record<string, unknown>,
          operating_hours: branch.operating_hours as unknown as Record<string, unknown>[],
          status: branch.status,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      handleDbError(error, 'getting the branch');
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

  async listMenus(branchId: string): Promise<ListMenusResponseDto> {
    if (!isValidObjectId(branchId)) {
      throw new BadRequestException('Invalid branchId');
    }

    try {
      const branch = await this.branchModel.findById(branchId).lean();
      if (!branch || branch.status !== BranchStatus.ACTIVE) {
        throw new NotFoundException('Branch not found or inactive');
      }

      const menus = await this.menuModel
        .find({
          branch_id: branchId,
          status: MenuStatus.ACTIVE,
          isActive: true,
        })
        .sort({ name: 1 })
        .lean();

      const items: CustomerMenuListItemDto[] = menus.map((m) => ({
        id: m._id?.toString() ?? '',
        name: m.name,
        type: m.type,
        description: m.description,
        schedule: m.schedule ?? [],
        is_currently_active: isMenuActiveAt(m.schedule),
      }));

      return { menus: items };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      handleDbError(error, 'listing branch menus');
      throw error;
    }
  }

  async listCategoriesForMenu(
    branchId: string,
    menuId: string,
  ): Promise<ListCategoriesResponseDto> {
    if (!isValidObjectId(branchId)) {
      throw new BadRequestException('Invalid branchId');
    }
    if (!isValidObjectId(menuId)) {
      throw new BadRequestException('Invalid menuId');
    }

    try {
      const branch = await this.branchModel.findById(branchId).lean();
      if (!branch || branch.status !== BranchStatus.ACTIVE) {
        throw new NotFoundException('Branch not found or inactive');
      }

      const menu = await this.menuModel.findById(menuId).lean();
      if (
        !menu ||
        menu.branch_id?.toString() !== branchId ||
        menu.status !== MenuStatus.ACTIVE ||
        !menu.isActive
      ) {
        throw new NotFoundException('Menu not found or inactive');
      }

      const menuItems = await this.menuItemModel
        .find({
          branch_id: branchId,
          menu_id: menuId,
          is_available: true,
        })
        .lean<RawMenuItem[]>();

      const countByCategory = new Map<string, number>();
      for (const item of menuItems) {
        const key = item.category_id?.toString();
        if (!key) continue;
        countByCategory.set(key, (countByCategory.get(key) ?? 0) + 1);
      }

      const categoryIds = Array.from(countByCategory.keys());
      const categoryObjectIds = categoryIds
        .filter((id) => isValidObjectId(id))
        .map((id) => new Types.ObjectId(id));

      const categories = categoryObjectIds.length
        ? await this.categoryModel
            .find({
              _id: { $in: categoryObjectIds },
              branch_id: branchId,
              isActive: true,
            })
            .sort({ name: 1 })
            .lean()
        : [];

      const result: CustomerCategoryListItemDto[] = categories.map((cat) => ({
        id: cat._id?.toString() ?? '',
        name: cat.name,
        icon: cat.icon,
        image_url: cat.image_url,
        item_count: countByCategory.get(cat._id?.toString() ?? '') ?? 0,
      }));

      return { categories: result };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      handleDbError(error, 'listing categories for menu');
      throw error;
    }
  }

  async listItemsForCategory(
    branchId: string,
    categoryId: string,
    menuId: string,
  ): Promise<ListItemsResponseDto> {
    if (!menuId) {
      throw new BadRequestException('menuId query param is required');
    }
    if (!isValidObjectId(branchId)) {
      throw new BadRequestException('Invalid branchId');
    }
    if (!isValidObjectId(categoryId)) {
      throw new BadRequestException('Invalid categoryId');
    }
    if (!isValidObjectId(menuId)) {
      throw new BadRequestException('Invalid menuId');
    }

    try {
      const branch = await this.branchModel.findById(branchId).lean();
      if (!branch || branch.status !== BranchStatus.ACTIVE) {
        throw new NotFoundException('Branch not found or inactive');
      }

      const category = await this.categoryModel.findById(categoryId).lean();
      if (
        !category ||
        category.branch_id?.toString() !== branchId ||
        !category.isActive
      ) {
        throw new NotFoundException('Category not found or inactive');
      }

      const menu = await this.menuModel.findById(menuId).lean();
      if (
        !menu ||
        menu.branch_id?.toString() !== branchId ||
        menu.status !== MenuStatus.ACTIVE ||
        !menu.isActive
      ) {
        throw new NotFoundException('Menu not found or inactive');
      }

      const menuItems = await this.menuItemModel
        .find({
          branch_id: branchId,
          menu_id: menuId,
          category_id: categoryId,
          is_available: true,
        })
        .sort({ sort_order: 1 })
        .lean<RawMenuItem[]>();

      const items = await this.enrichMenuItems(menuItems);
      return { items };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      handleDbError(error, 'listing items for category');
      throw error;
    }
  }

  async searchItems(
    branchId: string,
    dto: SearchItemsQueryDto,
  ): Promise<ListItemsResponseDto> {
    if (!isValidObjectId(branchId)) {
      throw new BadRequestException('Invalid branchId');
    }
    if (!isValidObjectId(dto.menuId)) {
      throw new BadRequestException('Invalid menuId');
    }

    try {
      const branch = await this.branchModel.findById(branchId).lean();
      if (!branch || branch.status !== BranchStatus.ACTIVE) {
        throw new NotFoundException('Branch not found or inactive');
      }

      const menu = await this.menuModel.findById(dto.menuId).lean();
      if (
        !menu ||
        menu.branch_id?.toString() !== branchId ||
        menu.status !== MenuStatus.ACTIVE ||
        !menu.isActive
      ) {
        throw new NotFoundException('Menu not found or inactive');
      }

      const menuItems = await this.menuItemModel
        .find({
          branch_id: branchId,
          menu_id: dto.menuId,
          is_available: true,
        })
        .sort({ sort_order: 1 })
        .lean<RawMenuItem[]>();

      let items = await this.enrichMenuItems(menuItems);

      // ── In-memory filtering (searchable fields span Product + MenuItem) ──
      const csv = (v?: string) =>
        (v ?? '')
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);

      if (dto.query?.trim()) {
        const re = new RegExp(escapeRegex(dto.query.trim()), 'i');
        items = items.filter(
          (it) => re.test(it.name) || re.test(it.description ?? ''),
        );
      }
      const types = csv(dto.type);
      if (types.length) {
        items = items.filter((it) => types.includes((it.type ?? '').toLowerCase()));
      }
      const spice = csv(dto.spice_level);
      if (spice.length) {
        items = items.filter((it) =>
          spice.includes((it.spice_level ?? '').toLowerCase()),
        );
      }
      const tags = csv(dto.tags);
      if (tags.length) {
        items = items.filter((it) =>
          (it.tags ?? []).some((t) => tags.includes(t.toLowerCase())),
        );
      }
      if (dto.featured) {
        items = items.filter((it) => it.is_featured);
      }
      const effectivePrice = (it: CustomerMenuItemDto) =>
        it.discount_price ?? it.selling_price;
      if (Number.isFinite(dto.price_min)) {
        items = items.filter((it) => effectivePrice(it) >= dto.price_min!);
      }
      if (Number.isFinite(dto.price_max)) {
        items = items.filter((it) => effectivePrice(it) <= dto.price_max!);
      }

      // ── Sorting ──
      if (dto.sort_by) {
        const dir = dto.sort_order === 'desc' ? -1 : 1;
        items = [...items].sort((a, b) => {
          switch (dto.sort_by) {
            case 'price':
              return (effectivePrice(a) - effectivePrice(b)) * dir;
            case 'name':
              return a.name.localeCompare(b.name) * dir;
            case 'featured':
              return (Number(a.is_featured) - Number(b.is_featured)) * dir;
            default:
              return 0;
          }
        });
      }

      return { items };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      handleDbError(error, 'searching items');
      throw error;
    }
  }

  /**
   * Merge a set of raw menu_items with their parent Product data into the
   * customer-facing item shape. Drops items whose product is missing/deleted.
   */
  private async enrichMenuItems(
    menuItems: RawMenuItem[],
  ): Promise<CustomerMenuItemDto[]> {
    const productIds = Array.from(new Set(menuItems.map((m) => m.product_id)));
    const productObjectIds = productIds
      .filter((id) => isValidObjectId(id))
      .map((id) => new Types.ObjectId(id));

    const products = productObjectIds.length
      ? await this.productModel
          .find({ _id: { $in: productObjectIds }, is_deleted: { $ne: true } })
          .lean()
      : [];
    const productById = new Map(products.map((p) => [p._id?.toString(), p]));

    const items: CustomerMenuItemDto[] = [];
    for (const item of menuItems) {
      const product = productById.get(item.product_id?.toString());
      if (!product) continue;

      items.push({
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
      });
    }
    return items;
  }
}
