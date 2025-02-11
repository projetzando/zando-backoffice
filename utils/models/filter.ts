export interface Filter {
    query: string;
    acte_administratif_id?: number;
    arrondissement_id?: number;
    circonscription_id?: number;
    departement_id?: number;
    end_date?: Date | null;
    session_id?: number;
    sort_by?: string;
    sort_order?: SortOrder;
    start_date?: Date | null;
    status?: Status;
}

export enum SortOrder {
    Asc = "asc",
    Desc = "desc",
}

export enum Status {
    Aborted = "aborted",
    Cancelled = "cancelled",
    Failed = "failed",
    Finished = "finished",
    Paid = "paid",
    Pending = "pending",
    Unpaid = "unpaid",
}

export interface PaymentFilter {
    arrondissement_id?: number;
    circonscription_id?: number;
    departement_id?: number;
    end_date?: Date;
    sort_by?: string;
    sort_order?: SortOrder;
    start_date?: Date;
    status: string;
}