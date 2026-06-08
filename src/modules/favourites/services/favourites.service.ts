import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { Favourite } from '../schemas/favourite.schema';
import { MenuItem } from '../../menu-items/schemas/menu-item.schema';
import { Product } from '../../products/schemas/product.schema';
import { CustomerMenuItemDto } from '../../customer-menu/dto/get-branch-menu.dto';
import {
  FavouriteIdsResponseDto,
  FavouriteItemsResponseDto,
} from '../dto/favourite.dto';
import { handleDbError } from '../../../common/utils';

interface RawMenuItem {
  _id: Types.ObjectId | string;
  product_id: string;
  branch_id: string;
  organization_id: string;
  base_price: number;
  selling_price: number;
  discount_price?: number;
  is_available: boolean;
  is_featured: boolean;
  prep_time?: string;
  max_quantity?: number;
  media?: any[];
}

@Injectable()
export class FavouritesService {
  constructor(
    @InjectModel(Favourite.name)
    private readonly favouriteModel: Model<Favourite>,
    @InjectModel(MenuItem.name) private readonly menuItemModel: Model<MenuItem>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  async add(customerId: string, menuItemId: string): Promise<{ saved: true }> {
    if (!isValidObjectId(menuItemId)) {
      throw new BadRequestException('Invalid menu_item_id');
    }
    try {
      const menuItem = await this.menuItemModel
        .findById(menuItemId)
        .lean<RawMenuItem>();
      if (!menuItem) {
        throw new NotFoundException('Menu item not found');
      }

      await this.favouriteModel.updateOne(
        { customer_id: customerId, menu_item_id: menuItemId },
        {
          $setOnInsert: {
            customer_id: customerId,
            menu_item_id: menuItemId,
            organization_id: menuItem.organization_id,
            branch_id: menuItem.branch_id,
          },
        },
        { upsert: true },
      );

      return { saved: true };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      // Duplicate key from a race is fine — the favourite already exists
      if ((error as { code?: number })?.code === 11000) {
        return { saved: true };
      }
      handleDbError(error, 'adding the favourite');
      throw error;
    }
  }

  async remove(
    customerId: string,
    menuItemId: string,
  ): Promise<{ removed: true }> {
    try {
      await this.favouriteModel.deleteOne({
        customer_id: customerId,
        menu_item_id: menuItemId,
      });
      return { removed: true };
    } catch (error) {
      handleDbError(error, 'removing the favourite');
      throw error;
    }
  }

  async listIds(customerId: string): Promise<FavouriteIdsResponseDto> {
    try {
      const favourites = await this.favouriteModel
        .find({ customer_id: customerId })
        .sort({ created_at: -1 })
        .lean();
      return { menu_item_ids: favourites.map((f) => f.menu_item_id) };
    } catch (error) {
      handleDbError(error, 'listing favourite ids');
      throw error;
    }
  }

  async listEnriched(customerId: string): Promise<FavouriteItemsResponseDto> {
    try {
      const favourites = await this.favouriteModel
        .find({ customer_id: customerId })
        .sort({ created_at: -1 })
        .lean();

      const menuItemIds = favourites.map((f) => f.menu_item_id);
      const menuItemObjectIds = menuItemIds
        .filter((id) => isValidObjectId(id))
        .map((id) => new Types.ObjectId(id));
      if (menuItemObjectIds.length === 0) {
        return { items: [] };
      }

      const menuItems = await this.menuItemModel
        .find({ _id: { $in: menuItemObjectIds } })
        .lean<RawMenuItem[]>();
      const menuItemById = new Map(
        menuItems.map((m) => [m._id?.toString(), m]),
      );

      const productIds = Array.from(
        new Set(menuItems.map((m) => m.product_id)),
      );
      const productObjectIds = productIds
        .filter((id) => isValidObjectId(id))
        .map((id) => new Types.ObjectId(id));
      const products = await this.productModel
        .find({ _id: { $in: productObjectIds }, is_deleted: { $ne: true } })
        .lean();
      const productById = new Map(products.map((p) => [p._id?.toString(), p]));

      // Preserve favourite order (most-recent first); drop items whose
      // menu_item or product no longer exists.
      const items: CustomerMenuItemDto[] = [];
      for (const fav of favourites) {
        const item = menuItemById.get(fav.menu_item_id);
        if (!item) continue;
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

      return { items };
    } catch (error) {
      handleDbError(error, 'listing favourites');
      throw error;
    }
  }
}
