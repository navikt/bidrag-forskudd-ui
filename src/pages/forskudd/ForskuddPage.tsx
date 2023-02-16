import { Alert, Heading, Stepper } from "@navikt/ds-react";
import { CopyToClipboard } from "@navikt/ds-react-internal";
import React from "react";

import FormWrapper from "../../components/forms/FormWrapper";
import { RolleDetaljer } from "../../components/RolleDetaljer";
import { STEPS } from "../../constants/steps";
import { useForskudd } from "../../context/ForskuddContext";
import { ForskuddStepper } from "../../enum/ForskuddStepper";
import { capitalize } from "../../utils/string-utils";
import PageWrapper from "../PageWrapper";

export interface CommonFormProps {
    setActiveStep: (number) => void;
}

export const ForskuddPage = () => {
    const { sak, roller, activeStep, error, setActiveStep } = useForskudd();

    return (
        <PageWrapper name="tracking-wide">
            <div className="bg-[var(--a-gray-50)]">
                <Heading
                    level="1"
                    size="xlarge"
                    className="px-6 py-2 leading-10 flex items-center gap-x-4 border-[var(--a-border-divider)] border-solid border-b"
                >
                    Søknad om forskudd{" "}
                    <span className="text-base flex items-center font-normal">
                        Saksnr. {sak?.saksnummer}{" "}
                        <CopyToClipboard size="small" copyText={sak?.saksnummer} popoverText="Kopierte saksnummer" />
                    </span>
                </Heading>
                {roller.map((rolle, i) => (
                    <RolleDetaljer key={rolle.fodselsnummer + i} rolle={rolle} />
                ))}
            </div>
            <div className="max-w-[1092px] mx-auto px-6 py-6">
                {error && (
                    <Alert variant="error" className="mb-12">
                        {error}
                    </Alert>
                )}
                <Stepper
                    aria-labelledby="stepper-heading"
                    activeStep={STEPS[activeStep]}
                    onStepChange={(x) => setActiveStep(x)}
                    orientation="horizontal"
                    className="mb-8"
                >
                    <Stepper.Step>{capitalize(ForskuddStepper.VIRKNINGSTIDSPUNKT)}</Stepper.Step>
                    <Stepper.Step>{capitalize(ForskuddStepper.INNTEKT)}</Stepper.Step>
                    <Stepper.Step>{capitalize(ForskuddStepper.BOFORHOLD)}</Stepper.Step>
                    <Stepper.Step>{capitalize(ForskuddStepper.VEDTAK)}</Stepper.Step>
                </Stepper>
                <FormWrapper setActiveStep={setActiveStep} activeStep={activeStep} />
            </div>
        </PageWrapper>
    );
};
