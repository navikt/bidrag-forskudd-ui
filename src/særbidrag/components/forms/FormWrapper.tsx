import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { Loader } from "@navikt/ds-react";
import React, { memo, Suspense } from "react";

import { SærligeutgifterStepper } from "../../enum/SærligeutgifterStepper";
import Boforhold from "./boforhold/Boforhold";
import Inntekt from "./inntekt/Inntekt";
import Utgifter from "./utgifter/Utgifter";

const SærligeutgifterForm = memo(({ activeStep }: { activeStep: string }) => {
    switch (activeStep) {
        case SærligeutgifterStepper.UTGIFTER:
            return <Utgifter />;
        case SærligeutgifterStepper.INNTEKT:
            return <Inntekt />;
        case SærligeutgifterStepper.BOFORHOLD:
            return <Boforhold />;
        case SærligeutgifterStepper.VEDTAK:
            return null;
        default:
            return null;
    }
});

export default function FormWrapper() {
    const { activeStep } = useBehandlingProvider();

    return (
        <Suspense
            fallback={
                <div className="flex justify-center">
                    <Loader size="3xlarge" title={text.loading} variant="interaction" />
                </div>
            }
        >
            <SærligeutgifterForm activeStep={activeStep} />
        </Suspense>
    );
}
