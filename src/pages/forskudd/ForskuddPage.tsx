import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { BidragContainer } from "@navikt/bidrag-ui-common";
import { Alert, Button, Heading, Stepper } from "@navikt/ds-react";
import React from "react";

import { Vedtakstype } from "../../api/BidragBehandlingApiV1";
import FormWrapper from "../../components/forms/FormWrapper";
import { FlexRow } from "../../components/layout/grid/FlexRow";
import { STEPS } from "../../constants/steps";
import { useForskudd } from "../../context/ForskuddContext";
import { ForskuddStepper } from "../../enum/ForskuddStepper";
import { useGetBehandlingV2 } from "../../hooks/useApiData";
import { capitalize } from "../../utils/string-utils";
import PageWrapper from "../PageWrapper";
export const ForskuddPage = () => {
    const { onStepChange, activeStep } = useForskudd();
    const {
        virkningstidspunkt,
        erVedtakFattet,
        vedtakstype,
        inntekter: { valideringsfeil: inntektValideringsfeil },
    } = useGetBehandlingV2();
    const interactive = !virkningstidspunkt.avslag && vedtakstype != Vedtakstype.OPPHOR;
    const activeStepIndex = STEPS[activeStep];

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
                        <Stepper.Step completed={activeStepIndex > 1}>
                            {capitalize(ForskuddStepper.VIRKNINGSTIDSPUNKT)}
                        </Stepper.Step>
                        <Stepper.Step completed={activeStepIndex > 2} interactive={interactive}>
                            {capitalize(ForskuddStepper.BOFORHOLD)}
                        </Stepper.Step>
                        <Stepper.Step
                            completed={
                                activeStepIndex > 3 &&
                                (!inntektValideringsfeil || !Object.keys(inntektValideringsfeil).length)
                            }
                            interactive={interactive}
                        >
                            {capitalize(ForskuddStepper.INNTEKT)}
                        </Stepper.Step>
                        <Stepper.Step completed={erVedtakFattet}>{capitalize(ForskuddStepper.VEDTAK)}</Stepper.Step>
                    </Stepper>
                </FlexRow>
                <FormWrapper />
            </BidragContainer>
            <LovverkKnapper />
        </PageWrapper>
    );
};

function LovverkKnapper() {
    const { activeStep } = useForskudd();

    function renderKnapp(tekst: string, url: string) {
        return (
            <div>
                <Button
                    title={tekst}
                    variant="tertiary"
                    className={`border rounded-xl border-solid`}
                    size="xsmall"
                    icon={<ExternalLinkIcon />}
                    onClick={() => window.open(url, "_blank")}
                >
                    {tekst}
                </Button>
            </div>
        );
    }
    if (activeStep === ForskuddStepper.VEDTAK) return null;
    return (
        <div className="agroup fixed bottom-0 right-0 p-2 flex items-end justify-end w-max h-24 flex-row gap-[5px]">
            {renderKnapp("Lov om bidragsforskudd", "https://lovdata.no/dokument/NL/lov/1989-02-17-2")}
            {activeStep === ForskuddStepper.BOFORHOLD &&
                renderKnapp("Rundskriv til forskuddsloven", "https://lovdata.no/nav/rundskriv/r54-00#KAPITTEL_2-3")}
            {activeStep === ForskuddStepper.INNTEKT &&
                renderKnapp(
                    "Forskrift om inntektsprøving av forskudd",
                    "https://lovdata.no/dokument/SF/forskrift/2003-02-06-125"
                )}
        </div>
    );
}
