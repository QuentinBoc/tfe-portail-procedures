export interface Intervention {
    id: number
    title: string
    description: string | null
    type: string
    location: string 
    status: string
    assigned_to: number | null
    assigned_at: string | null
    created_by: number
    created_at: string
    validated_by: number | null
    validated_at: string | null
    processing_by: number | null
    processing_at: string | null
    rejected_by: number | null
    rejected_at: string | null
    closed_by: number | null
    closed_at: string | null
}


