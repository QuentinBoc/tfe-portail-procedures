export interface User {
    id: number,
    email: string,
    full_name: string,
    role: string | null,
    role_label: string | null,
    role_id: number,
    is_active: boolean

}

export interface UserCreateAdmin {
    email: string,
    full_name: string,
    password: string,
    role_id: number
}