import { BidragContainer } from "@navikt/bidrag-ui-common";
import { Stepper } from "@navikt/ds-react";
import React from "react";

import FormWrapper from "../../components/forms/FormWrapper";
import { STEPS } from "../../constants/steps";
import { useForskudd } from "../../context/ForskuddContext";
import { Avslag } from "../../enum/Avslag";
import { ForskuddStepper } from "../../enum/ForskuddStepper";
import { useGetBehandling } from "../../hooks/useApiData";
import { capitalize } from "../../utils/string-utils";
import PageWrapper from "../PageWrapper";
export const ForskuddPage = () => {
    const { activeStep, setActiveStep } = useForskudd();
    const {
        virkningstidspunkt: { årsak },
    } = useGetBehandling();
    const interactive = !Avslag[årsak];

    return (
        <PageWrapper name="tracking-wide">
            <BidragContainer className="container p-6">
                <Stepper
                    aria-labelledby="stepper-heading"
                    activeStep={STEPS[activeStep]}
                    onStepChange={(x) => setActiveStep(x)}
                    orientation="horizontal"
                    className="mb-8"
                >
                    <Stepper.Step>{capitalize(ForskuddStepper.VIRKNINGSTIDSPUNKT)}</Stepper.Step>
                    <Stepper.Step interactive={interactive}>{capitalize(ForskuddStepper.BOFORHOLD)}</Stepper.Step>
                    <Stepper.Step interactive={interactive}>{capitalize(ForskuddStepper.INNTEKT)}</Stepper.Step>
                    <Stepper.Step>{capitalize(ForskuddStepper.VEDTAK)}</Stepper.Step>
                </Stepper>
                <FormWrapper />
            </BidragContainer>
        </PageWrapper>
    );
};
