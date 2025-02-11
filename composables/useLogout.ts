export default function useLogout() {
    const confirm = useConfirm()

    const resetPinia = $ResetPinia()

    const logout = async () => await confirm?.value.show({
        title: 'Déconnexion',
        icon: 'i-heroicons-exclamation-triangle',
        message: 'Voulez-vous vraiment vous déconnectez de cette session ?',
        okButton: 'Confirmer',
    }).then(() => {
        const authStore = useAuthStore()
        
        localStorage.removeItem('activeMenu')
        
        localStorage.removeItem('activeChild')
        
        navigateTo('/', {
            replace: true,
        })
        
        authStore.logout()
        useCookie('zando_token').value = ''

        resetPinia.all()
    }).catch((error: any) => {
        console.log(error);
    })

    return {
        logout,
    }
}