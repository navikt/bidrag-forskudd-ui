import { Alert, BodyShort, ErrorSummary, Heading } from "@navikt/ds-react";
import { Fragment, PropsWithChildren } from "react";

import {
    InntektValideringsfeil,
    MaBekrefteNyeOpplysninger,
    OpplysningerType,
    RolleDto,
    Rolletype,
    TypeBehandling,
} from "../../../api/BidragBehandlingApiV1";
import { ForskuddStepper } from "../../../forskudd/enum/ForskuddStepper";
import { SærligeutgifterStepper } from "../../../særbidrag/enum/SærligeutgifterStepper";
import { VedtakBeregningFeil } from "../../../types/vedtakTypes";
import behandlingQueryKeys from "../../constants/behandlingQueryKeys";
import elementIds from "../../constants/elementIds";
import texts, { mapOpplysningtypeSomMåBekreftesTilFeilmelding } from "../../constants/texts";
import { useBehandlingProvider } from "../../context/BehandlingContext";
import { useGetBehandlingV2 } from "../../hooks/useApiData";
type STEPSTYPE = { [key in ForskuddStepper]: number } | { [key in SærligeutgifterStepper]: number };
type VedtakWrapperProps = {
    feil: VedtakBeregningFeil;
    steps: STEPSTYPE;
};

const validerForRoller = {
    [TypeBehandling.FORSKUDD]: [Rolletype.BM],
    [TypeBehandling.SAeRBIDRAG]: [Rolletype.BA, Rolletype.BM, Rolletype.BP],
};

export default function VedtakWrapper({ feil, steps, children }: PropsWithChildren<VedtakWrapperProps>) {
    const { onStepChange } = useBehandlingProvider();
    const { type } = useGetBehandlingV2();
    function renderFeilmeldinger() {
        if (!feil?.detaljer) return null;
        const feilInnhold = feil?.detaljer;
        let feilliste = [];
        if (feilInnhold.utgift != null && "utgifter" in steps) {
            const beskrivelse = feilInnhold.utgift.manglerUtgifter ? "Minst en utgift må legges til" : "Utgifter";
            feilliste.push(
                <ErrorSummary.Item href="#" onClick={() => onStepChange(steps.utgifter)}>
                    {beskrivelse}
                </ErrorSummary.Item>
            );
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
                        onClick={() => onStepChange(opplysningTilStep(value.type, steps))}
                    >
                        {mapOpplysningtypeSomMåBekreftesTilFeilmelding(value)}
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

const rolletypeTilVisningsnavn = (rolle?: RolleDto): string => {
    if (!rolle) return "";
    switch (rolle.rolletype) {
        case Rolletype.BM:
            return "Bidragsmottaker";
        case Rolletype.BA:
            return "Barn";
        case Rolletype.BP:
            return "Bidragspliktig";
        default:
            return rolle.rolletype;
    }
};
const opplysningTilStep = (opplysninger: OpplysningerType, steps: STEPSTYPE) => {
    switch (opplysninger) {
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
