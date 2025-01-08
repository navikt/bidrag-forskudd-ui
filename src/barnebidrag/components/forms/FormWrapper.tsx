import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { Loader } from "@navikt/ds-react";
import React, { memo, Suspense } from "react";

import { BarnebidragStepper } from "../../enum/BarnebidragStepper";
import Vedtak from "../vedtak/Vedtak";
import Boforhold from "./boforhold/Boforhold";
import Gebyr from "./gebyr/Gebyr";
import Inntekt from "./inntekt/Inntekt";
import Samvær from "./samvær/Samvær";
import Underholdskostnad from "./underholdskostnad/Underholdskostnad";
import Virkningstidspunkt from "./virkningstidspunkt/Virkningstidspunkt";

const BarnebidragForm = memo(({ activeStep }: { activeStep: string }) => {
    switch (activeStep) {
        case BarnebidragStepper.VIRKNINGSTIDSPUNKT:
            return <Virkningstidspunkt />;
        case BarnebidragStepper.UNDERHOLDSKOSTNAD:
            return <Underholdskostnad />;
        case BarnebidragStepper.GEBYR:
            return <Gebyr />;
        case BarnebidragStepper.SAMVÆR:
            return <Samvær />;
        case BarnebidragStepper.INNTEKT:
            return <Inntekt />;
        case BarnebidragStepper.BOFORHOLD:
            return <Boforhold />;
        case BarnebidragStepper.VEDTAK:
            return <Vedtak />;
        default:
            return null;
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
            <BarnebidragForm activeStep={activeStep} />
        </Suspense>
    );
}
