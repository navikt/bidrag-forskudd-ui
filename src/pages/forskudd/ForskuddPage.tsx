import { BidragContainer } from "@navikt/bidrag-ui-common";
import { Alert, Heading, Stepper } from "@navikt/ds-react";
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
    const { activeStep, setActiveStep } = useForskudd();
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
                        onStepChange={(x) => setActiveStep(x)}
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
                                (inntektValideringsfeil == null || !Object.keys(inntektValideringsfeil).length)
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
        </PageWrapper>
    );
};
