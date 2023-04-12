interface Periode {
    selected: boolean;
    fraDato: string;
    tilDato: string;
    registrertPaaAdresse: boolean;
    kilde: string;
    borMedForeldre: boolean;
}

interface Sivilstand {
    fraDato: string;
    tilDato: string;
    stand: string;
}
interface Barn {
    medISaken: boolean;
    ident: string;
    perioder: Periode[];
}
export interface BoforholdData {
    barn: Barn[];
    sivilstand: Sivilstand[];
    boforholdBegrunnelseMedIVedtakNotat: string;
    boforholdBegrunnelseKunINotat: string;
}

export const createBoforholdData = (identer: string[] = []) => {
    const initialData = {
        barn: barnBoforholdData(identer),
        sivilstand: [],
        boforholdBegrunnelseMedIVedtakNotat: "",
        boforholdBegrunnelseKunINotat: "",
    } as BoforholdData;

    return initialData;
};

export const barnBoforholdData = (identer: string[]) => {
    if (!identer.length) {
        return [];
    }

    return identer.map((ident) => ({
        ident,
        medISaken: true,
        perioder: [],
    }));
};

export const getBoforholdMockData = (behandlingId, identer: string[]) => {
    if (!localStorage.getItem(`boforhold-${behandlingId}`)) {
        localStorage.setItem(`boforhold-${behandlingId}`, JSON.stringify(createBoforholdData(identer)));
    }

    return localStorage.getItem(`boforhold-${behandlingId}`);
};
