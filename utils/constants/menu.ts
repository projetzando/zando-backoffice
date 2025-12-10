export interface sidebarLink {
  title: string;
  route_link: string;
  target?: string;
  permission?: string;
}

export const orderLinks = ref<sidebarLink[]>([
  {
    title: "Toutes les commandes",
    route_link: "/dashboard/orders",
  },
]);

export const productLinks = ref<sidebarLink[]>([
  {
    title: "Tous les produits",
    route_link: "/dashboard/products",
  },
]);

// Liens pour les conversations et messagerie
export const conversationLinks = ref<sidebarLink[]>([
  {
    title: "Toutes les conversations",
    route_link: "/dashboard/conversations",
  },
  {
    title: "Avis clients",
    route_link: "/dashboard/reviews",
  },
]);

export const testLinks = ref<sidebarLink[]>([
  {
    title: "Test des vues",
    route_link: "/dashboard/test-views",
  },
]);

export const userLinks = ref<sidebarLink[]>([
  {
    title: "Acheteurs",
    route_link: "/dashboard/accounts/customers",
    permission: "seller,admin,superadmin", // Accessible par seller, admin, superadmin
  },
  {
    title: "Vendeurs",
    route_link: "/dashboard/accounts/sellers",
    permission: "admin,superadmin", // Accessible uniquement par admin et superadmin
  },
  {
    title: "Administrateurs",
    route_link: "/dashboard/accounts/admins",
    permission: "superadmin", // Accessible uniquement par superadmin
  },
]);

export const paymentLinks = ref<sidebarLink[]>([
  {
    title: "Paiements en attente",
    route_link: "/dashboard/payments",
    permission: "admin,superadmin", // Accessible uniquement par admin et superadmin
  },
  {
    title: "Paiements validés",
    route_link: "/dashboard/payments",
    permission: "admin,superadmin", // Accessible uniquement par admin et superadmin
  },
]);

export const localisationLinks = ref<sidebarLink[]>([
  {
    title: "Catégories",
    route_link: "/dashboard/configurations/categories",
    permission: "admin,superadmin", // Accessible uniquement par admin et superadmin
  },
  {
    title: "Livraison",
    route_link: "/dashboard/configurations/delivery",
    permission: "admin,superadmin", // Accessible uniquement par admin et superadmin
  },
]);

export const editionLinks = ref<sidebarLink[]>([
  {
    title: "Liste",
    route_link: "/dashboard/edition",
    permission: "admin,superadmin", // Accessible uniquement par admin et superadmin
  },
]);

export const adminLinks = ref<sidebarLink[]>([
  {
    title: "Permissions",
    route_link: "/dashboard/admin/permissions",
    permission: "superadmin", // Accessible uniquement par superadmin
  },
  {
    title: "Rôles",
    route_link: "/dashboard/admin/roles",
    permission: "superadmin", // Accessible uniquement par superadmin
  },
]);
