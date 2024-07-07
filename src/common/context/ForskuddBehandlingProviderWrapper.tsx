import text from "@common/constants/texts";
import { BehandlingProvider } from "@common/context/BehandlingContext";
import React, { PropsWithChildren, useState } from "react";

import { STEPS as ForskuddSteps } from "../../forskudd/constants/steps";
import { ForskuddStepper } from "../../forskudd/enum/ForskuddStepper";

export type InntektTables =
    | "småbarnstillegg"
    | "utvidetBarnetrygd"
    | `årsinntekter.${string}`
    | `barnetillegg.${string}`
    | `kontantstøtte.${string}`;

type HusstandsbarnTables = "sivilstand" | "newBarn" | `husstandsbarn.${string}`;

export type PageErrorsOrUnsavedState = {
    virkningstidspunkt: { error: boolean };
    boforhold: {
        error: boolean;
        openFields?: { [key in HusstandsbarnTables]: boolean };
    };
    inntekt: {
        error: boolean;
        openFields?: {
            [key in InntektTables]: boolean;
        };
    };
};

function ForskuddBehandlingProviderWrapper({ children }: PropsWithChildren) {
    const [pageErrorsOrUnsavedState, setPageErrorsOrUnsavedState] = useState<PageErrorsOrUnsavedState>({
        virkningstidspunkt: { error: false },
        boforhold: { error: false },
        inntekt: { error: false },
    });
    const formSteps = { defaultStep: ForskuddStepper.VIRKNINGSTIDSPUNKT, steps: ForskuddSteps };

    function getPageErrorTexts(): { title: string; description: string } {
        if (pageErrorsOrUnsavedState.virkningstidspunkt.error) {
            return {
                title: "Det er ikke lagt inn dato på virkningstidspunkt",
                description: "Hvis det ikke settes inn en dato vil virkningsdatoen settes til forrige lagrede dato",
            };
        } else {
            return {
                title: text.varsel.statusIkkeLagret,
                description: text.varsel.statusIkkeLagretDescription,
            };
        }
    }

    const value = React.useMemo(
        () => ({
            formSteps,
            getPageErrorTexts,
            pageErrorsOrUnsavedState,
            setPageErrorsOrUnsavedState,
        }),
        [pageErrorsOrUnsavedState]
    );

    return <BehandlingProvider props={value}>{children}</BehandlingProvider>;
}

export { ForskuddBehandlingProviderWrapper };
