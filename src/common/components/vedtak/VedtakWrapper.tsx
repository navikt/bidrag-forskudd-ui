import { Alert, BodyShort, ErrorSummary, Heading } from "@navikt/ds-react";
import { Fragment, PropsWithChildren } from "react";

import {
    InntektValideringsfeil,
    MaBekrefteNyeOpplysninger,
    OpplysningerType,
    Rolletype,
    TypeBehandling,
} from "../../../api/BidragBehandlingApiV1";
import { BarnebidragStepper } from "../../../barnebidrag/enum/BarnebidragStepper";
import { ForskuddStepper } from "../../../forskudd/enum/ForskuddStepper";
import { SærligeutgifterStepper } from "../../../særbidrag/enum/SærligeutgifterStepper";
import { VedtakBeregningFeil } from "../../../types/vedtakTypes";
import behandlingQueryKeys from "../../constants/behandlingQueryKeys";
import elementIds from "../../constants/elementIds";
import texts, { mapOpplysningtypeSomMåBekreftesTilFeilmelding, rolletypeTilVisningsnavn } from "../../constants/texts";
import { useBehandlingProvider } from "../../context/BehandlingContext";
import { useGetBehandlingV2 } from "../../hooks/useApiData";
type STEPSTYPE =
    | { [_key in ForskuddStepper]: number }
    | { [_key in SærligeutgifterStepper]: number }
    | { [_key in BarnebidragStepper]: number };
type VedtakWrapperProps = {
    feil: VedtakBeregningFeil;
    steps: STEPSTYPE;
};

const validerForRoller = {
    [TypeBehandling.FORSKUDD]: [Rolletype.BM],
    [TypeBehandling.SAeRBIDRAG]: [Rolletype.BA, Rolletype.BM, Rolletype.BP],
    [TypeBehandling.BIDRAG]: [Rolletype.BA, Rolletype.BM, Rolletype.BP],
};

export default function VedtakWrapper({ feil, steps, children }: PropsWithChildren<VedtakWrapperProps>) {
    const { onStepChange } = useBehandlingProvider();
    const { type } = useGetBehandlingV2();
    function renderFeilmeldinger() {
        if (!feil?.detaljer) return null;
        const feilInnhold = feil?.detaljer;
        let feilliste = [];
        if (feilInnhold.utgift != null && "utgift" in steps) {
            const feillisteUtgifter = [];
            if (feilInnhold.utgift.manglerUtgifter) {
                feillisteUtgifter.push(
                    <ErrorSummary.Item href="#" onClick={() => onStepChange(steps.utgift)}>
                        Utgift: Minst en utgift må legges til
                    </ErrorSummary.Item>
                );
            }
            if (feilInnhold.utgift.maksGodkjentBeløp?.manglerBeløp === true) {
                feillisteUtgifter.push(
                    <ErrorSummary.Item href="#" onClick={() => onStepChange(steps.utgift)}>
                        Utgift: Maks godkjent beløp må fylles ut når godkjent beløp skal skjønnsjusteres
                    </ErrorSummary.Item>
                );
            }
            if (feilInnhold.utgift.maksGodkjentBeløp?.manglerBegrunnelse === true) {
                feillisteUtgifter.push(
                    <ErrorSummary.Item href="#" onClick={() => onStepChange(steps.utgift)}>
                        Utgift: Begrunnelse på maks godkjent beløp må fylles ut når godkjent beløp skal skjønnsjusteres
                    </ErrorSummary.Item>
                );
            }
            if (feillisteUtgifter.length === 0) {
                feillisteUtgifter.push(
                    <ErrorSummary.Item href="#" onClick={() => onStepChange(steps.utgift)}>
                        Utgift
                    </ErrorSummary.Item>
                );
            }
            feilliste.push(...feillisteUtgifter);
        }
        if (feilInnhold.underholdskostnad != null && "underholdskostnad" in steps) {
            feilInnhold.underholdskostnad.forEach((value) => {
                feilliste.push(
                    <ErrorSummary.Item
                        href={`#${elementIds.seksjon_underholdskostnader}_${value.underholdskostnadId}`}
                        onClick={() => onStepChange(steps.samvær)}
                    >
                        Underholdskostnad: Perioder for barn {value.barn.navn}
                    </ErrorSummary.Item>
                );
                if (value.manglerPerioderForTilsynsutgifter) {
                    feilliste.push(
                        <ErrorSummary.Item
                            href={`#${elementIds.seksjon_underholdskostnader}_${value.underholdskostnadId}`}
                            onClick={() => onStepChange(steps.samvær)}
                        >
                            Underholdskostnad: Mangler tilsynsutgifter for barn {value.barn.navn}
                        </ErrorSummary.Item>
                    );
                }
            });
        }
        if (feilInnhold.samvær != null && "samvær" in steps) {
            feilInnhold.samvær.forEach((value) => {
                if (value.harPeriodiseringsfeil)
                    feilliste.push(
                        <ErrorSummary.Item
                            href={`#${elementIds.seksjon_samvær}_${value.samværId}`}
                            onClick={() => onStepChange(steps.samvær)}
                        >
                            Samvær: Perioder for barn {value.gjelderBarnNavn}
                        </ErrorSummary.Item>
                    );
                if (value.manglerBegrunnelse)
                    feilliste.push(
                        <ErrorSummary.Item
                            href={`#${elementIds.seksjon_samvær}_${value.samværId}`}
                            onClick={() => onStepChange(steps.samvær)}
                        >
                            Samvær: Mangler begrunnelse for barn {value.gjelderBarnNavn}
                        </ErrorSummary.Item>
                    );
            });
        }
        if (feilInnhold.husstandsmedlem != null) {
            feilInnhold.husstandsmedlem.forEach((value) =>
                feilliste.push(
                    <ErrorSummary.Item
                        href={`#${elementIds.seksjon_boforhold}_${value.barn.husstandsmedlemId}`}
                        onClick={() => onStepChange(steps.boforhold)}
                    >
                        Boforhold: Perioder for barn {value.barn.navn}
                    </ErrorSummary.Item>
                )
            );
        }

        if (feilInnhold.andreVoksneIHusstanden != null) {
            feilliste.push(
                <ErrorSummary.Item
                    href={`#${elementIds.seksjon_andreVoksneIHusstand}`}
                    onClick={() => onStepChange(steps.boforhold)}
                >
                    {feilInnhold.andreVoksneIHusstanden.manglerPerioder
                        ? "Mangler perioder for andre voksne i husstanden"
                        : "Andre voksne i husstanden har ugyldige perioder"}
                </ErrorSummary.Item>
            );
        }
        if (feilInnhold.sivilstand != null) {
            feilliste.push(
                <ErrorSummary.Item
                    href={`#${elementIds.seksjon_sivilstand}`}
                    onClick={() => onStepChange(steps.boforhold)}
                >
                    Sivilstand har ugyldige perioder
                </ErrorSummary.Item>
            );
        }
        if (feilInnhold.inntekter != null) {
            feilliste = [
                ...feilliste,
                ...validerInntekt(
                    texts.title.skattepliktigeogPensjonsgivendeInntekt,
                    elementIds.seksjon_inntekt_skattepliktig,
                    feilInnhold.inntekter.årsinntekter
                ),
                ...validerInntekt(
                    texts.title.barnetillegg,
                    elementIds.seksjon_inntekt_barnetillegg,
                    feilInnhold.inntekter.barnetillegg
                ),

                ...validerInntekt(
                    texts.title.kontantstøtte,
                    elementIds.seksjon_inntekt_kontantstøtte,
                    feilInnhold.inntekter.kontantstøtte
                ),
                ...validerInntekt(
                    texts.title.utvidetBarnetrygd,
                    elementIds.seksjon_inntekt_utvidetbarnetrygd,
                    feilInnhold.inntekter.utvidetBarnetrygd
                ),
                ...validerInntekt(
                    texts.title.småbarnstillegg,
                    elementIds.seksjon_inntekt_småbarnstillegg,
                    feilInnhold.inntekter.småbarnstillegg
                ),
            ];
        }
        feilInnhold.måBekrefteNyeOpplysninger
            ?.filter((a) => a.type !== OpplysningerType.BOFORHOLD || a.gjelderBarn != null)
            ?.forEach((value) => {
                feilliste.push(
                    <ErrorSummary.Item
                        href={`#${opplysningTilElementId(value)}`}
                        onClick={() =>
                            onStepChange(opplysningTilStep(value, steps), {
                                [behandlingQueryKeys.inntektTab]: value.rolle?.id?.toString(),
                            })
                        }
                    >
                        {mapOpplysningtypeSomMåBekreftesTilFeilmelding(value, type)}
                    </ErrorSummary.Item>
                );
            });
        return feilliste;
    }
    if (feil) {
        if (!feil?.detaljer) {
            return (
                <Alert variant={"error"} size="small">
                    <Heading spacing size="small" level="3">
                        {texts.error.ukjentfeil}
                    </Heading>
                    <BodyShort>{texts.error.beregning}</BodyShort>
                </Alert>
            );
        }
        return (
            <ErrorSummary heading={texts.varsel.beregneFeil} size="small">
                {renderFeilmeldinger().map((Component, index) => (
                    <Fragment key={`feilmelding ${index}`}>{Component}</Fragment>
                ))}
            </ErrorSummary>
        );
    }

    function validerInntekt(
        tekst: string,
        elementId: string,
        inntektvalideringsfeil?: InntektValideringsfeil | InntektValideringsfeil[]
    ) {
        const feilliste = [];
        if (!inntektvalideringsfeil) return feilliste;
        if (Array.isArray(inntektvalideringsfeil)) {
            validerForRoller[type].forEach((rolletype) => {
                const valideringsfeil = inntektvalideringsfeil.find((a) => a.rolle.rolletype === rolletype);
                valideringsfeil &&
                    feilliste.push(
                        <ErrorSummary.Item
                            href={`#${elementId}`}
                            onClick={() =>
                                onStepChange(steps.inntekt, {
                                    [behandlingQueryKeys.inntektTab]: valideringsfeil.rolle?.id?.toString(),
                                })
                            }
                        >
                            Inntekter: Perioder i {tekst.toLowerCase()}{" "}
                            {type !== TypeBehandling.FORSKUDD
                                ? ` for ${rolletypeTilVisningsnavn(valideringsfeil.rolle)}`
                                : ""}
                        </ErrorSummary.Item>
                    );
            });
        } else {
            feilliste.push(
                <ErrorSummary.Item
                    href={`#${elementId}`}
                    onClick={() =>
                        onStepChange(steps.inntekt, {
                            [behandlingQueryKeys.inntektTab]: inntektvalideringsfeil.rolle?.id?.toString(),
                        })
                    }
                >
                    Inntekter: Perioder i {tekst.toLowerCase()}{" "}
                    {type !== TypeBehandling.FORSKUDD
                        ? ` for ${rolletypeTilVisningsnavn(inntektvalideringsfeil.rolle)}`
                        : ""}
                </ErrorSummary.Item>
            );
        }
        return feilliste;
    }

    return <>{children}</>;
}

const opplysningTilStep = (opplysningstype: MaBekrefteNyeOpplysninger, steps: STEPSTYPE) => {
    switch (opplysningstype.type) {
        case OpplysningerType.SKATTEPLIKTIGE_INNTEKTER:
        case OpplysningerType.SMABARNSTILLEGG:
        case OpplysningerType.UTVIDET_BARNETRYGD:
        case OpplysningerType.BARNETILLEGG:
        case OpplysningerType.KONTANTSTOTTE:
            return steps.inntekt;
        case OpplysningerType.SIVILSTAND:
        case OpplysningerType.BOFORHOLD_ANDRE_VOKSNE_I_HUSSTANDEN:
        case OpplysningerType.BOFORHOLD:
            return steps.boforhold;
    }
};
const opplysningTilElementId = (opplysninger: MaBekrefteNyeOpplysninger) => {
    switch (opplysninger.type) {
        case OpplysningerType.SKATTEPLIKTIGE_INNTEKTER:
            return elementIds.seksjon_inntekt_skattepliktig;
        case OpplysningerType.SMABARNSTILLEGG:
            return elementIds.seksjon_inntekt_småbarnstillegg;
        case OpplysningerType.UTVIDET_BARNETRYGD:
            return elementIds.seksjon_inntekt_utvidetbarnetrygd;
        case OpplysningerType.BARNETILLEGG:
            return elementIds.seksjon_inntekt_barnetillegg;
        case OpplysningerType.KONTANTSTOTTE:
            return elementIds.seksjon_inntekt_kontantstøtte;
        case OpplysningerType.BOFORHOLD:
            return opplysninger.gjelderBarn?.husstandsmedlemId
                ? `${elementIds.seksjon_boforhold}_${opplysninger.gjelderBarn?.husstandsmedlemId}`
                : `${elementIds.seksjon_boforhold}`;
        case OpplysningerType.SIVILSTAND:
            return elementIds.seksjon_sivilstand;
        case OpplysningerType.BOFORHOLD_ANDRE_VOKSNE_I_HUSSTANDEN:
            return elementIds.seksjon_andreVoksneIHusstand;
    }
};
