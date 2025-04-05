export function useHandleErrors() {
    const toast = useToast();

    function handleSuccess(message: string) {
        toast.add({
            title: message,
            icon: "i-heroicons-check-badge",
            color: "primary",
            timeout: 3000
        });
    }

    function handleErrors(error: JsonResponseError) {
        if (typeof error.data.error === 'string' && error.data.error.length > 0) {
            toast.add({
                title: "Erreur",
                description: error.data.error,
                color: 'orange',
                icon: "i-heroicons-x-circle",
                timeout: 3000
            });
        } else if (Array.isArray(error.data.error) && error.data.error.length > 0) {
            error.data.error.forEach(err => {
                toast.add({
                    title: "Erreur",
                    description: err,
                    color: 'orange',
                    icon: "i-heroicons-x-circle",
                    timeout: 3000
                });
            });
        } else {
            toast.add({
                title: "Erreur",
                description: error.data.message || "Une erreur inattendue est survenue.",
                color: 'orange',
                icon: "i-heroicons-x-circle",
                timeout: 3000
            });
        }
    }

    return {
        handleErrors,
        handleSuccess
    };
}