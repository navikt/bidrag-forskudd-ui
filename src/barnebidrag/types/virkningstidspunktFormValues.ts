export enum OpphørsVarighet {
    LØPENDE = "Løpende",
    FORTSETTE_OPPHØR = "Fortsette opphør",
    VELG_OPPHØRSDATO = "Velg opphørsdato",
}

export interface VirkningstidspunktFormValues {
    virkningstidspunkt?: string | null;
    årsakAvslag: string | null;
    begrunnelse?: string;
    opphørsvarighet?: OpphørsVarighet;
    opphørsdato?: string | null;
}
