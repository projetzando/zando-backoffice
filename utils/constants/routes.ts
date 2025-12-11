/**
 * Routes principales de l'application
 */
export enum AppRoute {
  // Public
  LOGIN = '/',

  // Dashboard
  DASHBOARD = '/dashboard',
  NOT_AUTHORIZED = '/not-authorized',

  // Products
  PRODUCTS = '/dashboard/products',
  PRODUCT_SHOW = '/dashboard/products/show',

  // Orders
  ORDERS = '/dashboard/orders',
  ORDER_SHOW = '/dashboard/orders/show',

  // Accounts
  CUSTOMERS = '/dashboard/accounts/customers',
  SELLERS = '/dashboard/accounts/sellers',
  ADMINS = '/dashboard/accounts/admins',

  // Payments & Payouts
  PAYMENTS = '/dashboard/payments',
  PAYOUTS = '/dashboard/payouts',

  // Admin
  ADMIN_ROLES = '/dashboard/admin/roles',
  ADMIN_PERMISSIONS = '/dashboard/admin/permissions',

  // Configuration
  CONFIG_CATEGORIES = '/dashboard/configurations/categories',
  CONFIG_CITIES = '/dashboard/configurations/cities',
  CONFIG_DELIVERY = '/dashboard/configurations/delivery',
  CONFIG_FEES = '/dashboard/configurations/fees',
  CONFIG_BANNED_TERMS = '/dashboard/configurations/banned-terms',

  // Others
  ALERTS = '/dashboard/alerts',
  REVIEWS = '/dashboard/reviews',
  CONVERSATIONS = '/dashboard/conversations',
  PROFILE = '/dashboard/profile',
}

/**
 * Routes publiques (pas besoin d'authentification)
 */
export const PUBLIC_ROUTES = [AppRoute.LOGIN]

/**
 * Routes réservées aux admins
 */
export const ADMIN_ONLY_ROUTES = [AppRoute.PAYMENTS, AppRoute.PAYOUTS, AppRoute.SELLERS]

/**
 * Routes réservées aux superadmins
 */
export const SUPERADMIN_ONLY_ROUTES = [
  AppRoute.ADMIN_ROLES,
  AppRoute.ADMIN_PERMISSIONS,
  AppRoute.ADMINS,
]
