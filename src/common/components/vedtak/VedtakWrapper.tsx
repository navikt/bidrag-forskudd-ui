import { Alert, BodyShort, ErrorSummary, Heading } from "@navikt/ds-react";
import { Fragment, PropsWithChildren } from "react";

import { MaBekrefteNyeOpplysninger, OpplysningerType } from "../../../api/BidragBehandlingApiV1";
import { STEPS } from "../../../forskudd/constants/steps";
import { ForskuddStepper } from "../../../forskudd/enum/ForskuddStepper";
import { SærligeutgifterStepper } from "../../../særbidrag/enum/SærligeutgifterStepper";
import { VedtakBeregningFeil } from "../../../types/vedtakTypes";
import elementIds from "../../constants/elementIds";
import texts, { mapOpplysningtypeSomMåBekreftesTilFeilmelding } from "../../constants/texts";
import { useBehandlingProvider } from "../../context/BehandlingContext";
type VedtakWrapperProps = {
    feil: VedtakBeregningFeil;
    steps: { [key in ForskuddStepper]: number } | { [key in SærligeutgifterStepper]: number };
};

export default function VedtakWrapper({ feil, steps, children }: PropsWithChildren<VedtakWrapperProps>) {
    const { onStepChange } = useBehandlingProvider();
    function renderFeilmeldinger() {
        if (!feil?.detaljer) return null;
        const feilInnhold = feil?.detaljer;
        const feilliste = [];
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
                        onClick={() => onStepChange(STEPS.boforhold)}
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
                    onClick={() => onStepChange(STEPS.boforhold)}
                >
                    Sivilstand har ugyldige perioder
                </ErrorSummary.Item>
            );
        }
        if (feilInnhold.inntekter != null) {
            feilInnhold.inntekter.årsinntekter &&
                feilliste.push(
                    <ErrorSummary.Item
                        href={`#${elementIds.seksjon_inntekt_skattepliktig}`}
                        onClick={() => onStepChange(STEPS.inntekt)}
                    >
                        Inntekter: Perioder i {texts.title.skattepliktigeogPensjonsgivendeInntekt.toLowerCase()}
                    </ErrorSummary.Item>
                );
            feilInnhold.inntekter.barnetillegg &&
                feilliste.push(
                    <ErrorSummary.Item
                        href={`#${elementIds.seksjon_inntekt_barnetillegg}`}
                        onClick={() => onStepChange(STEPS.inntekt)}
                    >
                        Inntekter: Perioder i {texts.title.barnetillegg.toLowerCase()}
                    </ErrorSummary.Item>
                );
            feilInnhold.inntekter.kontantstøtte &&
                feilliste.push(
                    <ErrorSummary.Item
                        href={`#${elementIds.seksjon_inntekt_kontantstøtte}`}
                        onClick={() => onStepChange(STEPS.inntekt)}
                    >
                        Inntekter: Perioder i {texts.title.kontantstøtte.toLowerCase()}
                    </ErrorSummary.Item>
                );
            feilInnhold.inntekter.utvidetBarnetrygd &&
                feilliste.push(
                    <ErrorSummary.Item
                        href={`#${elementIds.seksjon_inntekt_utvidetbarnetrygd}`}
                        onClick={() => onStepChange(STEPS.inntekt)}
                    >
                        Inntekter: Perioder i {texts.title.utvidetBarnetrygd.toLowerCase()}
                    </ErrorSummary.Item>
                );
            feilInnhold.inntekter.småbarnstillegg &&
                feilliste.push(
                    <ErrorSummary.Item
                        href={`#${elementIds.seksjon_inntekt_småbarnstillegg}`}
                        onClick={() => onStepChange(STEPS.inntekt)}
                    >
                        Inntekter: Perioder i {texts.title.småbarnstillegg.toLowerCase()}
                    </ErrorSummary.Item>
                );
        }
        feilInnhold.måBekrefteNyeOpplysninger
            ?.filter((a) => a.type !== OpplysningerType.BOFORHOLD || a.gjelderBarn != null)
            ?.forEach((value) => {
                feilliste.push(
                    <ErrorSummary.Item
                        href={`#${opplysningTilElementId(value)}`}
                        onClick={() => onStepChange(opplysningTilStep(value.type))}
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

    return <>{children}</>;
}
const opplysningTilStep = (opplysninger: OpplysningerType) => {
    switch (opplysninger) {
        case OpplysningerType.SKATTEPLIKTIGE_INNTEKTER:
        case OpplysningerType.SMABARNSTILLEGG:
        case OpplysningerType.UTVIDET_BARNETRYGD:
        case OpplysningerType.BARNETILLEGG:
        case OpplysningerType.KONTANTSTOTTE:
            return STEPS.inntekt;
        case OpplysningerType.SIVILSTAND:
        case OpplysningerType.BOFORHOLD_ANDRE_VOKSNE_I_HUSSTANDEN:
        case OpplysningerType.BOFORHOLD:
            return STEPS.boforhold;
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
