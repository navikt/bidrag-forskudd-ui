import { InntektDto, InntekterResponse, RolleDto } from "../../../api/BidragBehandlingApi";
import { HentGrunnlagspakkeDto, SkattegrunnlagDto } from "../../../api/BidragGrunnlagApi";
import {
    gjennomsnittPerioder,
    innhentendeTotalsummertInntekter,
    perioderSomIkkeKanOverlape,
    perioderSomKanIkkeOverlapeKunMedHverandre,
    ytelsePerioder,
} from "../../../constants/inntektene";
import { InntektFormValues } from "../../../types/inntektFormValues";
import { addDays, dateOrNull, deductDays, isValidDate, toISODateString } from "../../../utils/date-utils";

export const createInntektPayload = (values: InntektFormValues) => ({
    inntekter: Object.entries(values.inntekteneSomLeggesTilGrunn)
        .map(([key, value]) =>
            value.map((inntekt) => {
                return {
                    ...inntekt,
                    inntektType: inntekt.inntektType === "" ? null : inntekt.inntektType,
                    ident: key,
                    belop: Number(inntekt.belop),
                    datoFom: toISODateString(inntekt.datoFom),
                    datoTom: toISODateString(inntekt.datoFom),
                };
            })
        )
        .flat(),
    utvidetbarnetrygd: values.utvidetBarnetrygd.length
        ? values.utvidetBarnetrygd.map((utvidetBarnetrygd) => ({
              ...utvidetBarnetrygd,
              belop: Number(utvidetBarnetrygd.belop),
              datoFom: toISODateString(utvidetBarnetrygd.datoFom),
              datoTom: toISODateString(utvidetBarnetrygd.datoTom),
          }))
        : [],
    barnetillegg: values.barnetillegg.length
        ? values.barnetillegg.map((barnetillegg) => ({
              ...barnetillegg,
              barnetillegg: Number(barnetillegg.barnetillegg),
              datoFom: toISODateString(barnetillegg.datoFom),
              datoTom: toISODateString(barnetillegg.datoTom),
          }))
        : [],
    inntektBegrunnelseKunINotat: values.inntektBegrunnelseKunINotat,
    inntektBegrunnelseMedIVedtakNotat: values.inntektBegrunnelseMedIVedtakNotat,
});

const mapSkattegrunnlagInntektPerioder = (skattegrunlag: SkattegrunnlagDto) =>
    skattegrunlag.skattegrunnlagListe.map((inntekt) => ({
        taMed: false,
        beskrivelse: inntekt.inntektType ?? "",
        belop: inntekt.belop,
        datoTom: dateOrNull(skattegrunlag.periodeTil),
        datoFom: dateOrNull(skattegrunlag.periodeFra),
        ident: skattegrunlag.personId,
        fraGrunnlag: true,
    }));

const reduceAndMapRolleToInntekt = (mapFunction) => (acc, rolle) => ({
    ...acc,
    [rolle.ident]: mapFunction(rolle),
});
const mapSkattegrunnlagToRolle = (skattegrunnlagListe: SkattegrunnlagDto[]) => (rolle) =>
    skattegrunnlagListe
        .filter((skattegrunlag) => skattegrunlag.personId === rolle.ident)
        .map((skattegrunlag) => mapSkattegrunnlagInntektPerioder(skattegrunlag))
        .flat();

const mapInntekterToRolle = (inntekter: InntektDto[]) => (rolle) =>
    inntekter
        .filter((inntekt) => inntekt.ident === rolle.ident)
        .map((inntekt) => ({
            ...inntekt,
            inntektType: inntekt.inntektType ?? "",
            datoTom: dateOrNull(inntekt.datoTom),
            datoFom: dateOrNull(inntekt.datoFom),
        }));

const getPerioderFraSkattegrunnlagOgAinntekt = (bmOgBarn: RolleDto[], skattegrunnlagListe: SkattegrunnlagDto[]) =>
    bmOgBarn.reduce(reduceAndMapRolleToInntekt(mapSkattegrunnlagToRolle(skattegrunnlagListe)), {});

const getPerioderFraInntekter = (bmOgBarn: RolleDto[], inntekter: InntektDto[]) =>
    bmOgBarn.reduce(reduceAndMapRolleToInntekt(mapInntekterToRolle(inntekter)), {});

export const createInitialValues = (
    bmOgBarn: RolleDto[],
    grunnlagspakke: HentGrunnlagspakkeDto,
    inntekter: InntekterResponse
): InntektFormValues => {
    return {
        inntekteneSomLeggesTilGrunn: inntekter?.inntekter?.length
            ? getPerioderFraInntekter(bmOgBarn, inntekter.inntekter)
            : getPerioderFraSkattegrunnlagOgAinntekt(bmOgBarn, grunnlagspakke.skattegrunnlagListe),
        utvidetBarnetrygd: inntekter?.utvidetbarnetrygd?.length
            ? inntekter.utvidetbarnetrygd.map((utvidetBarnetrygd) => ({
                  ...utvidetBarnetrygd,
                  datoFom: dateOrNull(utvidetBarnetrygd.datoFom),
                  datoTom: dateOrNull(utvidetBarnetrygd.datoTom),
              }))
            : grunnlagspakke.ubstListe.map((ubst) => ({
                  deltBoSted: false, // TODO check where to get this value
                  belop: ubst.belop,
                  datoFom: dateOrNull(ubst.periodeFra),
                  datoTom: dateOrNull(ubst.periodeTil),
              })),
        barnetillegg: inntekter?.barnetillegg?.length
            ? inntekter.barnetillegg.map((barnetilleg) => ({
                  ...barnetilleg,
                  datoFom: dateOrNull(barnetilleg.datoFom),
                  datoTom: dateOrNull(barnetilleg.datoTom),
              }))
            : grunnlagspakke.barnetilleggListe.map((periode) => ({
                  ident: periode.barnPersonId,
                  barnetillegg: periode.belopBrutto,
                  datoFom: dateOrNull(periode.periodeFra),
                  datoTom: dateOrNull(periode.periodeTil),
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
    selected: boolean,
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
