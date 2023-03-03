export const createInntektPayload = (values) => ({
    periode: {
        fraDato: toISOStringOrNull(values.periodeFra),
        tilDato: toISOStringOrNull(values.periodeTil),
    },
    inntekteneSomLeggesTilGrunn: values.inntekteneSomLeggesTilGrunn.map((inntekt) => ({
        ...inntekt,
        fraDato: toISOStringOrNull(inntekt.fraDato),
        tilDato: toISOStringOrNull(inntekt.tilDato),
    })),
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

export const createInitialValues = (inntekt) => ({
    periodeFra: dateOrNull(inntekt.periode.fraDato),
    periodeTil: dateOrNull(inntekt.periode.tilDato),
    inntekteneSomLeggesTilGrunn: inntekt.inntekteneSomLeggesTilGrunn.map((inntekt) => ({
        ...inntekt,
        fraDato: dateOrNull(inntekt.fraDato),
        tilDato: dateOrNull(inntekt.tilDato),
    })),
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

export const createSkattegrunlagFields = (inntekt, skattegrunlager) => {
    return skattegrunlager
        .map((year) =>
            year.grunnlag.map((grunnlag) => {
                const ident = createSkattegrunlagIdent(year.skatteoppgjoersdato, grunnlag.tekniskNavn);
                return {
                    [ident]: hasSkattegrunlagMatch(ident, inntekt.inntekteneSomLeggesTilGrunn),
                };
            })
        )
        .flat()
        .reduce((acc, field) => ({ ...acc, ...field }), {});
};

const hasSkattegrunlagMatch = (ident, inntekteneSomLeggesTilGrunn) =>
    inntekteneSomLeggesTilGrunn.some((inntekt) => {
        if (!inntekt.fraDato || !inntekt.beskrivelse) return false;
        const inntektIdent = createSkattegrunlagIdent(inntekt.fraDato.split("-")[0], inntekt.beskrivelse);
        return inntektIdent === ident;
    });

export const createSkattegrunlagIdent = (year, name) => `${year}-${name.replaceAll(" ", "_")}`;

export const syncSkattegrunlagFields = (skattegrunlagFields, watchInntekteneSomLeggesTilGrunn, useFormMethods) =>
    Object.keys(skattegrunlagFields).some((field) => {
        const value = useFormMethods.getValues(field);
        const inInntekteneSomLeggesTilGrunn = watchInntekteneSomLeggesTilGrunn.some(
            (inntekt) => inntekt.ident === field
        );
        if (value && !inInntekteneSomLeggesTilGrunn) {
            useFormMethods.setValue(field, false);
            return true;
        }
    });

const dateOrNull = (dateString?: string): Date | null => (dateString ? new Date(dateString) : null);
const toISOStringOrNull = (date?: Date): string | null => date?.toISOString() ?? null;
