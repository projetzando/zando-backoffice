export default defineAppConfig({
    ui: {
        input: {
            defaultVariants : {
                size: 'lg' 
            }
        },
        selectMenu: {
            defaultVariants : {
                size: 'lg' 
            }
        },
        skeleton: {
            background: 'bg-gray-200',
            rounded: 'rounded-lg'
        },
        select: {
            defaultVariants : {
                size: 'lg' 
            }
        },
        button: {
            defaultVariants : {
                size: 'lg' 
            },
        },
        table: {
            slots : {
                thead: 'bg-gray-100 dark:bg-gray-800',  
            },
            defaultVariants : {
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
    },
})