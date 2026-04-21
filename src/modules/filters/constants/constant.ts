export enum FilterType {
  SINGLE = 'single',
  MULTI = 'multi',
  RANGE = 'range',
}

/**
 * Where a filter reads its value from on the menu item / product.
 *  - TYPE        → menu_items.type (veg / non-veg / vegan)
 *  - SPICE_LEVEL → menu_items.spice_level
 *  - TAG         → menu_items.tags (array membership)
 *  - FEATURED    → menu_items.is_featured (boolean)
 *  - PRICE       → menu_items.selling_price / discount_price (numeric range)
 */
export enum FilterSource {
  TYPE = 'type',
  SPICE_LEVEL = 'spice_level',
  TAG = 'tag',
  FEATURED = 'featured',
  PRICE = 'price',
}

export enum SortField {
  PRICE = 'price',
  NAME = 'name',
  FEATURED = 'featured',
  CREATED_AT = 'created_at',
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}
