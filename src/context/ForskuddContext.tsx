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
import { BoforholdFormValues } from "../types/boforholdFormValues";
import { InntektFormValues } from "../types/inntektFormValues";
import { VirkningstidspunktFormValues } from "../types/virkningstidspunktFormValues";

interface IForskuddContext {
    activeStep: string;
    setActiveStep: (x: number) => void;
    behandlingId: number;
    vedtakId: number;
    lesemodus: boolean;
    erVedtakFattet: boolean;
    saksnummer?: string;
    virkningstidspunktFormValues: VirkningstidspunktFormValues;
    setVirkningstidspunktFormValues: (values: VirkningstidspunktFormValues) => void;
    inntektFormValues: InntektFormValues;
    setInntektFormValues: Dispatch<SetStateAction<InntektFormValues>>;
    boforholdFormValues: BoforholdFormValues;
    setBoforholdFormValues: Dispatch<SetStateAction<BoforholdFormValues>>;
    errorMessage: { title: string; text: string };
    errorModalOpen: boolean;
    setErrorMessage: (message: { title: string; text: string }) => void;
    setErrorModalOpen: (open: boolean) => void;
}

interface IForskuddContextProps {
    vedtakId?: number;
    behandlingId?: number;
}

export const ForskuddContext = createContext<IForskuddContext | null>(null);

function ForskuddProvider({ behandlingId, children, vedtakId }: PropsWithChildren<IForskuddContextProps>) {
    const { saksnummer } = useParams<{ behandlingId?: string; saksnummer?: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const [virkningstidspunktFormValues, setVirkningstidspunktFormValues] = useState(undefined);
    const [inntektFormValues, setInntektFormValues] = useState(undefined);
    const [boforholdFormValues, setBoforholdFormValues] = useState<BoforholdFormValues>(undefined);
    const [errorMessage, setErrorMessage] = useState<{ title: string; text: string }>(null);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const activeStep = searchParams.get("steg") ?? ForskuddStepper.VIRKNINGSTIDSPUNKT;
    const setActiveStep = useCallback((x: number) => {
        searchParams.delete("steg");
        setSearchParams([...searchParams.entries(), ["steg", Object.keys(STEPS).find((k) => STEPS[k] === x)]]);
    }, []);

    const behandling = useBehandlingV2(behandlingId, vedtakId);
    const value = React.useMemo(
        () => ({
            activeStep,
            setActiveStep,
            behandlingId,
            vedtakId,
            lesemodus: vedtakId != null || behandling.erVedtakFattet,
            erVedtakFattet: behandling.erVedtakFattet,
            saksnummer,
            virkningstidspunktFormValues,
            setVirkningstidspunktFormValues,
            inntektFormValues,
            setInntektFormValues,
            boforholdFormValues,
            setBoforholdFormValues,
            errorMessage,
            setErrorMessage,
            errorModalOpen,
            setErrorModalOpen,
        }),
        [
            activeStep,
            behandlingId,
            vedtakId,
            saksnummer,
            virkningstidspunktFormValues,
            inntektFormValues,
            boforholdFormValues,
            errorMessage,
            errorModalOpen,
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
