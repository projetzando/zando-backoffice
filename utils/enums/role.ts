export enum RoleEnum {
    Buyer = 'buyer',
    Seller = 'seller',
    Admin = 'admin',
    SuperAdmin = 'superadmin'
}

// Rôles autorisés à accéder au backoffice
export const ALLOWED_ROLES = [
    RoleEnum.Seller,
    RoleEnum.Admin,
    RoleEnum.SuperAdmin
] as const

// Type pour les rôles autorisés
export type AllowedRole = typeof ALLOWED_ROLES[number]