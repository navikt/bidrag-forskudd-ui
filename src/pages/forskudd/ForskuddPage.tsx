import { Stepper } from "@navikt/ds-react";
import React from "react";

import FormWrapper from "../../components/forms/FormWrapper";
import { STEPS } from "../../constants/steps";
import { useForskudd } from "../../context/ForskuddContext";
import { ForskuddStepper } from "../../enum/ForskuddStepper";
import { capitalize } from "../../utils/string-utils";
import PageWrapper from "../PageWrapper";
export const ForskuddPage = () => {
    const { activeStep, setActiveStep } = useForskudd();

    return (
        <PageWrapper name="tracking-wide">
            <div className="max-w-[1280px] mx-auto px-6 py-6">
                <Stepper
                    aria-labelledby="stepper-heading"
                    activeStep={STEPS[activeStep]}
                    onStepChange={(x) => setActiveStep(x)}
                    orientation="horizontal"
                    className="mb-8"
                >
                    <Stepper.Step>{capitalize(ForskuddStepper.VIRKNINGSTIDSPUNKT)}</Stepper.Step>
                    <Stepper.Step>{capitalize(ForskuddStepper.BOFORHOLD)}</Stepper.Step>
                    <Stepper.Step>{capitalize(ForskuddStepper.INNTEKT)}</Stepper.Step>
                    <Stepper.Step>{capitalize(ForskuddStepper.VEDTAK)}</Stepper.Step>
                </Stepper>
                <FormWrapper />
            </div>
        </PageWrapper>
    );
};
