export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.directive('role', {
        mounted(el, binding) {
            const hasRole = evaluateRole(binding.value);

            if (!hasRole) {
                el.parentNode && el.parentNode.removeChild(el);
            }
        },
        updated(el, binding) {
            const hasRole = evaluateRole(binding.value);

            if (!hasRole) {
                el.parentNode && el.parentNode.removeChild(el);
            } else if (!el.parentNode) {
                const childNode = el.__vOriginalCommentNode__;

                childNode && childNode.parentNode.insertBefore(el, childNode);
            }
        },
        beforeUnmount(el) {
            el.__vOriginalCommentNode__ = document.createComment("v-role removed");

            el.parentNode && el.parentNode.replaceChild(el.__vOriginalCommentNode__, el);
        },
    });

    return {
        provide: {
            roleChecker: (role: string | string[]): boolean => evaluateRole(role),
        },
    };

    function evaluateRole(value: string | string[]): boolean {
        if (Array.isArray(value)) {
            return value.some((role) => useHasRole(role));
        }

        if (typeof value === 'string' && value.startsWith('!')) {
            const negatedRole = value.slice(1);

            return !useHasRole(negatedRole);
        }

        return useHasRole(value);
    }
});