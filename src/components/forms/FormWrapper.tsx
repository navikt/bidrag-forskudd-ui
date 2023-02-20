import { Loader } from "@navikt/ds-react";
import React, { lazy, Suspense, useMemo } from "react";

import { ForskuddStepper } from "../../enum/ForskuddStepper";
const Boforhold = lazy(() => import("./Boforhold"));
const Inntekt = lazy(() => import("./Inntekt"));
const Vedtak = lazy(() => import("./Vedtak"));
const Virkningstidspunkt = lazy(() => import("./Virkningstidspunkt"));

export interface FormWrapperProps {
    setActiveStep: (number) => void;
    activeStep: string;
}

export default function FormWrapper({ activeStep, ...props }: FormWrapperProps) {
    const renderForm = useMemo(() => {
        switch (activeStep) {
            case ForskuddStepper.VIRKNINGSTIDSPUNKT:
                return <Virkningstidspunkt {...props} />;
            case ForskuddStepper.INNTEKT:
                return <Inntekt {...props} />;
            case ForskuddStepper.BOFORHOLD:
                return <Boforhold {...props} />;
            case ForskuddStepper.VEDTAK:
                return <Vedtak {...props} />;
            default:
                return <Virkningstidspunkt {...props} />;
        }
    }, [activeStep]);

    return <Suspense fallback={<Loader size="3xlarge" title="venter..." />}>{renderForm}</Suspense>;
}
