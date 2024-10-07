import { Vedtakstype } from "@api/BidragBehandlingApiV1";
import { FlexRow } from "@common/components/layout/grid/FlexRow";
import { NavigationLoaderWrapper } from "@common/components/NavigationLoaderWrapper";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import PageWrapper from "@common/PageWrapper";
import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { BidragContainer, LocalStorage } from "@navikt/bidrag-ui-common";
import { Alert, Button, Heading, Stepper } from "@navikt/ds-react";
import { capitalize } from "@utils/string-utils";
import React, { useEffect, useState } from "react";

import elementIds from "../../common/constants/elementIds";
import environment from "../../environment";
import FormWrapper from "../components/forms/FormWrapper";
import { STEPS } from "../constants/steps";
import { SærligeutgifterStepper as SærbidragStepper } from "../enum/SærligeutgifterStepper";
export const SærbidragPage = () => {
    const { onStepChange, activeStep } = useBehandlingProvider();
    const {
        erVedtakFattet,
        vedtakstype,
        utgift: { avslag, valideringsfeil: utgiftValideringsfeil },
        boforhold: { valideringsfeil: boforholdValideringsfeil },
        inntekter: { valideringsfeil: inntektValideringsfeil },
        ikkeAktiverteEndringerIGrunnlagsdata,
    } = useGetBehandlingV2();
    const interactive = vedtakstype !== Vedtakstype.OPPHOR && avslag === undefined;
    const activeStepIndex = STEPS[activeStep];

    const inntekterIkkeAktiveGrunnlag = ikkeAktiverteEndringerIGrunnlagsdata?.inntekter
        ? Object.keys(ikkeAktiverteEndringerIGrunnlagsdata.inntekter).flatMap(
              (f) => ikkeAktiverteEndringerIGrunnlagsdata.inntekter[f]
          )
        : [];

    return (
        <PageWrapper name="tracking-wide">
            <BidragContainer className="container p-6">
                {erVedtakFattet && (
                    <Alert variant="info" size="small" className="mb-4 w-max m-auto">
                        <Heading level="3" size="small">
                            Vedtak er fattet
                        </Heading>
                        Vedtak er fattet for behandlingen og kan derfor ikke endres
                    </Alert>
                )}
                <FlexRow className="justify-center">
                    <Stepper
                        aria-labelledby="stepper-heading"
                        activeStep={activeStepIndex}
                        onStepChange={(x) => onStepChange(x)}
                        orientation="horizontal"
                        className="mb-8 w-[708px]"
                    >
                        <Stepper.Step completed={activeStepIndex > 1 && utgiftValideringsfeil === undefined}>
                            {capitalize(SærbidragStepper.UTGIFT)}
                        </Stepper.Step>
                        <Stepper.Step
                            completed={
                                activeStepIndex > 2 &&
                                (!inntektValideringsfeil || !Object.keys(inntektValideringsfeil).length) &&
                                inntekterIkkeAktiveGrunnlag.length === 0
                            }
                            interactive={interactive}
                        >
                            {capitalize(SærbidragStepper.INNTEKT)}
                        </Stepper.Step>
                        <Stepper.Step
                            completed={
                                activeStepIndex > 3 &&
                                (boforholdValideringsfeil?.husstandsmedlem === undefined ||
                                    boforholdValideringsfeil?.husstandsmedlem?.length === 0) &&
                                (ikkeAktiverteEndringerIGrunnlagsdata?.husstandsbarn === undefined ||
                                    ikkeAktiverteEndringerIGrunnlagsdata?.husstandsbarn?.length === 0) &&
                                ikkeAktiverteEndringerIGrunnlagsdata?.andreVoksneIHusstanden === undefined &&
                                boforholdValideringsfeil?.andreVoksneIHusstanden === undefined
                            }
                            interactive={interactive}
                        >
                            {capitalize(SærbidragStepper.BOFORHOLD)}
                        </Stepper.Step>
                        <Stepper.Step completed={erVedtakFattet}>{capitalize(SærbidragStepper.VEDTAK)}</Stepper.Step>
                    </Stepper>
                </FlexRow>
                <NavigationLoaderWrapper>
                    <FormWrapper />
                </NavigationLoaderWrapper>
            </BidragContainer>
        </PageWrapper>
    );
};

function BrukerveiledningKnapp() {
    const nudgeEnabledName = "brukerveiledningShowNudge";
    const { activeStep } = useBehandlingProvider();
    const [nudge, setNudge] = useState(LocalStorage.get(nudgeEnabledName) !== "false");

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setNudge(false);
            LocalStorage.set(nudgeEnabledName, "false");
        }, 5000);
        return () => clearTimeout(timeoutId);
    }, []);
    function renderHref() {
        switch (activeStep) {
            case SærbidragStepper.BOFORHOLD:
                return elementIds.brukerveildning.tittel_boforhold;
            case SærbidragStepper.INNTEKT:
                return elementIds.brukerveildning.tittel_inntekt;
            case SærbidragStepper.VEDTAK:
                return elementIds.brukerveildning.tittel_vedtak;
            case SærbidragStepper.UTGIFT:
                return elementIds.brukerveildning.tittel_utgift;
            default:
                return "";
        }
    }
    return (
        <div>
            <Button
                title="Brukerveiledning"
                variant="tertiary"
                className={`rounded-xl border-solid ${
                    nudge ? "animate-bounce border-[var(--a-border-success)] border-[2px]" : "border"
                } `}
                size="xsmall"
                icon={<ExternalLinkIcon />}
                onClick={() => window.open(environment.url.særbidragBrukerveiledning + "#" + renderHref(), "_blank")}
            >
                Brukerveiledning
            </Button>
        </div>
    );
}
