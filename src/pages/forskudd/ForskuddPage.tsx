import { BidragContainer } from "@navikt/bidrag-ui-common";
import { Alert, Heading, Stepper } from "@navikt/ds-react";
import React from "react";

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
    const { virkningstidspunkt, erVedtakFattet } = useGetBehandlingV2();
    const interactive = !virkningstidspunkt.avslag;

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
                        activeStep={STEPS[activeStep]}
                        onStepChange={(x) => setActiveStep(x)}
                        orientation="horizontal"
                        className="mb-8 w-[708px]"
                    >
                        <Stepper.Step>{capitalize(ForskuddStepper.VIRKNINGSTIDSPUNKT)}</Stepper.Step>
                        <Stepper.Step interactive={interactive}>{capitalize(ForskuddStepper.BOFORHOLD)}</Stepper.Step>
                        <Stepper.Step interactive={interactive}>{capitalize(ForskuddStepper.INNTEKT)}</Stepper.Step>
                        <Stepper.Step>{capitalize(ForskuddStepper.VEDTAK)}</Stepper.Step>
                    </Stepper>
                </FlexRow>
                <FormWrapper />
            </BidragContainer>
        </PageWrapper>
    );
};
