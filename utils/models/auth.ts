export interface Auth {
    readonly id?: number
    name: string
    email?: string
    // roles?: Group[]
    password?: string
    telephone?: string
}

export interface NewPassword {
    old_password: string;
    password?: string;
    password_confirmation?: string;
}