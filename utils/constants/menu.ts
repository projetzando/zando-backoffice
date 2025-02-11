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

export const userLinks = ref<sidebarLink[]>([
    {
        title: 'Tous les utilisateurs',
        route_link: '/dashboard/users',
    },
])

export const paymentLinks = ref<sidebarLink[]>([
    {
        title: 'Paiements en attente',
        route_link: '/dashboard/payments/pending',
    },
])

export const localisationLinks = ref<sidebarLink[]>([
    {
        title: 'Catégories',
        route_link: '/dashboard/configurations/categories',
    },
    {
        title: 'Devises',
        route_link: '/dashboard/configurations/currencies',
    },
])

export const settingsLinks = ref<sidebarLink[]>([
    {
        title: 'Années scolaires',
        route_link: '/dashboard/settings/school-years',
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
        title: 'Groupes',
        route_link: '/dashboard/admin/groups',
    },
])
