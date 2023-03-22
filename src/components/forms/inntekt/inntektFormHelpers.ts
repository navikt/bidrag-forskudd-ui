import {
    gjennomsnittPerioder,
    innhentendeTotalsummertInntekter,
    perioderSomIkkeKanOverlape,
    perioderSomKanIkkeOverlapeKunMedHverandre,
    ytelsePerioder,
} from "../../../constants/inntektene";
import { InntektFormValues } from "../../../types/inntektFormValues";
import { addDays, dateOrNull, deductDays, toISOStringOrNull } from "../../../utils/date-utils";

const tekniksNavnToBeskrivelse = {
    kapitalinntekt: "Kapitalinntekt",
    skattegrunnlag: "Skattegrunnlag",
    loenn_og_trekk: "Lønn og trekk",
};

export const createInntektPayload = (values: InntektFormValues) => ({
    periode: {
        fraDato: toISOStringOrNull(values.periodeFra),
        tilDato: toISOStringOrNull(values.periodeTil),
    },
    inntekteneSomLeggesTilGrunn: values.inntekteneSomLeggesTilGrunn
        .map((inntekt) => ({
            ...inntekt,
            fraDato: toISOStringOrNull(inntekt.fraDato),
            tilDato: toISOStringOrNull(inntekt.tilDato),
        }))
        .filter((inntekt) => inntekt.selected),
    utvidetBarnetrygd: values.utvidetBarnetrygd.length
        ? values.utvidetBarnetrygd.map((utvidetBarnetrygd) => ({
              fraDato: toISOStringOrNull(utvidetBarnetrygd.fraDato),
              tilDato: toISOStringOrNull(utvidetBarnetrygd.tilDato),
              deltBosted: utvidetBarnetrygd.deltBosted,
              beloep: utvidetBarnetrygd.beloep,
          }))
        : [],
    barnetillegg: values.barnetillegg.length
        ? values.barnetillegg.map((barnetillegg) => ({
              fraDato: toISOStringOrNull(barnetillegg.fraDato),
              tilDato: toISOStringOrNull(barnetillegg.tilDato),
              barn: barnetillegg.barn ?? null,
              brutto: barnetillegg.brutto ?? null,
              skattesats: barnetillegg.skattesats ?? null,
              netto: barnetillegg.netto ?? null,
          }))
        : [],
    begrunnelseIVedtaket: values.begrunnelseIVedtaket,
    begrunnelseINotat: values.begrunnelseINotat,
    toTrinnsKontroll: values.toTrinnsKontroll,
});

export const createInitialValues = (inntekt, skattegrunnlager, aInntektene): InntektFormValues => ({
    periodeFra: dateOrNull(inntekt.periode.fraDato),
    periodeTil: dateOrNull(inntekt.periode.tilDato),
    inntekteneSomLeggesTilGrunn: inntekt.inntekteneSomLeggesTilGrunn.length
        ? gjennomsnittInntektene(inntekt).concat(
              mergeSkattegrunlagAndInntektlist(skattegrunnlager, inntekt.inntekteneSomLeggesTilGrunn, aInntektene)
          )
        : gjennomsnittInntektene(inntekt)
              .concat(mappedSkattegrunnlager(skattegrunnlager))
              .concat(mappedAInntektene(aInntektene)),
    utvidetBarnetrygd: inntekt.utvidetBarnetrygd.length
        ? inntekt.utvidetBarnetrygd.map((utvidetBarnetrygd) => ({
              ...utvidetBarnetrygd,
              deltBosted: utvidetBarnetrygd.deltBosted,
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
    begrunnelseIVedtaket: inntekt.begrunnelseIVedtaket,
    begrunnelseINotat: inntekt.begrunnelseINotat,
    toTrinnsKontroll: inntekt.toTrinnsKontroll,
});

const transformSkattegrunnlager = (year) =>
    year.grunnlag.map((grunnlag) => ({
        fraDato: null,
        tilDato: null,
        beskrivelse: `${tekniksNavnToBeskrivelse[grunnlag.tekniskNavn]} ${year.skatteoppgjoersdato}`,
        tekniskNavn: grunnlag.tekniskNavn.toLowerCase(),
        totalt: grunnlag.beloep,
        aar: year.skatteoppgjoersdato,
        selected: false,
        fraPostene: true,
    }));

const transformInntekt = (inntekt) => ({
    ...inntekt,
    fraDato: dateOrNull(inntekt.fraDato),
    tilDato: dateOrNull(inntekt.tilDato),
    selected: true,
});

const transformAInntekt = (inntekt) => ({
    fraDato: null,
    tilDato: null,
    beskrivelse: `${tekniksNavnToBeskrivelse[inntekt.tekniskNavn]} ${inntekt.aar}`,
    tekniskNavn: inntekt.tekniskNavn.toLowerCase(),
    totalt: inntekt.beloep,
    aar: inntekt.aar,
    fraPostene: true,
    selected: false,
});

const gjennomsnittInntektene = (inntekt) =>
    [
        {
            fraDato: null,
            tilDato: null,
            beskrivelse: "3 måneder beregnet",
            totalt: inntekt.gjennomsnittInntektSisteTreMaaneder.aarsInntekt,
            tekniskNavn: "gjennomsnitt_siste_tre_maaneder",
            aar: new Date().getFullYear().toString(),
            selected: false,
            fraPostene: true,
        },
        {
            fraDato: null,
            tilDato: null,
            beskrivelse: "12 måneder beregnet",
            totalt: inntekt.gjennomsnittInntektSisteTolvMaaneder.aarsInntekt,
            tekniskNavn: "gjennomsnitt_siste_tolv_maaneder",
            aar: new Date().getFullYear().toString(),
            selected: false,
            fraPostene: true,
        },
    ].filter((gjennomsnittInntekt) =>
        filterOutSelectedIncomes(gjennomsnittInntekt, inntekt.inntekteneSomLeggesTilGrunn)
    );

const filterOutSelectedIncomes = (inntektFraPostene, inntekteneSomLeggesTilGrunn) => {
    const exists = inntekteneSomLeggesTilGrunn.find(
        (inntekt) => inntekt.beskrivelse.toLowerCase() === inntektFraPostene.beskrivelse.toLowerCase()
    );
    return !exists;
};
const mappedSkattegrunnlager = (skattegrunnlager) => skattegrunnlager.map(transformSkattegrunnlager).flat();
const mappedAInntektene = (aInntektene) => aInntektene.map(transformAInntekt);
const mergeSkattegrunlagAndInntektlist = (skattegrunnlager, inntektene, aInntektene) =>
    mappedSkattegrunnlager(skattegrunnlager)
        .filter((skattegrunnlag) => filterOutSelectedIncomes(skattegrunnlag, inntektene))
        .concat(inntektene.map(transformInntekt))
        .concat(mappedAInntektene(aInntektene).filter((aInntekt) => filterOutSelectedIncomes(aInntekt, inntektene)))
        .sort((a, b) => a.fraDato - b.fraDato);

const findPeriodeIndex = (inntekteneSomLeggesTilGrunn, periode) =>
    inntekteneSomLeggesTilGrunn.findIndex(
        (inntekt) => inntekt.aar === periode.aar && inntekt.tekniskNavn === periode.tekniskNavn
    );
export const syncDates = (
    selected,
    inntekteneSomLeggesTilGrunn,
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
            setValue(`inntekteneSomLeggesTilGrunn.${Number(forstePostPeriodeIndex)}.fraDato`, virkningstidspunkt);
        }

        if (!preSelectedPerioder.length && postSelectedPerioder.length > 1) {
            const forstePostPeriode = postSelectedPerioder[0];
            const forstePostPeriodeIndex = findPeriodeIndex(inntekteneSomLeggesTilGrunn, forstePostPeriode);
            if (!(new Date(forstePostPeriode.aar).getFullYear() < virkningstidspunkt.getFullYear())) {
                setValue(`inntekteneSomLeggesTilGrunn.${Number(forstePostPeriodeIndex)}.fraDato`, virkningstidspunkt);
            }
        }

        if (preSelectedPerioder.length === 1 && !postSelectedPerioder.length) {
            const sistePrePeriode = preSelectedPerioder[0];
            const sistePrePeriodeIndex = findPeriodeIndex(inntekteneSomLeggesTilGrunn, sistePrePeriode);
            setValue(`inntekteneSomLeggesTilGrunn.${Number(sistePrePeriodeIndex)}.tilDato`, null);
            setValue(`inntekteneSomLeggesTilGrunn.${Number(sistePrePeriodeIndex)}.fraDato`, virkningstidspunkt);
        } else if (preSelectedPerioder.length) {
            const sistePrePeriode = preSelectedPerioder[preSelectedPerioder.length - 1];
            const sistePrePeriodeIndex = findPeriodeIndex(inntekteneSomLeggesTilGrunn, sistePrePeriode);
            if (postSelectedPerioder.length) {
                setValue(`inntekteneSomLeggesTilGrunn.${Number(sistePrePeriodeIndex)}.tilDato`, fieldValue.tilDato);
                if (!inntekteneSomLeggesTilGrunn[sistePrePeriodeIndex].fraDato) {
                    setValue(`inntekteneSomLeggesTilGrunn.${Number(sistePrePeriodeIndex)}.fraDato`, fieldValue.fraDato);
                }
            }

            if (!postSelectedPerioder.length) {
                setValue(`inntekteneSomLeggesTilGrunn.${Number(sistePrePeriodeIndex)}.tilDato`, null);
            }
        }
        setValue(`inntekteneSomLeggesTilGrunn.${Number(index)}.fraDato`, null);
        setValue(`inntekteneSomLeggesTilGrunn.${Number(index)}.tilDato`, null);
        clearErrors(`inntekteneSomLeggesTilGrunn.${Number(index)}.fraDato`);
        clearErrors(`inntekteneSomLeggesTilGrunn.${Number(index)}.tilDato`);
        return;
    }

    if (!innhentendeTotalsummertInntekter.includes(fieldValue.tekniskNavn)) {
        return;
    }

    if (
        perioderSomKanIkkeOverlapeKunMedHverandre.includes(fieldValue.tekniskNavn) ||
        gjennomsnittPerioder.includes(fieldValue.tekniskNavn)
    ) {
        setValue(`inntekteneSomLeggesTilGrunn.${Number(index)}.fraDato`, virkningstidspunkt);
    } else {
        const fraDato =
            !preSelectedPerioder.length || periodeErFraSammeAarSomVirkningsTidspunkt
                ? virkningstidspunkt
                : selectedFirstDayOfPeriod;
        const tilDato = postSelectedPerioder.length
            ? deductDays(new Date(new Date(postSelectedPerioder[0].aar).getFullYear(), 0, 1), 1)
            : null;

        if (periodeErFoerVirkningsTidspunkt && postSelectedPerioder.length) {
            setError(`inntekteneSomLeggesTilGrunn.${Number(index)}.fraDato`, {
                type: "invalid",
                message: "Dato må settes manuelt",
            });
            return;
        }

        setValue(`inntekteneSomLeggesTilGrunn.${Number(index)}.fraDato`, fraDato);
        setValue(`inntekteneSomLeggesTilGrunn.${Number(index)}.tilDato`, tilDato);

        if (
            (periodeErFraSammeAarSomVirkningsTidspunkt || periodeErFoerVirkningsTidspunkt) &&
            preSelectedPerioder.length
        ) {
            const preSelectedPerioderIndexes = preSelectedPerioder.map((periode) =>
                findPeriodeIndex(inntekteneSomLeggesTilGrunn, periode)
            );
            preSelectedPerioderIndexes.forEach((index) => {
                setValue(`inntekteneSomLeggesTilGrunn.${Number(index)}.selected`, false);
                setValue(`inntekteneSomLeggesTilGrunn.${Number(index)}.fraDato`, null);
                setValue(`inntekteneSomLeggesTilGrunn.${Number(index)}.tilDato`, null);
            });
        } else if (preSelectedPerioder.length) {
            const sistePrePeriode = preSelectedPerioder[preSelectedPerioder.length - 1];
            const sistePrePeriodeIndex = findPeriodeIndex(inntekteneSomLeggesTilGrunn, sistePrePeriode);
            setValue(`inntekteneSomLeggesTilGrunn.${Number(sistePrePeriodeIndex)}.tilDato`, deductDays(fraDato, 1));
        }

        if (postSelectedPerioder.length) {
            const forstePostPeriode = postSelectedPerioder[0];
            const forstePostPeriodeIndex = findPeriodeIndex(inntekteneSomLeggesTilGrunn, forstePostPeriode);
            setValue(`inntekteneSomLeggesTilGrunn.${Number(forstePostPeriodeIndex)}.fraDato`, addDays(tilDato, 1));
        }
    }
};

export const findDateGaps = (perioder, virkningstidspunkt) => {
    const filteredAndSortedPerioder = perioder
        .filter((periode) => periode.fraDato !== null)
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

export const getOverlappingPeriods = (perioder) => {
    const ytelsePerioder = perioder
        .filter((periode) => periode.fraDato !== null && perioderSomIkkeKanOverlape.includes(periode.tekniskNavn))
        .sort((a, b) => a.fraDato - b.fraDato);
    const overlappingPeriods = [];

    const pushOverlappingPeriods = (filteredAndSortedPerioder) => {
        for (let i = 0; i < filteredAndSortedPerioder.length; i++) {
            for (let j = i + 1; j < filteredAndSortedPerioder.length; j++) {
                if (
                    (filteredAndSortedPerioder[i].tilDato === null ||
                        filteredAndSortedPerioder[i].tilDato >= filteredAndSortedPerioder[j].fraDato) &&
                    (filteredAndSortedPerioder[j].tilDato === null ||
                        filteredAndSortedPerioder[j].tilDato >= filteredAndSortedPerioder[i].fraDato)
                ) {
                    overlappingPeriods.push([
                        `${filteredAndSortedPerioder[i].beskrivelse}`,
                        `${filteredAndSortedPerioder[j].beskrivelse}`,
                    ]);
                }
            }
        }
    };

    pushOverlappingPeriods(ytelsePerioder);

    perioderSomKanIkkeOverlapeKunMedHverandre.forEach((tekniskNavn) => {
        const filteredAndSortedPerioder = perioder
            .filter((periode) => periode.fraDato !== null && periode.tekniskNavn === tekniskNavn)
            .sort((a, b) => a.fraDato - b.fraDato);

        pushOverlappingPeriods(filteredAndSortedPerioder);
    });

    return overlappingPeriods;
};
