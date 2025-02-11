export interface Stat {
    count: number;
    icon: string;
    name: string;
}

export interface AllStat {
    name: string,
    data: Stat[]
}

export interface Data {
    acte_status: string[];
    etablissement_status?: string[];
    paiement_status?: string[];
}