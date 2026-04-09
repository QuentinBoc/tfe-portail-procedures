export interface Intervention {
    id: number
    title: string
    description: string | null
    type: string
    location: string 
    status: string
    created_by: number
    assigned_to: number | null
    validated_by: number | null
    created_at: string
    validated_at: string | null
}


