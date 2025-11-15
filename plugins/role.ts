/**
 * Plugin Nuxt pour la gestion des rôles utilisateurs
 * Compatible avec Supabase Authentication
 *
 * Rôles disponibles: buyer, seller, admin, superadmin
 * Backoffice accessible uniquement à: seller, admin, superadmin
 *
 * @usage
 * // Dans un template - afficher uniquement pour admin
 * <div v-role="'admin'">Contenu admin uniquement</div>
 *
 * // Afficher pour plusieurs rôles (OU logique)
 * <div v-role="['admin', 'superadmin']">Contenu admin ou superadmin</div>
 *
 * // Masquer pour un rôle (négation)
 * <div v-role="'!buyer'">Caché pour les buyers</div>
 *
 * // Dans le code JavaScript
 * const { $roleChecker } = useNuxtApp()
 * if ($roleChecker('admin')) { ... }
 */
export default defineNuxtPlugin((nuxtApp) => {
    /**
     * Directive v-role pour conditionner l'affichage selon les rôles
     */
    nuxtApp.vueApp.directive('role', {
        mounted(el, binding) {
            const hasRole = evaluateRole(binding.value);

            if (!hasRole) {
                // L'utilisateur n'a pas le rôle requis, on retire l'élément
                el.parentNode && el.parentNode.removeChild(el);
            }
        },
        updated(el, binding) {
            const hasRole = evaluateRole(binding.value);

            if (!hasRole) {
                // L'utilisateur n'a plus le rôle, on retire l'élément
                el.parentNode && el.parentNode.removeChild(el);
            } else if (!el.parentNode) {
                // L'utilisateur a maintenant le rôle, on réinsère l'élément
                const childNode = el.__vOriginalCommentNode__;
                childNode && childNode.parentNode.insertBefore(el, childNode);
            }
        },
        beforeUnmount(el) {
            // Créer un commentaire pour marquer l'emplacement
            el.__vOriginalCommentNode__ = document.createComment("v-role removed");
            el.parentNode && el.parentNode.replaceChild(el.__vOriginalCommentNode__, el);
        },
    });

    /**
     * Évaluation des conditions de rôle
     * Supporte les rôles multiples et la négation
     */
    function evaluateRole(value: string | string[]): boolean {
        // Cas 1: Tableau de rôles (OU logique)
        // Exemple: ['admin', 'superadmin'] -> true si l'utilisateur a admin OU superadmin
        if (Array.isArray(value)) {
            return value.some((role) => useHasRole(role));
        }

        // Cas 2: Négation (commence par '!')
        // Exemple: '!buyer' -> true si l'utilisateur n'est PAS buyer
        if (typeof value === 'string' && value.startsWith('!')) {
            const negatedRole = value.slice(1);
            return !useHasRole(negatedRole);
        }

        // Cas 3: Rôle simple
        // Exemple: 'admin' -> true si l'utilisateur est admin
        return useHasRole(value);
    }

    /**
     * Fonction helper injectée globalement
     * Accessible via useNuxtApp().$roleChecker
     */
    return {
        provide: {
            roleChecker: (role: string | string[]): boolean => evaluateRole(role),
            canAccessBackoffice: (): boolean => useCanAccessBackoffice(),
        },
    };
});
