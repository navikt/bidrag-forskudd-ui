import React, {
    createContext,
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    useCallback,
    useContext,
    useState,
} from "react";
import { useParams, useSearchParams } from "react-router-dom";

import { STEPS } from "../constants/steps";
import { ForskuddStepper } from "../enum/ForskuddStepper";
import { useBehandlingV2 } from "../hooks/useApiData";
import { InntektFormValues } from "../types/inntektFormValues";

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

interface IForskuddContext {
    activeStep: string;
    setActiveStep: (x: number) => void;
    behandlingId: number;
    vedtakId: number;
    lesemodus: boolean;
    erVedtakFattet: boolean;
    saksnummer?: string;
    inntektFormValues: InntektFormValues;
    setInntektFormValues: Dispatch<SetStateAction<InntektFormValues>>;
    errorMessage: { title: string; text: string };
    errorModalOpen: boolean;
    setErrorMessage: (message: { title: string; text: string }) => void;
    setErrorModalOpen: (open: boolean) => void;
    pageErrorsOrUnsavedState: PageErrorsOrUnsavedState;
    setPageErrorsOrUnsavedState: Dispatch<SetStateAction<PageErrorsOrUnsavedState>>;
}

interface IForskuddContextProps {
    vedtakId?: number;
    behandlingId?: number;
}

export const ForskuddContext = createContext<IForskuddContext | null>(null);

function ForskuddProvider({ behandlingId, children, vedtakId }: PropsWithChildren<IForskuddContextProps>) {
    const { saksnummer } = useParams<{ behandlingId?: string; saksnummer?: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const [inntektFormValues, setInntektFormValues] = useState(undefined);
    const [pageErrorsOrUnsavedState, setPageErrorsOrUnsavedState] = useState({
        virkningstidspunkt: { error: false },
        boforhold: { error: false },
        inntekt: { error: false },
    });
    const [errorMessage, setErrorMessage] = useState<{ title: string; text: string }>(null);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const activeStep = searchParams.get("steg") ?? ForskuddStepper.VIRKNINGSTIDSPUNKT;
    const setActiveStep = useCallback((x: number) => {
        searchParams.delete("steg");
        setSearchParams([...searchParams.entries(), ["steg", Object.keys(STEPS).find((k) => STEPS[k] === x)]]);
    }, []);

    const queryLesemodus = searchParams.get("lesemodus") == "true";
    const behandling = useBehandlingV2(behandlingId, vedtakId);
    const value = React.useMemo(
        () => ({
            activeStep,
            setActiveStep,
            behandlingId,
            vedtakId,
            lesemodus: vedtakId != null || behandling.erVedtakFattet || queryLesemodus,
            erVedtakFattet: behandling.erVedtakFattet,
            saksnummer,
            inntektFormValues,
            setInntektFormValues,
            errorMessage,
            setErrorMessage,
            errorModalOpen,
            setErrorModalOpen,
            pageErrorsOrUnsavedState,
            setPageErrorsOrUnsavedState,
        }),
        [
            activeStep,
            behandlingId,
            vedtakId,
            saksnummer,
            inntektFormValues,
            errorMessage,
            errorModalOpen,
            pageErrorsOrUnsavedState,
        ]
    );

    return <ForskuddContext.Provider value={value}>{children}</ForskuddContext.Provider>;
}
function useForskudd() {
    const context = useContext(ForskuddContext);
    if (context === undefined) {
        throw new Error("useForskudd must be used within a ForskuddProvider");
    }
    return context;
}

export { ForskuddProvider, useForskudd };
