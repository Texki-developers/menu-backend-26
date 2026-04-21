import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model, isValidObjectId } from 'mongoose';
import { Branch } from '../../branches/schema/branches.schema';
import { BranchStatus } from '../../branches/constants/constant';
import { MenuItem } from '../../menu-items/schemas/menu-item.schema';
import { Product } from '../../products/schemas/product.schema';
import { handleDbError } from '../../../common/utils';
import { Cart, CartItem } from '../schemas/cart.schema';
import { CART_TTL_SECONDS, CartStatus } from '../constants/constant';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import {
  CartItemLineDto,
  CartResponseDto,
  CartTotalsDto,
} from '../dto/cart-response.dto';

interface CartOwner {
  cart_token: string;
  user_id?: string;
}

/**
 * Price is never persisted on the cart. It is resolved from menu_items on
 * every read so the customer always sees the current price. Orders, by
 * contrast, freeze the price at checkout time.
 */
@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
    @InjectModel(Branch.name) private readonly branchModel: Model<Branch>,
    @InjectModel(MenuItem.name) private readonly menuItemModel: Model<MenuItem>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  // ───────────────────────────── Queries ────────────────────────────────

  async getCart(branchId: string, owner: CartOwner): Promise<CartResponseDto> {
    const cart = await this.loadActiveCart(branchId, owner);
    if (!cart) {
      const branch = await this.getActiveBranch(branchId);
      return this.emptyCartResponse(
        owner.cart_token,
        branchId,
        branch.organization_id?.toString() ?? '',
        owner.user_id,
      );
    }
    return this.buildCartResponse(cart);
  }

  // ─────────────────────────── Mutations ────────────────────────────────

  async addItem(
    branchId: string,
    owner: CartOwner,
    dto: AddCartItemDto,
  ): Promise<CartResponseDto> {
    const branch = await this.getActiveBranch(branchId);
    const menuItem = await this.getMenuItemOrFail(dto.menu_item_id, branchId);
    this.validateSelection(menuItem, dto.variant_uuid, dto.extra_uuids ?? [], dto.quantity);

    try {
      const cart = await this.getOrCreateCart(branchId, owner, branch.organization_id?.toString() ?? '');

      // Idempotency: same cart_item_id means retry → no-op.
      const alreadyExists = cart.items.some((i) => i.cart_item_id === dto.cart_item_id);
      if (alreadyExists) {
        return this.buildCartResponse(cart);
      }

      // Signature-level dedup: if the exact same item+variant+extras is
      // already in the cart under a different cart_item_id, merge quantities
      // instead of creating a duplicate line.
      const sig = this.signatureOf(
        dto.menu_item_id,
        dto.variant_uuid,
        dto.extra_uuids ?? [],
      );
      const existing = cart.items.find(
        (i) => this.signatureOf(i.menu_item_id, i.variant_uuid, i.extra_uuids) === sig,
      );

      if (existing) {
        const cap = menuItem.max_quantity ?? 99;
        existing.quantity = Math.min(existing.quantity + dto.quantity, cap);
        if (dto.note !== undefined) existing.note = dto.note;
      } else {
        cart.items.push({
          cart_item_id: dto.cart_item_id,
          menu_item_id: dto.menu_item_id,
          variant_uuid: dto.variant_uuid,
          extra_uuids: dto.extra_uuids ?? [],
          quantity: dto.quantity,
          note: dto.note,
        } as CartItem);
      }

      cart.expires_at = this.newExpiry();
      await cart.save();
      return this.buildCartResponse(cart);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      handleDbError(error, 'adding item to cart');
      throw error;
    }
  }

  private signatureOf(menuItemId: string, variantUuid?: string, extraUuids: string[] = []): string {
    return `${menuItemId}|${variantUuid ?? ''}|${[...extraUuids].sort().join(',')}`;
  }

  async updateItem(
    branchId: string,
    owner: CartOwner,
    cartItemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const cart = await this.loadActiveCartOrFail(branchId, owner);
    const idx = cart.items.findIndex((i) => i.cart_item_id === cartItemId);
    if (idx < 0) throw new NotFoundException('Cart item not found');

    const existing = cart.items[idx];
    const menuItem = await this.getMenuItemOrFail(existing.menu_item_id, branchId);

    const nextVariant = dto.variant_uuid ?? existing.variant_uuid;
    const nextExtras = dto.extra_uuids ?? existing.extra_uuids;
    const nextQty = dto.quantity ?? existing.quantity;
    this.validateSelection(menuItem, nextVariant, nextExtras, nextQty);

    existing.variant_uuid = nextVariant;
    existing.extra_uuids = nextExtras;
    existing.quantity = nextQty;
    if (dto.note !== undefined) existing.note = dto.note;

    cart.expires_at = this.newExpiry();
    await cart.save();
    return this.buildCartResponse(cart);
  }

  async removeItem(
    branchId: string,
    owner: CartOwner,
    cartItemId: string,
  ): Promise<CartResponseDto> {
    const cart = await this.loadActiveCartOrFail(branchId, owner);
    const idx = cart.items.findIndex((i) => i.cart_item_id === cartItemId);
    if (idx < 0) throw new NotFoundException('Cart item not found');
    cart.items.splice(idx, 1);
    cart.expires_at = this.newExpiry();
    await cart.save();
    return this.buildCartResponse(cart);
  }

  async clearCart(branchId: string, owner: CartOwner): Promise<void> {
    await this.cartModel.deleteOne({
      branch_id: branchId,
      status: CartStatus.ACTIVE,
      ...this.ownerFilter(owner),
    });
  }

  /**
   * Moves the guest cart's items into the authenticated user's cart (same
   * branch). Dedupes by the (menu_item_id, variant_uuid, sorted extras)
   * signature so identical selections collapse and their quantities sum.
   */
  async mergeGuestCart(
    branchId: string,
    userId: string,
    userCartToken: string,
    guestCartToken: string,
  ): Promise<CartResponseDto> {
    if (!userId) throw new BadRequestException('userId is required');
    if (guestCartToken === userCartToken) {
      // Nothing to merge — same token.
      return this.getCart(branchId, { cart_token: userCartToken, user_id: userId });
    }

    const guestCart = await this.cartModel.findOne({
      cart_token: guestCartToken,
      branch_id: branchId,
      status: CartStatus.ACTIVE,
    });
    if (!guestCart || guestCart.items.length === 0) {
      return this.getCart(branchId, { cart_token: userCartToken, user_id: userId });
    }

    const branch = await this.getActiveBranch(branchId);
    const userCart = await this.getOrCreateCart(
      branchId,
      { cart_token: userCartToken, user_id: userId },
      branch.organization_id?.toString() ?? '',
    );

    const bySig = new Map<string, CartItem>();
    for (const item of userCart.items) {
      bySig.set(this.signatureOf(item.menu_item_id, item.variant_uuid, item.extra_uuids), item);
    }

    for (const guestItem of guestCart.items) {
      const sig = this.signatureOf(guestItem.menu_item_id, guestItem.variant_uuid, guestItem.extra_uuids);
      const match = bySig.get(sig);
      if (match) {
        match.quantity = Math.min(match.quantity + guestItem.quantity, 99);
      } else {
        userCart.items.push({
          cart_item_id: randomUUID(),
          menu_item_id: guestItem.menu_item_id,
          variant_uuid: guestItem.variant_uuid,
          extra_uuids: [...(guestItem.extra_uuids ?? [])],
          quantity: guestItem.quantity,
          note: guestItem.note,
        } as CartItem);
        bySig.set(sig, userCart.items[userCart.items.length - 1]);
      }
    }

    userCart.expires_at = this.newExpiry();
    await userCart.save();

    guestCart.status = CartStatus.CHECKED_OUT;
    guestCart.items = [];
    await guestCart.save();

    return this.buildCartResponse(userCart);
  }

  // ─────────────────────────── Internals ────────────────────────────────

  private async loadActiveCart(branchId: string, owner: CartOwner): Promise<Cart | null> {
    return this.cartModel.findOne({
      branch_id: branchId,
      status: CartStatus.ACTIVE,
      ...this.ownerFilter(owner),
    });
  }

  private async loadActiveCartOrFail(branchId: string, owner: CartOwner): Promise<Cart> {
    const cart = await this.loadActiveCart(branchId, owner);
    if (!cart) throw new NotFoundException('Cart not found');
    return cart;
  }

  private async getOrCreateCart(
    branchId: string,
    owner: CartOwner,
    organizationId: string,
  ): Promise<Cart> {
    const existing = await this.loadActiveCart(branchId, owner);
    if (existing) {
      // Upgrade guest → authenticated in place.
      if (owner.user_id && !existing.user_id) {
        existing.user_id = owner.user_id;
      }
      return existing;
    }
    return this.cartModel.create({
      cart_token: owner.cart_token,
      user_id: owner.user_id,
      branch_id: branchId,
      organization_id: organizationId,
      items: [],
      status: CartStatus.ACTIVE,
      expires_at: this.newExpiry(),
    });
  }

  private ownerFilter(owner: CartOwner) {
    // Prefer user_id when set — lets the same user reach their cart across devices.
    if (owner.user_id) return { user_id: owner.user_id };
    return { cart_token: owner.cart_token };
  }

  private newExpiry(): Date {
    return new Date(Date.now() + CART_TTL_SECONDS * 1000);
  }

  private async getActiveBranch(branchId: string): Promise<Branch> {
    if (!isValidObjectId(branchId)) {
      throw new BadRequestException('Invalid branchId');
    }
    const branch = await this.branchModel.findById(branchId).lean();
    if (!branch || branch.status !== BranchStatus.ACTIVE) {
      throw new NotFoundException('Branch not found or inactive');
    }
    return branch as Branch;
  }

  private async getMenuItemOrFail(menuItemId: string, branchId: string): Promise<MenuItem> {
    if (!isValidObjectId(menuItemId)) {
      throw new BadRequestException('Invalid menu_item_id');
    }
    const item = await this.menuItemModel
      .findOne({ _id: menuItemId, branch_id: branchId })
      .lean<MenuItem>();
    if (!item) throw new NotFoundException('Menu item not available at this branch');
    return item;
  }

  private validateSelection(
    menuItem: MenuItem,
    variantUuid: string | undefined,
    extraUuids: string[],
    quantity: number,
  ): void {
    if (!menuItem.is_available) {
      throw new BadRequestException('Item is not available');
    }

    if (menuItem.variants?.length) {
      if (!variantUuid) {
        throw new BadRequestException('Please select a size/variant');
      }
      const variant = menuItem.variants.find((v) => v.variant_uuid === variantUuid);
      if (!variant) throw new BadRequestException('Selected variant does not exist');
      if (!variant.is_available) throw new BadRequestException('Selected variant is unavailable');
    } else if (variantUuid) {
      throw new BadRequestException('This item has no variants');
    }

    if (extraUuids.length) {
      const validExtraUuids = new Set((menuItem.extras ?? []).map((e) => e.extra_uuid));
      for (const uuid of extraUuids) {
        if (!validExtraUuids.has(uuid)) {
          throw new BadRequestException(`Invalid extra: ${uuid}`);
        }
        const extra = menuItem.extras.find((e) => e.extra_uuid === uuid);
        if (!extra?.is_available) {
          throw new BadRequestException(`Extra unavailable: ${extra?.label ?? uuid}`);
        }
      }
      if (menuItem.max_extras != null && extraUuids.length > menuItem.max_extras) {
        throw new BadRequestException(`At most ${menuItem.max_extras} extras allowed`);
      }
    }

    if (menuItem.max_quantity != null && quantity > menuItem.max_quantity) {
      throw new BadRequestException(`Max ${menuItem.max_quantity} per order`);
    }
  }

  private async buildCartResponse(cart: Cart): Promise<CartResponseDto> {
    if (cart.items.length === 0) {
      return this.emptyCartResponse(cart.cart_token, cart.branch_id, cart.organization_id, cart.user_id);
    }

    const menuItemIds = Array.from(new Set(cart.items.map((i) => i.menu_item_id)));
    const menuItems = await this.menuItemModel
      .find({ _id: { $in: menuItemIds }, branch_id: cart.branch_id })
      .lean<MenuItem[]>();
    const menuItemById = new Map(menuItems.map((m: any) => [m._id.toString(), m]));

    const productIds = Array.from(new Set(menuItems.map((m) => m.product_id)));
    const products = await this.productModel
      .find({ _id: { $in: productIds } })
      .lean();
    const productById = new Map(products.map((p: any) => [p._id?.toString(), p]));

    const lines: CartItemLineDto[] = cart.items.map((item) =>
      this.toLine(item, menuItemById.get(item.menu_item_id), productById),
    );

    const totals = this.computeTotals(lines);

    return {
      cart_token: cart.cart_token,
      user_id: cart.user_id,
      branch_id: cart.branch_id,
      organization_id: cart.organization_id,
      items: lines,
      totals,
      status: cart.status,
      expires_at: cart.expires_at,
    };
  }

  private toLine(
    item: CartItem,
    menuItem: MenuItem | undefined,
    productById: Map<string, any>,
  ): CartItemLineDto {
    if (!menuItem) {
      return {
        cart_item_id: item.cart_item_id,
        menu_item_id: item.menu_item_id,
        name: 'Unavailable item',
        extras: [],
        unit_price: 0,
        quantity: item.quantity,
        line_total: 0,
        note: item.note,
        is_available: false,
        unavailable_reason: 'Item no longer on the menu',
      };
    }

    const product = productById.get(menuItem.product_id?.toString());
    const media = (menuItem.media?.length ? menuItem.media : product?.media) ?? [];
    const primary = media.find((m: any) => m.is_primary) ?? media[0];

    let unavailable: string | undefined;
    if (!menuItem.is_available) unavailable = 'Item currently unavailable';

    let variantLabel: string | undefined;
    let variantPrice: number | undefined;
    if (menuItem.variants?.length) {
      const v = menuItem.variants.find((x) => x.variant_uuid === item.variant_uuid);
      if (!v) unavailable ??= 'Selected size no longer offered';
      else if (!v.is_available) unavailable ??= 'Selected size unavailable';
      else {
        variantLabel = v.label;
        variantPrice = v.price;
      }
    }

    const selectedExtras: { extra_uuid: string; label: string; price: number }[] = [];
    for (const uuid of item.extra_uuids ?? []) {
      const extra = menuItem.extras?.find((e) => e.extra_uuid === uuid);
      if (!extra) {
        unavailable ??= 'An extra is no longer offered';
        continue;
      }
      if (!extra.is_available) {
        unavailable ??= `Extra unavailable: ${extra.label}`;
        continue;
      }
      selectedExtras.push({ extra_uuid: extra.extra_uuid, label: extra.label, price: extra.price });
    }

    const basePrice =
      variantPrice ??
      (menuItem.discount_price != null ? menuItem.discount_price : menuItem.selling_price);
    const extrasTotal = selectedExtras.reduce((s, e) => s + e.price, 0);
    const unitPrice = basePrice + extrasTotal;

    return {
      cart_item_id: item.cart_item_id,
      menu_item_id: item.menu_item_id,
      name: product?.name ?? 'Item',
      slug: product?.slug,
      image: primary ? { url: primary.url, alt_text: primary.alt_text } : undefined,
      variant_uuid: item.variant_uuid,
      variant_label: variantLabel,
      extras: selectedExtras,
      unit_price: unitPrice,
      quantity: item.quantity,
      line_total: unitPrice * item.quantity,
      note: item.note,
      is_available: !unavailable,
      unavailable_reason: unavailable,
    };
  }

  private computeTotals(lines: CartItemLineDto[]): CartTotalsDto {
    const available = lines.filter((l) => l.is_available);
    const subtotal = available.reduce((s, l) => s + l.line_total, 0);
    const totalQuantity = available.reduce((s, l) => s + l.quantity, 0);
    return {
      subtotal,
      item_count: available.length,
      total_quantity: totalQuantity,
    };
  }

  private emptyCartResponse(
    cartToken: string,
    branchId: string,
    organizationId: string,
    userId?: string,
  ): CartResponseDto {
    return {
      cart_token: cartToken,
      user_id: userId,
      branch_id: branchId,
      organization_id: organizationId,
      items: [],
      totals: { subtotal: 0, item_count: 0, total_quantity: 0 },
      status: CartStatus.ACTIVE,
      expires_at: this.newExpiry(),
    };
  }
}
