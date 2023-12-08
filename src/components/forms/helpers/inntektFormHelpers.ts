import { lastDayOfMonth } from "@navikt/bidrag-ui-common";

import { InntektDto, InntekterResponse, RolleDto, UpdateInntekterRequest } from "../../../api/BidragBehandlingApi";
import {
    BarnetilleggDto,
    HentGrunnlagspakkeDto,
    UtvidetBarnetrygdOgSmaabarnstilleggDto,
} from "../../../api/BidragGrunnlagApi";
import { SummertArsinntekt, TransformerInntekterResponse } from "../../../api/BidragInntektApi";
import {
    gjennomsnittPerioder,
    innhentendeTotalsummertInntekter,
    perioderSomIkkeKanOverlape,
    perioderSomKanIkkeOverlapeKunMedHverandre,
    ytelsePerioder,
} from "../../../constants/inntektene";
import { Inntekt, InntektFormValues, InntektTransformed } from "../../../types/inntektFormValues";
import { addDays, deductDays, isAfterDate, isValidDate, toISODateString } from "../../../utils/date-utils";

export const createInntektPayload = (values: InntektFormValues): UpdateInntekterRequest => ({
    inntekter: Object.entries(values.inntekteneSomLeggesTilGrunn)
        .map(([key, value]) =>
            value.map((inntekt) => {
                return {
                    ...inntekt,
                    inntektType: inntekt.inntektType === "" ? null : inntekt.inntektType,
                    ident: key,
                    belop: Number(inntekt.belop),
                    inntektPostListe: inntekt.inntektPostListe,
                    datoFom: toISODateString(new Date(inntekt.datoFom)),
                    datoTom: inntekt.datoTom ? toISODateString(new Date(inntekt.datoTom)) : null,
                };
            })
        )
        .flat(),
    utvidetbarnetrygd: values.utvidetbarnetrygd.length
        ? values.utvidetbarnetrygd.map((utvidetbarnetrygd) => ({
              ...utvidetbarnetrygd,
              belop: Number(utvidetbarnetrygd.belop),
          }))
        : [],
    barnetillegg: values.barnetillegg.length
        ? values.barnetillegg.map((barnetillegg) => ({
              ...barnetillegg,
              barnetillegg: Number(barnetillegg.barnetillegg),
          }))
        : [],
    inntektBegrunnelseKunINotat: values.inntektBegrunnelseKunINotat,
    inntektBegrunnelseMedIVedtakNotat: values.inntektBegrunnelseMedIVedtakNotat,
});

const reduceAndMapRolleToInntekt = (mapFunction) => (acc, rolle) => ({
    ...acc,
    [rolle.ident]: mapFunction(rolle),
});

const mapInntekterToRolle =
    (inntekter: InntektDto[]) =>
    (rolle): Inntekt[] =>
        inntekter
            .filter((inntekt) => inntekt.ident === rolle.ident)
            .map((inntekt) => ({
                ...inntekt,
                inntektType: inntekt.inntektType ?? "",
                datoFom: inntekt.datoFom ?? null,
                datoTom: inntekt.datoTom ?? null,
            }))
            .sort((a, b) => (isAfterDate(a.datoFom, b.datoFom) ? 1 : -1));

export const getPerioderFraInntekter = (bmOgBarn, inntekter) =>
    bmOgBarn.reduce(reduceAndMapRolleToInntekt(mapInntekterToRolle(inntekter)), {});

export const getPerioderFraBidragInntekt = (bidragInntekt: InntektTransformed[]) =>
    bidragInntekt.reduce(
        (acc, curr) => ({
            ...acc,
            [curr.ident]: curr.data.summertÅrsinntektListe
                .map((inntekt) => {
                    return {
                        taMed: false,
                        inntektBeskrivelse: inntekt.visningsnavn,
                        inntektType: inntekt.inntektRapportering,
                        belop: inntekt.sumInntekt,
                        datoTom:
                            inntekt.periode.til != null
                                ? toISODateString(lastDayOfMonth(new Date(inntekt.periode.til)))
                                : null,
                        datoFom: inntekt.periode.fom,
                        ident: curr.ident,
                        fraGrunnlag: true,
                        inntektPostListe: inntekt.inntektPostListe,
                    };
                })
                .sort((a: Inntekt, b: Inntekt) => (isAfterDate(a.datoFom, b.datoFom) ? 1 : -1)) as Inntekt[],
        }),
        {}
    );

export const createInitialValues = (
    bmOgBarn: RolleDto[],
    bidragInntekt: { ident: string; data: TransformerInntekterResponse }[],
    inntekter: InntekterResponse,
    grunnlagspakke: HentGrunnlagspakkeDto
): InntektFormValues => {
    return {
        inntekteneSomLeggesTilGrunn: inntekter?.inntekter?.length
            ? getPerioderFraInntekter(bmOgBarn, inntekter.inntekter)
            : getPerioderFraBidragInntekt(bidragInntekt),
        utvidetbarnetrygd: inntekter?.utvidetbarnetrygd?.length
            ? inntekter.utvidetbarnetrygd
            : grunnlagspakke.ubstListe.map((ubst) => ({
                  deltBoSted: false,
                  belop: ubst.belop,
                  datoFom: ubst.periodeFra,
                  datoTom: ubst.periodeTil,
              })),
        barnetillegg: inntekter?.barnetillegg?.length
            ? inntekter.barnetillegg
            : grunnlagspakke.barnetilleggListe.map((periode) => ({
                  ident: periode.barnPersonId,
                  barnetillegg: periode.belopBrutto,
                  datoFom: periode.periodeFra,
                  datoTom: periode.periodeTil,
              })),
        inntektBegrunnelseMedIVedtakNotat: inntekter.inntektBegrunnelseMedIVedtakNotat,
        inntektBegrunnelseKunINotat: inntekter.inntektBegrunnelseKunINotat,
    };
};

const findPeriodeIndex = (inntekteneSomLeggesTilGrunn, periode) =>
    inntekteneSomLeggesTilGrunn.findIndex(
        (inntekt) => inntekt.aar === periode.aar && inntekt.tekniskNavn === periode.tekniskNavn
    );
export const syncDates = (
    selected,
    inntekteneSomLeggesTilGrunn,
    ident,
    index,
    setValue,
    virkningstidspunkt,
    setError,
    clearErrors
) => {
    const fieldValue = inntekteneSomLeggesTilGrunn[index];
    const selectedFirstDayOfPeriod = new Date(fieldValue.aar, 0, 1);
    const perioderFraSammeGruppe = inntekteneSomLeggesTilGrunn
        .filter(
            (inntekt) =>
                !(inntekt.tekniskNavn === fieldValue.tekniskNavn && inntekt.aar === fieldValue.aar) &&
                inntekt.selected &&
                ytelsePerioder.includes(inntekt.tekniskNavn) &&
                inntekt.aar
        )
        .sort((a, b) => new Date(a.aar).getFullYear() - new Date(b.aar).getFullYear());
    const preSelectedPerioder = perioderFraSammeGruppe.filter(
        (periode) => new Date(new Date(periode.aar).getFullYear(), 0, 1) <= selectedFirstDayOfPeriod
    );
    const postSelectedPerioder = perioderFraSammeGruppe.filter(
        (periode) => new Date(new Date(periode.aar).getFullYear(), 0, 1) >= selectedFirstDayOfPeriod
    );
    const periodeErFraSammeAarSomVirkningsTidspunkt =
        new Date(fieldValue.aar).getFullYear() === virkningstidspunkt.getFullYear();
    const periodeErFoerVirkningsTidspunkt = new Date(fieldValue.aar).getFullYear() < virkningstidspunkt.getFullYear();

    if (!selected) {
        if (!preSelectedPerioder.length && postSelectedPerioder.length === 1) {
            const forstePostPeriode = postSelectedPerioder[0];
            const forstePostPeriodeIndex = findPeriodeIndex(inntekteneSomLeggesTilGrunn, forstePostPeriode);
            setValue(
                `inntekteneSomLeggesTilGrunn.${ident}.${Number(forstePostPeriodeIndex)}.datoFom`,
                toISODateString(virkningstidspunkt)
            );
        }

        if (!preSelectedPerioder.length && postSelectedPerioder.length > 1) {
            const forstePostPeriode = postSelectedPerioder[0];
            const forstePostPeriodeIndex = findPeriodeIndex(inntekteneSomLeggesTilGrunn, forstePostPeriode);
            if (!(new Date(forstePostPeriode.aar).getFullYear() < virkningstidspunkt.getFullYear())) {
                setValue(
                    `inntekteneSomLeggesTilGrunn.${ident}.${Number(forstePostPeriodeIndex)}.datoFom`,
                    toISODateString(virkningstidspunkt)
                );
            }
        }

        if (preSelectedPerioder.length === 1 && !postSelectedPerioder.length) {
            const sistePrePeriode = preSelectedPerioder[0];
            const sistePrePeriodeIndex = findPeriodeIndex(inntekteneSomLeggesTilGrunn, sistePrePeriode);
            setValue(`inntekteneSomLeggesTilGrunn.${ident}.${Number(sistePrePeriodeIndex)}.datoTom`, null);
            setValue(
                `inntekteneSomLeggesTilGrunn.${ident}.${Number(sistePrePeriodeIndex)}.datoFom`,
                toISODateString(virkningstidspunkt)
            );
        } else if (preSelectedPerioder.length) {
            const sistePrePeriode = preSelectedPerioder[preSelectedPerioder.length - 1];
            const sistePrePeriodeIndex = findPeriodeIndex(inntekteneSomLeggesTilGrunn, sistePrePeriode);
            if (postSelectedPerioder.length) {
                setValue(
                    `inntekteneSomLeggesTilGrunn.${ident}.${Number(sistePrePeriodeIndex)}.datoTom`,
                    fieldValue.datoTom
                );
                if (!inntekteneSomLeggesTilGrunn[sistePrePeriodeIndex].fraDato) {
                    setValue(
                        `inntekteneSomLeggesTilGrunn.${ident}.${Number(sistePrePeriodeIndex)}.datoFom`,
                        fieldValue.datoFom
                    );
                }
            }

            if (!postSelectedPerioder.length) {
                setValue(`inntekteneSomLeggesTilGrunn.${ident}.${Number(sistePrePeriodeIndex)}.datoTom`, null);
            }
        }
        setValue(`inntekteneSomLeggesTilGrunn.${ident}.${Number(index)}.datoFom`, null);
        setValue(`inntekteneSomLeggesTilGrunn.${ident}.${Number(index)}.datoTom`, null);
        clearErrors(`inntekteneSomLeggesTilGrunn.${ident}.${Number(index)}.datoFom`);
        clearErrors(`inntekteneSomLeggesTilGrunn.${ident}.${Number(index)}.datoTom`);
        return;
    }

    if (!innhentendeTotalsummertInntekter.includes(fieldValue.tekniskNavn)) {
        return;
    }

    if (
        perioderSomKanIkkeOverlapeKunMedHverandre.includes(fieldValue.tekniskNavn) ||
        gjennomsnittPerioder.includes(fieldValue.tekniskNavn)
    ) {
        setValue(`inntekteneSomLeggesTilGrunn.${ident}.${Number(index)}.datoFom`, toISODateString(virkningstidspunkt));
    } else {
        const fraDato =
            !preSelectedPerioder.length || periodeErFraSammeAarSomVirkningsTidspunkt
                ? virkningstidspunkt
                : selectedFirstDayOfPeriod;
        const tilDato = postSelectedPerioder.length
            ? deductDays(new Date(new Date(postSelectedPerioder[0].aar).getFullYear(), 0, 1), 1)
            : null;

        if (periodeErFoerVirkningsTidspunkt && postSelectedPerioder.length) {
            setError(`inntekteneSomLeggesTilGrunn.${ident}.${Number(index)}.datoFom`, {
                type: "invalid",
                message: "Dato må settes manuelt",
            });
            return;
        }

        setValue(`inntekteneSomLeggesTilGrunn.${ident}.${Number(index)}.datoFom`, fraDato);
        setValue(`inntekteneSomLeggesTilGrunn.${ident}.${Number(index)}.datoTom`, tilDato);

        if (
            (periodeErFraSammeAarSomVirkningsTidspunkt || periodeErFoerVirkningsTidspunkt) &&
            preSelectedPerioder.length
        ) {
            const preSelectedPerioderIndexes = preSelectedPerioder.map((periode) =>
                findPeriodeIndex(inntekteneSomLeggesTilGrunn, periode)
            );
            preSelectedPerioderIndexes.forEach((index) => {
                setValue(`inntekteneSomLeggesTilGrunn.${ident}.${Number(index)}.selected`, false);
                setValue(`inntekteneSomLeggesTilGrunn.${ident}.${Number(index)}.datoFom`, null);
                setValue(`inntekteneSomLeggesTilGrunn.${ident}.${Number(index)}.datoTom`, null);
            });
        } else if (preSelectedPerioder.length) {
            const sistePrePeriode = preSelectedPerioder[preSelectedPerioder.length - 1];
            const sistePrePeriodeIndex = findPeriodeIndex(inntekteneSomLeggesTilGrunn, sistePrePeriode);
            setValue(
                `inntekteneSomLeggesTilGrunn.${ident}.${Number(sistePrePeriodeIndex)}.datoTom`,
                deductDays(fraDato, 1)
            );
        }

        if (postSelectedPerioder.length) {
            const forstePostPeriode = postSelectedPerioder[0];
            const forstePostPeriodeIndex = findPeriodeIndex(inntekteneSomLeggesTilGrunn, forstePostPeriode);
            setValue(
                `inntekteneSomLeggesTilGrunn.${ident}.${Number(forstePostPeriodeIndex)}.datoFom`,
                addDays(tilDato, 1)
            );
        }
    }
};

export const findDateGaps = (perioder, virkningstidspunkt) => {
    const filteredAndSortedPerioder = perioder
        .filter((periode) => periode.fraDato && isValidDate(periode.fraDato))
        .sort((a, b) => new Date(a.fraDato).getTime() - new Date(b.fraDato).getTime());

    if (!filteredAndSortedPerioder.length) return;

    const gaps = [];
    const today = new Date();

    filteredAndSortedPerioder.forEach((periode, i) => {
        const prevTilDato = i === 0 ? virkningstidspunkt : filteredAndSortedPerioder[i - 1].tilDato;
        const currFraDato = new Date(filteredAndSortedPerioder[i].fraDato);
        if (prevTilDato !== null && currFraDato.getTime() - new Date(prevTilDato).getTime() > 86400000) {
            const gapFrom = new Date(prevTilDato.getTime() + 86400000);
            gaps.push({ fra: gapFrom.toLocaleDateString(), til: currFraDato.toLocaleDateString() });
        }
    });

    const lastToDate = filteredAndSortedPerioder[filteredAndSortedPerioder.length - 1].tilDato;
    if (lastToDate !== null && today.getTime() - new Date(lastToDate).getTime() > 86400000) {
        const gapFrom = new Date(lastToDate.getTime() + 86400000);
        gaps.push({ fra: gapFrom.toLocaleDateString(), til: today.toLocaleDateString() });
    }
    return gaps;
};

export const checkOverlappingPeriods = (perioder) => {
    const overlappingPeriods = [];

    for (let i = 0; i < perioder.length; i++) {
        for (let j = i + 1; j < perioder.length; j++) {
            if (
                (perioder[i].tilDato === null || new Date(perioder[i].tilDato) >= new Date(perioder[j].fraDato)) &&
                (perioder[j].tilDato === null || new Date(perioder[j].tilDato) >= new Date(perioder[i].fraDato))
            ) {
                overlappingPeriods.push([`${perioder[i].beskrivelse}`, `${perioder[j].beskrivelse}`]);
            }
        }
    }

    return overlappingPeriods;
};

export const getOverlappingInntektPerioder = (perioder) => {
    const ytelsePerioder = perioder
        .filter(
            (periode) =>
                periode.fraDato &&
                isValidDate(periode.fraDato) &&
                perioderSomIkkeKanOverlape.includes(periode.tekniskNavn)
        )
        .sort((a, b) => new Date(a.fraDato).getTime() - new Date(b.fraDato).getTime());
    const overlappingPeriods = checkOverlappingPeriods(ytelsePerioder);

    perioderSomKanIkkeOverlapeKunMedHverandre.forEach((tekniskNavn) => {
        const filteredAndSortedPerioder = perioder
            .filter((periode) => periode.fraDato && isValidDate(periode.fraDato) && periode.tekniskNavn === tekniskNavn)
            .sort((a, b) => new Date(a.fraDato).getTime() - new Date(b.fraDato).getTime());

        overlappingPeriods.concat(checkOverlappingPeriods(filteredAndSortedPerioder));
    });

    return overlappingPeriods;
};

export interface InntektOpplysninger {
    inntekt: { ident: string; summertAarsinntektListe: SummertArsinntekt[] }[];
    utvidetbarnetrygd: UtvidetBarnetrygdOgSmaabarnstilleggDto[];
    barnetillegg: BarnetilleggDto[];
}
export const compareOpplysninger = (
    savedOpplysninger: InntektOpplysninger,
    latestOpplysninger: InntektOpplysninger
) => {
    const changedLog = [];

    savedOpplysninger.inntekt.forEach((personInntekt) => {
        const inntektListeInLatestOpplysninger = latestOpplysninger.inntekt.find(
            (i) => personInntekt.ident === i.ident
        );

        if (
            inntektListeInLatestOpplysninger.summertAarsinntektListe.length >
            personInntekt.summertAarsinntektListe.length
        ) {
            changedLog.push(
                `En eller flere inntekt perioder har blitt lagt til rolle med ident - ${personInntekt.ident}`
            );
        }

        if (
            inntektListeInLatestOpplysninger.summertAarsinntektListe.length <
            personInntekt.summertAarsinntektListe.length
        ) {
            changedLog.push(
                `Det er minst en inntekt som legges til grunn mindre for person med ident - ${personInntekt.ident}`
            );
        }

        personInntekt.summertAarsinntektListe.forEach((summertAarsinntekt) => {
            const summertAarsinntektFraLatestOpplysninger =
                inntektListeInLatestOpplysninger.summertAarsinntektListe.find(
                    (aarsInntekt) => aarsInntekt.visningsnavn === summertAarsinntekt.visningsnavn
                );
            if (summertAarsinntektFraLatestOpplysninger) {
                if (summertAarsinntektFraLatestOpplysninger.sumInntekt !== summertAarsinntekt.sumInntekt) {
                    changedLog.push(
                        `Sum for ${summertAarsinntekt.visningsnavn} har blitt endret for rolle med ident - ${personInntekt.ident} fra ${summertAarsinntekt.sumInntekt} til ${summertAarsinntektFraLatestOpplysninger.sumInntekt}`
                    );
                }
            }
        });
    });

    if (savedOpplysninger.utvidetbarnetrygd.length !== latestOpplysninger.utvidetbarnetrygd.length) {
        changedLog.push(`Antall utvidet barnetrygd perioder har blitt endret`);
    } else {
        savedOpplysninger.utvidetbarnetrygd.forEach((utvidetbarnetrygd, index) => {
            const utvidetbarnetrygdInLatestOpplysninger = latestOpplysninger.utvidetbarnetrygd[index];

            if (utvidetbarnetrygdInLatestOpplysninger) {
                if (utvidetbarnetrygd.belop !== utvidetbarnetrygdInLatestOpplysninger.belop) {
                    changedLog.push(`Beløp for en eller flere perioder har blitt endret`);
                }
            }
        });
    }

    if (savedOpplysninger.barnetillegg.length !== latestOpplysninger.barnetillegg.length) {
        changedLog.push("Antall barnetillegg perioder har blitt endret");
    } else {
        savedOpplysninger.barnetillegg.forEach((periode, index) => {
            const periodeFraLatestOpplysninger = latestOpplysninger.barnetillegg[index];
            if (periodeFraLatestOpplysninger.belopBrutto === periode.belopBrutto) {
                changedLog.push("Belop for en eller flere barnetillegg perioder har blitt endret");
            }
        });
    }

    return changedLog;
};
