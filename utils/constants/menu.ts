export interface sidebarLink {
    title: string,
    route_link: string,
    target?: string
    permission?: string
}

export const orderLinks = ref<sidebarLink[]>([
    {
        title: 'Toutes les commandes',
        route_link: '/dashboard/orders'
    },
])

export const productLinks = ref<sidebarLink[]>([
    {
        title: 'Tous les produits',
        route_link: '/dashboard/products',
    },
])

// Nouveaux liens pour les fonctionnalités ajoutées
export const communicationLinks = ref<sidebarLink[]>([
    {
        title: 'Conversations',
        route_link: '/dashboard/conversations',
    },
    {
        title: 'Avis clients',
        route_link: '/dashboard/reviews',
    },
])

export const testLinks = ref<sidebarLink[]>([
    {
        title: 'Test des vues',
        route_link: '/dashboard/test-views',
    },
])

export const userLinks = ref<sidebarLink[]>([
    {
        title: 'Tous les clients',
        route_link: '/dashboard/accounts/customers',
    },
    {
        title: 'Tous les vendeurs',
        route_link: '/dashboard/accounts/sellers',
    },
])

export const paymentLinks = ref<sidebarLink[]>([
    {
        title: 'Paiements en attente',
        route_link: '/dashboard/payments',
    },
    {
        title: 'Paiements validés',
        route_link: '/dashboard/payments',
    },
])

export const localisationLinks = ref<sidebarLink[]>([
    {
        title: 'Catégories',
        route_link: '/dashboard/configurations/categories',
    },
])

export const editionLinks = ref<sidebarLink[]>([
    {
        title: 'Liste',
        route_link: '/dashboard/edition',
    },
])

export const adminLinks = ref<sidebarLink[]>([
    {
        title: 'Permissions',
        route_link: '/dashboard/admin/permissions',
    },
    {
        title: 'Rôles',
        route_link: '/dashboard/admin/roles',
    },
])
