/**
 * Clés de stockage localStorage/cookies
 */
export enum StorageKey {
  AUTH_TOKEN = 'auth_token',
  USER_PROFILE = 'user_profile',
  THEME = 'theme',
  LANGUAGE = 'language',
}

/**
 * Clés des stores Pinia
 */
export enum StoreKey {
  AUTH = 'auth',
  APP = 'app',
  PRODUCT = 'product',
  ORDER = 'order',
  CATEGORY = 'category',
  PAYMENT = 'payment',
  SELLER = 'seller',
  ADMIN = 'admin',
  WALLET = 'wallet',
  PAYOUT = 'payout',
  CUSTOMER = 'customer',
  REVIEW = 'review',
  ALERT = 'alert',
  CONVERSATION = 'conversation',
  FAVORITE = 'favorite',
  CART = 'cart',
  ADDRESS = 'address',
  BANNED_TERM = 'banned-term',
  DELIVERY_ZONE = 'delivery-zone',
  AREA = 'area',
  CITY = 'city',
  ENUM = 'enum',
  SELLER_DOMAIN = 'seller-domain',
}
