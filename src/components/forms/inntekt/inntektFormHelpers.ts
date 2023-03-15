import { InntektFormValues } from "../../../types/inntektFormValues";
import { dateOrNull, toISOStringOrNull } from "../../../utils/date-utils";

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
        : [
              {
                  fraDato: null,
                  tilDato: null,
                  deltBosted: false,
                  beloep: "",
              },
          ],
    barnetillegg: inntekt.barnetillegg.length
        ? inntekt.barnetillegg.map((barnetilleg) => ({
              ...barnetilleg,
              fraDato: dateOrNull(barnetilleg.fraDato),
              tilDato: dateOrNull(barnetilleg.tilDato),
          }))
        : [
              {
                  fraDato: null,
                  tilDato: null,
                  barn: { navn: "", foedselnummer: "" },
                  brutto: "",
                  skattesats: "",
                  netto: "",
              },
          ],
    begrunnelseIVedtaket: inntekt.begrunnelseIVedtaket,
    begrunnelseINotat: inntekt.begrunnelseINotat,
    toTrinnsKontroll: inntekt.toTrinnsKontroll,
});

const transformSkattegrunnlager = (year) =>
    year.grunnlag.map((grunnlag) => ({
        fraDato: null,
        tilDato: null,
        beskrivelse: `${grunnlag.tekniskNavn} ${year.skatteoppgjoersdato}`,
        totalt: grunnlag.beloep,
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
    beskrivelse: `${inntekt.tekniskNavn} ${inntekt.aar}`,
    totalt: inntekt.beloep,
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
            selected: false,
            fraPostene: true,
        },
        {
            fraDato: null,
            tilDato: null,
            beskrivelse: "12 måneder beregnet",
            totalt: inntekt.gjennomsnittInntektSisteTolvMaaneder.aarsInntekt,
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

// saksbehandlers registrerte inntekter og enkeltinntekter bør ikke overlape med innhentedeTotalsummerteInntekter
// enkeltinntekter av samme type bør ikke overlape
// saksbehandlers registrerte inntekter av samme type bør ikke overlape
// innhentedeTotalsummerteInntekter - de bør ikke overlapper med andre perioder i samme kategori og av samme gruppe
// innhentedeTotalsummerteInntekter - kapitalinntekt og næringsinntekter kan løpe i parallell med Lønn og trekk eller Skattegrunnlag
