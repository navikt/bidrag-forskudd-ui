import {
    SamvaerDto,
    SamvaerskalkulatorDetaljer,
    SamvaerskalkulatorFerietype,
    SamvaerskalkulatorNetterFrekvens,
    SamvaersperiodeDto,
} from "../../api/BidragBehandlingApiV1";
import {
    SamværBarnformvalues,
    Samværformvalues,
    SamværPeriodeFormvalues,
    SamværskalkulatorFormValues,
} from "../types/samværFormValues";

export const createInitialValues = (samvær: SamvaerDto[]): SamværBarnformvalues => {
    return samvær.reduce(
        (acc, barn) => ({
            ...acc,
            [barn.gjelderBarn]: createSamværInitialValues(barn),
        }),
        {}
    );
};
export const createSamværInitialValues = (samvær: SamvaerDto): Samværformvalues => {
    return {
        begrunnelse: samvær.begrunnelse.innhold,
        perioder: samvær.perioder.map((periode) => createSamværsperiodeInitialValues(periode)),
    };
};

export const createSamværsperiodeInitialValues = (periode: SamvaersperiodeDto): SamværPeriodeFormvalues => {
    return {
        id: periode.id,
        fom: periode.periode.fom,
        tom: periode.periode.tom,
        samværsklasse: periode.samværsklasse,
        beregning: createSamværskalkulatorInitialValues(periode),
    };
};

export const createSamværskalkulatorDefaultvalues = (deleted = false): SamværskalkulatorFormValues => ({
    isSaved: false,
    isDeleted: deleted,
    ferier: Object.values(SamvaerskalkulatorFerietype).reduce(
        (acc, ferietype) => ({
            ...acc,
            [ferietype as SamvaerskalkulatorFerietype]: {
                bidragsmottakerNetter: undefined,
                bidragspliktigNetter: undefined,
                frekvens: SamvaerskalkulatorNetterFrekvens.ANNENHVERTAR,
            },
        }),
        {}
    ),
});
export const createSamværskalkulatorInitialValues = (
    samværsperiode: SamvaersperiodeDto
): SamværskalkulatorFormValues => {
    const samværskalkulatorBeregning = samværsperiode.beregning;
    if (samværskalkulatorBeregning === null) {
        return createSamværskalkulatorDefaultvalues();
    }
    return {
        isSaved: true,
        isDeleted: false,
        regelmessigSamværNetter: samværskalkulatorBeregning?.regelmessigSamværNetter,
        samværsklasse: samværsperiode?.samværsklasse,
        ferier: samværskalkulatorBeregning?.ferier.reduce(
            (acc, ferie) => ({
                ...acc,
                [ferie.type as SamvaerskalkulatorFerietype]: {
                    bidragsmottakerNetter: ferie.bidragsmottakerNetter === 0 ? undefined : ferie.bidragsmottakerNetter,
                    bidragspliktigNetter: ferie.bidragspliktigNetter === 0 ? undefined : ferie.bidragspliktigNetter,
                    frekvens: ferie.frekvens,
                },
            }),
            {}
        ),
    };
};

export const mapToSamværskalkulatoDetaljer = (beregning?: SamværskalkulatorFormValues): SamvaerskalkulatorDetaljer => {
    if (!beregning) return null;
    return {
        regelmessigSamværNetter: beregning.regelmessigSamværNetter ?? 0,
        ferier: Object.entries(beregning.ferier).map(([ferietype, item]) => ({
            type: ferietype as SamvaerskalkulatorFerietype,
            bidragsmottakerNetter: item.bidragsmottakerNetter,
            bidragspliktigNetter: item.bidragspliktigNetter,
            frekvens: item.frekvens,
        })),
    };
};
