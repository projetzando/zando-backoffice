export default defineAppConfig({
    ui: {
        input: {
            default: { size: 'lg' }
        },
        selectMenu: {
            default: { size: 'lg' }
        },
        skeleton: {
            background: 'bg-gray-200',
            rounded: 'rounded-lg'
        },
        select: {
            default: { size: 'lg' }
        },
        button: {
            default: { size: 'lg' },
            size: {
                '2xl': 'text-lg',
                '3xl': 'text-xl',
                '4xl': 'text-2xl',
                '5xl': 'text-3xl',
                '6xl': 'text-4xl'
            },
            gap: {
                '2xl': 'gap-x-3',
                '3xl': 'gap-x-3.5',
                '4xl': 'gap-x-4',
                '5xl': 'gap-x-4.5',
                '6xl': 'gap-x-5'
            },
            padding: {
                '2xl': 'px-4 py-3',
                '3xl': 'px-4.5 py-3.5',
                '4xl': 'px-5 py-4',
                '5xl': 'px-5.5 py-4.5',
                '6xl': 'px-6 py-5'
            },
            square: {
                '2xl': 'p-3',
                '3xl': 'p-3.5',
                '4xl': 'p-4',
                '5xl': 'p-4.5',
                '6xl': 'p-5'
            },
            icon: {
                size: {
                    '2xl': 'h-5 w-5',
                    '3xl': 'h-6 w-6',
                }
            },
        },
        pagination: {
            wrapper: 'flex items-center gap-x-2',
            rounded: '!rounded-full min-w-[32px] justify-center',
            default: {
                firstButton: {
                    icon: 'ic:outline-keyboard-double-arrow-left'
                },
                lastButton: {
                    icon: 'ic:outline-keyboard-double-arrow-right'
                },
            }
        },
        table: {
            thead: 'bg-gray-100 dark:bg-gray-800',
            default: {
                loadingState: {
                    icon: 'i-heroicons-arrow-path-20-solid',
                    label: 'Chargement des données......',
                },
                progress: {
                    color: 'primary',
                    animation: 'carousel',
                },
                emptyState: {
                    icon: 'i-heroicons-circle-stack-20-solid',
                    label: 'Aucun element trouvé.',
                },
            }
        },
        notification: {
            default: {
                timeout: 1500,
            },
        },
        notifications: {
            position: 'top-0 bottom-auto'
        },
        icons: {
            dynamic: true
        }
    },
})