import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { Loader } from "@navikt/ds-react";
import React, { memo, Suspense } from "react";

import { ForskuddStepper } from "../../enum/ForskuddStepper";
import Boforhold from "./boforhold/Boforhold";
import Inntekt from "./inntekt/Inntekt";
import Vedtak from "./vedtak/Vedtak";
import Virkningstidspunkt from "./virkningstidspunkt/Virkningstidspunkt";

const ForskuddForm = memo(({ activeStep }: { activeStep: string }) => {
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
});

export default function FormWrapper() {
    const { activeStep } = useBehandlingProvider();

    return (
        <Suspense
            fallback={
                <div className="flex justify-center overflow-hidden">
                    <Loader size="3xlarge" title={text.loading} variant="interaction" />
                </div>
            }
        >
            <ForskuddForm activeStep={activeStep} />
        </Suspense>
    );
}
