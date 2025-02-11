export const useHasRole = (get_role: string) => {
    const auth = useAuthStore()

    if (auth.connected_user.roles) {
        return auth.connected_user.roles.some((role: Group) => role.name === get_role)
    }

    return false
}