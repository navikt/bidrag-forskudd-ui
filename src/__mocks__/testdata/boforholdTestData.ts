interface Periode {
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
    navn: string;
    ident: string;
    perioder: Periode[];
}
export interface BoforholdData {
    barn: Barn[];
    sivilstand: Sivilstand;
    begrunnelseMedIVedtakNotat: string;
    begrunnelseKunINotat: string;
}

export const createBoforholdData = () => {
    const initialData = {
        barn: [
            {
                navn: "Amalia Svendsen",
                ident: "08102034566",
                perioder: [
                    {
                        fraDato: "",
                        tilDato: "",
                        registrertPaaAdresse: true,
                        kilde: "offentlig",
                        borMedForeldre: true,
                    },
                ],
            },
        ],
        sivilstand: {
            fraDato: "",
            tilDato: "",
            stand: "",
        },
        begrunnelseMedIVedtakNotat: "",
        begrunnelseKunINotat: "",
    } as BoforholdData;

    return initialData;
};
