import text from "@common/constants/texts";
import { BehandlingProvider } from "@common/context/BehandlingContext";
import React, { PropsWithChildren, useState } from "react";

import { STEPS as BarnebidragSteps } from "../constants/steps";
import { BarnebidragStepper } from "../enum/BarnebidragStepper";

export type InntektTables =
    | `småbarnstillegg.${string}`
    | `utvidetBarnetrygd.${string}`
    | `årsinntekter.${string}`
    | `barnetillegg.${string}`
    | `kontantstøtte.${string}`;

export type UnderholdskostnadTables =
    | `underholdskostnaderMedIBehandling.${number}.stønadTilBarnetilsyn`
    | `underholdskostnaderMedIBehandling.${number}.faktiskTilsynsutgift`
    | `underholdskostnaderMedIBehandling.${number}.tilleggsstønad`
    | `underholdskostnaderAndreBarn.${number}.faktiskTilsynsutgift`;

type HusstandsbarnTables = "andreVoksneIHusstanden" | "sivilstand" | "newBarn" | `husstandsbarn.${string}`;

export type BarnebidragPageErrorsOrUnsavedState = {
    boforhold: {
        error: boolean;
        openFields?: {
            [_key in HusstandsbarnTables]: boolean;
        };
    };
    samvær: {
        error: boolean;
        openFields?: boolean;
    };
    inntekt: {
        error: boolean;
        openFields?: {
            [_key in InntektTables]: boolean;
        };
    };
    underholdskostnad: {
        error: boolean;
        openFields?: {
            [_key: UnderholdskostnadTables]: boolean;
        };
    };
};

function BarnebidragProviderWrapper({ children }: PropsWithChildren) {
    const [pageErrorsOrUnsavedState, setPageErrorsOrUnsavedState] = useState<BarnebidragPageErrorsOrUnsavedState>({
        underholdskostnad: { error: false },
        boforhold: { error: false },
        samvær: { error: false },
        inntekt: { error: false },
    });
    const formSteps = { defaultStep: BarnebidragStepper.VIRKNINGSTIDSPUNKT, steps: BarnebidragSteps };

    function getPageErrorTexts(): { title: string; description: string } {
        return {
            title: text.varsel.statusIkkeLagret,
            description: text.varsel.statusIkkeLagretDescription,
        };
    }

    const value = React.useMemo(
        () => ({
            formSteps,
            getPageErrorTexts,
            pageErrorsOrUnsavedState,
            setPageErrorsOrUnsavedState,
        }),
        [JSON.stringify(pageErrorsOrUnsavedState)]
    );

    return <BehandlingProvider props={value}>{children}</BehandlingProvider>;
}

export { BarnebidragProviderWrapper };
