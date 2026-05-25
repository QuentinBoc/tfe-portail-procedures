export interface InterventionReport {

    id: number
    type: 'closure' | 'problem' | 'refusal'
    user_id: number
    description: string
    created_at: string
    updated_at: string
    intervention_id: number

}

export interface NewReport {

    type: 'closure' | 'problem' | 'refusal'
    description: string
    intervention_id: number
}