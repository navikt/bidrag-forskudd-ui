import {
    gjennomsnittPerioder,
    innhentendeTotalsummertInntekter,
    perioderSomIkkeKanOverlape,
    perioderSomKanIkkeOverlapeKunMedHverandre,
    ytelsePerioder,
} from "../../../constants/inntektene";
import { InntektFormValues } from "../../../types/inntektFormValues";
import { addDays, dateOrNull, deductDays, isValidDate, toISOStringOrNull } from "../../../utils/date-utils";

export const createInntektPayload = (values: InntektFormValues) => ({
    inntekteneSomLeggesTilGrunn: Object.keys(values.inntekteneSomLeggesTilGrunn).map((ident) => ({
        ident,
        inntekt: values.inntekteneSomLeggesTilGrunn[ident].map((inntekt) => ({
            ...inntekt,
            fraDato: toISOStringOrNull(inntekt.fraDato),
            tilDato: toISOStringOrNull(inntekt.tilDato),
        })),
    })),
    utvidetBarnetrygd: values.utvidetBarnetrygd.length
        ? values.utvidetBarnetrygd.map((utvidetBarnetrygd) => ({
              ...utvidetBarnetrygd,
              fraDato: toISOStringOrNull(utvidetBarnetrygd.fraDato),
              tilDato: toISOStringOrNull(utvidetBarnetrygd.tilDato),
          }))
        : [],
    barnetillegg: values.barnetillegg.length
        ? values.barnetillegg.map((barnetillegg) => ({
              ...barnetillegg,
              fraDato: toISOStringOrNull(barnetillegg.fraDato),
              tilDato: toISOStringOrNull(barnetillegg.tilDato),
          }))
        : [],
    inntektBegrunnelseMedIVedtakNotat: values.inntektBegrunnelseMedIVedtakNotat,
    inntektBegrunnelseKunINotat: values.inntektBegrunnelseKunINotat,
});

export const createInitialValues = (inntekt): InntektFormValues => {
    return {
        inntekteneSomLeggesTilGrunn: inntekt.inntekteneSomLeggesTilGrunn.reduce(
            (acc, rolle) => ({
                ...acc,
                [rolle.ident]: rolle.inntekt.map((inntekt) => ({
                    ...inntekt,
                    fraDato: dateOrNull(inntekt.fraDato),
                    tilDato: dateOrNull(inntekt.tilDato),
                })),
            }),
            {}
        ),
        utvidetBarnetrygd: inntekt.utvidetBarnetrygd.length
            ? inntekt.utvidetBarnetrygd.map((utvidetBarnetrygd) => ({
                  ...utvidetBarnetrygd,
                  fraDato: dateOrNull(utvidetBarnetrygd.fraDato),
                  tilDato: dateOrNull(utvidetBarnetrygd.tilDato),
              }))
            : [],
        barnetillegg: inntekt.barnetillegg.length
            ? inntekt.barnetillegg.map((barnetilleg) => ({
                  ...barnetilleg,
                  fraDato: dateOrNull(barnetilleg.fraDato),
                  tilDato: dateOrNull(barnetilleg.tilDato),
              }))
            : [],
        inntektBegrunnelseMedIVedtakNotat: inntekt.inntektBegrunnelseMedIVedtakNotat,
        inntektBegrunnelseKunINotat: inntekt.inntektBegrunnelseKunINotat,
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
                `inntekteneSomLeggesTilGrunn.${ident}.${Number(forstePostPeriodeIndex)}.fraDato`,
                virkningstidspunkt
            );
        }

        if (!preSelectedPerioder.length && postSelectedPerioder.length > 1) {
            const forstePostPeriode = postSelectedPerioder[0];
            const forstePostPeriodeIndex = findPeriodeIndex(inntekteneSomLeggesTilGrunn, forstePostPeriode);
            if (!(new Date(forstePostPeriode.aar).getFullYear() < virkningstidspunkt.getFullYear())) {
                setValue(
                    `inntekteneSomLeggesTilGrunn.${ident}.${Number(forstePostPeriodeIndex)}.fraDato`,
                    virkningstidspunkt
                );
            }
        }

        if (preSelectedPerioder.length === 1 && !postSelectedPerioder.length) {
            const sistePrePeriode = preSelectedPerioder[0];
            const sistePrePeriodeIndex = findPeriodeIndex(inntekteneSomLeggesTilGrunn, sistePrePeriode);
            setValue(`inntekteneSomLeggesTilGrunn.${ident}.${Number(sistePrePeriodeIndex)}.tilDato`, null);
            setValue(
                `inntekteneSomLeggesTilGrunn.${ident}.${Number(sistePrePeriodeIndex)}.fraDato`,
                virkningstidspunkt
            );
        } else if (preSelectedPerioder.length) {
            const sistePrePeriode = preSelectedPerioder[preSelectedPerioder.length - 1];
            const sistePrePeriodeIndex = findPeriodeIndex(inntekteneSomLeggesTilGrunn, sistePrePeriode);
            if (postSelectedPerioder.length) {
                setValue(
                    `inntekteneSomLeggesTilGrunn.${ident}.${Number(sistePrePeriodeIndex)}.tilDato`,
                    fieldValue.tilDato
                );
                if (!inntekteneSomLeggesTilGrunn[sistePrePeriodeIndex].fraDato) {
                    setValue(
                        `inntekteneSomLeggesTilGrunn.${ident}.${Number(sistePrePeriodeIndex)}.fraDato`,
                        fieldValue.fraDato
                    );
                }
            }

            if (!postSelectedPerioder.length) {
                setValue(`inntekteneSomLeggesTilGrunn.${ident}.${Number(sistePrePeriodeIndex)}.tilDato`, null);
            }
        }
        setValue(`inntekteneSomLeggesTilGrunn.${ident}.${Number(index)}.fraDato`, null);
        setValue(`inntekteneSomLeggesTilGrunn.${ident}.${Number(index)}.tilDato`, null);
        clearErrors(`inntekteneSomLeggesTilGrunn.${ident}.${Number(index)}.fraDato`);
        clearErrors(`inntekteneSomLeggesTilGrunn.${ident}.${Number(index)}.tilDato`);
        return;
    }

    if (!innhentendeTotalsummertInntekter.includes(fieldValue.tekniskNavn)) {
        return;
    }

    if (
        perioderSomKanIkkeOverlapeKunMedHverandre.includes(fieldValue.tekniskNavn) ||
        gjennomsnittPerioder.includes(fieldValue.tekniskNavn)
    ) {
        setValue(`inntekteneSomLeggesTilGrunn.${ident}.${Number(index)}.fraDato`, virkningstidspunkt);
    } else {
        const fraDato =
            !preSelectedPerioder.length || periodeErFraSammeAarSomVirkningsTidspunkt
                ? virkningstidspunkt
                : selectedFirstDayOfPeriod;
        const tilDato = postSelectedPerioder.length
            ? deductDays(new Date(new Date(postSelectedPerioder[0].aar).getFullYear(), 0, 1), 1)
            : null;

        if (periodeErFoerVirkningsTidspunkt && postSelectedPerioder.length) {
            setError(`inntekteneSomLeggesTilGrunn.${ident}.${Number(index)}.fraDato`, {
                type: "invalid",
                message: "Dato må settes manuelt",
            });
            return;
        }

        setValue(`inntekteneSomLeggesTilGrunn.${ident}.${Number(index)}.fraDato`, fraDato);
        setValue(`inntekteneSomLeggesTilGrunn.${ident}.${Number(index)}.tilDato`, tilDato);

        if (
            (periodeErFraSammeAarSomVirkningsTidspunkt || periodeErFoerVirkningsTidspunkt) &&
            preSelectedPerioder.length
        ) {
            const preSelectedPerioderIndexes = preSelectedPerioder.map((periode) =>
                findPeriodeIndex(inntekteneSomLeggesTilGrunn, periode)
            );
            preSelectedPerioderIndexes.forEach((index) => {
                setValue(`inntekteneSomLeggesTilGrunn.${ident}.${Number(index)}.selected`, false);
                setValue(`inntekteneSomLeggesTilGrunn.${ident}.${Number(index)}.fraDato`, null);
                setValue(`inntekteneSomLeggesTilGrunn.${ident}.${Number(index)}.tilDato`, null);
            });
        } else if (preSelectedPerioder.length) {
            const sistePrePeriode = preSelectedPerioder[preSelectedPerioder.length - 1];
            const sistePrePeriodeIndex = findPeriodeIndex(inntekteneSomLeggesTilGrunn, sistePrePeriode);
            setValue(
                `inntekteneSomLeggesTilGrunn.${ident}.${Number(sistePrePeriodeIndex)}.tilDato`,
                deductDays(fraDato, 1)
            );
        }

        if (postSelectedPerioder.length) {
            const forstePostPeriode = postSelectedPerioder[0];
            const forstePostPeriodeIndex = findPeriodeIndex(inntekteneSomLeggesTilGrunn, forstePostPeriode);
            setValue(
                `inntekteneSomLeggesTilGrunn.${ident}.${Number(forstePostPeriodeIndex)}.fraDato`,
                addDays(tilDato, 1)
            );
        }
    }
};

export const findDateGaps = (perioder, virkningstidspunkt) => {
    const filteredAndSortedPerioder = perioder
        .filter((periode) => isValidDate(periode.fraDato))
        .sort((a, b) => a.fraDato - b.fraDato);

    if (!filteredAndSortedPerioder.length) return;

    const gaps = [];
    const today = new Date();

    filteredAndSortedPerioder.forEach((periode, i) => {
        const prevTilDato = i === 0 ? virkningstidspunkt : filteredAndSortedPerioder[i - 1].tilDato;
        const currFraDato = filteredAndSortedPerioder[i].fraDato;
        if (prevTilDato !== null && currFraDato - prevTilDato > 86400000) {
            const gapFrom = new Date(prevTilDato.getTime() + 86400000);
            const gapTo = new Date(currFraDato.getTime());
            gaps.push({ fra: gapFrom.toLocaleDateString(), til: gapTo.toLocaleDateString() });
        }
    });

    const lastToDate = filteredAndSortedPerioder[filteredAndSortedPerioder.length - 1].tilDato;
    if (lastToDate !== null && today.getTime() - lastToDate.getTime() > 86400000) {
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
                (perioder[i].tilDato === null || perioder[i].tilDato >= perioder[j].fraDato) &&
                (perioder[j].tilDato === null || perioder[j].tilDato >= perioder[i].fraDato)
            ) {
                overlappingPeriods.push([`${perioder[i].beskrivelse}`, `${perioder[j].beskrivelse}`]);
            }
        }
    }

    return overlappingPeriods;
};

export const getOverlappingInntektPerioder = (perioder) => {
    const ytelsePerioder = perioder
        .filter((periode) => isValidDate(periode.fraDato) && perioderSomIkkeKanOverlape.includes(periode.tekniskNavn))
        .sort((a, b) => a.fraDato - b.fraDato);
    const overlappingPeriods = checkOverlappingPeriods(ytelsePerioder);

    perioderSomKanIkkeOverlapeKunMedHverandre.forEach((tekniskNavn) => {
        const filteredAndSortedPerioder = perioder
            .filter((periode) => isValidDate(periode.fraDato) && periode.tekniskNavn === tekniskNavn)
            .sort((a, b) => a.fraDato - b.fraDato);

        overlappingPeriods.concat(checkOverlappingPeriods(filteredAndSortedPerioder));
    });

    return overlappingPeriods;
};
