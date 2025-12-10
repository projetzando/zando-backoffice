export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.directive('permission', {
        mounted(el, binding) {
            const hasPermission = evaluatePermission(binding.value);

            if (!hasPermission) {
                el.parentNode && el.parentNode.removeChild(el);
            }
        },
        updated(el, binding) {
            const hasPermission = evaluatePermission(binding.value);

            if (!hasPermission) {
                el.parentNode && el.parentNode.removeChild(el);
            } else if (!el.parentNode) {
                const childNode = el.__vOriginalCommentNode__;

                childNode && childNode.parentNode.insertBefore(el, childNode);
            }
        },
        beforeUnmount(el) {
            el.__vOriginalCommentNode__ = document.createComment("v-permission removed");

            el.parentNode && el.parentNode.replaceChild(el.__vOriginalCommentNode__, el);
        },
    });

    return {
        provide: {
            permissionChecker: (permission: string | string[]): boolean => evaluatePermission(permission),
        },
    };

    function evaluatePermission(value: string | string[]): boolean {
        if (!value) {
            return true;
        }

        if (Array.isArray(value)) {
            return value.some((permission) => useHasPermission(permission));
        }

        if (typeof value === 'string' && value.startsWith('!')) {
            const negatedPermission = value.slice(1);

            return !useHasPermission(negatedPermission);
        }

        return useHasPermission(value);
    }
});

function useHasPermission(permission: string): boolean {
    const auth = useAuthStore();

    // Si pas de permission spécifiée, on autorise
    if (!permission) {
        return true;
    }

    // Récupérer le rôle de l'utilisateur connecté
    const userRole = auth.connected_user?.role;

    if (!userRole) {
        return false;
    }

    // Si la permission contient plusieurs rôles séparés par des virgules
    // Exemple: "seller,admin,superadmin"
    if (permission.includes(',')) {
        const allowedRoles = permission.split(',').map(r => r.trim());
        return allowedRoles.includes(userRole);
    }

    // Vérification simple du rôle
    return userRole === permission;
}
