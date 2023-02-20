import { Loader } from "@navikt/ds-react";
import React, { lazy, Suspense, useMemo } from "react";

import { useForskudd } from "../../context/ForskuddContext";
import { ForskuddStepper } from "../../enum/ForskuddStepper";
const Boforhold = lazy(() => import("./Boforhold"));
const Inntekt = lazy(() => import("./Inntekt"));
const Vedtak = lazy(() => import("./Vedtak"));
const Virkningstidspunkt = lazy(() => import("./Virkningstidspunkt"));

export default function FormWrapper() {
    const { activeStep } = useForskudd();
    const renderForm = useMemo(() => {
        switch (activeStep) {
            case ForskuddStepper.VIRKNINGSTIDSPUNKT:
                return <Virkningstidspunkt />;
            case ForskuddStepper.INNTEKT:
                return <Inntekt />;
            case ForskuddStepper.BOFORHOLD:
                return <Boforhold />;
            case ForskuddStepper.VEDTAK:
                return <Vedtak />;
            default:
                return <Virkningstidspunkt />;
        }
    }, [activeStep]);

    return <Suspense fallback={<Loader size="3xlarge" title="venter..." />}>{renderForm}</Suspense>;
}
