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

export const createInitialValues = (inntekt, skattegrunnlager): InntektFormValues => ({
    periodeFra: dateOrNull(inntekt.periode.fraDato),
    periodeTil: dateOrNull(inntekt.periode.tilDato),
    inntekteneSomLeggesTilGrunn: inntekt.inntekteneSomLeggesTilGrunn.length
        ? gjennomsnittInntektene(inntekt).concat(
              mergeSkattegrunlagAndInntektlist(skattegrunnlager, inntekt.inntekteneSomLeggesTilGrunn)
          )
        : gjennomsnittInntektene(inntekt).concat(mappedSkattegrunnlager(skattegrunnlager)),
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
        fraDato: new Date(year.skatteoppgjoersdato),
        tilDato: new Date(year.skatteoppgjoersdato, 12, 0),
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

const gjennomsnittInntektene = (inntekt) =>
    [
        {
            fraDato: new Date(),
            tilDato: new Date(new Date().getFullYear(), 12, 0),
            beskrivelse: "3 måneder beregnet",
            totalt: inntekt.gjennomsnittInntektSisteTreMaaneder.aarsInntekt,
            selected: false,
            fraPostene: true,
        },
        {
            fraDato: new Date(),
            tilDato: new Date(new Date().getFullYear(), 12, 0),
            beskrivelse: "12 måneder beregnet",
            totalt: inntekt.gjennomsnittInntektSisteTolvMaaneder.aarsInntekt,
            selected: false,
            fraPostene: true,
        },
    ].filter((gjennomsnittInntekt) =>
        filterOutSelectedIncomes(gjennomsnittInntekt, inntekt.inntekteneSomLeggesTilGrunn)
    );

const filterOutSelectedIncomes = (inntektFraPostene, inntekteneSomLeggesTilGrunn) => {
    const exists = inntekteneSomLeggesTilGrunn.find((inntekt) => inntekt.beskrivelse === inntektFraPostene.beskrivelse);
    return !exists;
};
const mappedSkattegrunnlager = (skattegrunnlager) => skattegrunnlager.map(transformSkattegrunnlager).flat();
const mergeSkattegrunlagAndInntektlist = (skattegrunnlager, inntektene) =>
    mappedSkattegrunnlager(skattegrunnlager)
        .filter((skattegrunnlag) => filterOutSelectedIncomes(skattegrunnlag, inntektene))
        .concat(inntektene.map(transformInntekt))
        .sort((a, b) => a.fraDato - b.fraDato);
