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

    return !!auth.connected_user.roles?.some((role) =>
        role.permissions?.some((p) => p.name === permission)
    );
}
