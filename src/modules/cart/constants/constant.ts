export enum CartStatus {
  ACTIVE = 'active',
  CHECKED_OUT = 'checked_out',
  ABANDONED = 'abandoned',
}

/** Cart TTL in seconds (7 days). */
export const CART_TTL_SECONDS = 7 * 24 * 60 * 60;
