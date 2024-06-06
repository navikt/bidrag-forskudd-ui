import { XMarkOctagonFillIcon } from "@navikt/aksel-icons";
import { Button, Heading } from "@navikt/ds-react";
import React, {
    createContext,
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    useCallback,
    useContext,
    useRef,
    useState,
} from "react";
import { useParams, useSearchParams } from "react-router-dom";

import ErrorConfirmationModal from "../components/ErrorConfirmationModal";
import { ConfirmationModal } from "../components/modal/ConfirmationModal";
import { STEPS } from "../constants/steps";
import text from "../constants/texts";
import { ForskuddStepper } from "../enum/ForskuddStepper";
import { useBehandlingV2 } from "../hooks/useApiData";
import { InntektFormValues } from "../types/inntektFormValues";
import { dateOrNull, firstDayOfMonth, isAfterEqualsDate } from "../utils/date-utils";

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

interface SaveErrorState {
    error: boolean;
    retryFn?: () => void;
    rollbackFn?: () => void;
}
interface IForskuddContext {
    activeStep: string;
    behandlingId: number;
    vedtakId: number;
    lesemodus: boolean;
    erVedtakFattet: boolean;
    erVirkningstidspunktNåværendeMånedEllerFramITid: boolean;
    saksnummer?: string;
    inntektFormValues: InntektFormValues;
    setInntektFormValues: Dispatch<SetStateAction<InntektFormValues>>;
    errorMessage: { title: string; text: string };
    errorModalOpen: boolean;
    setErrorMessage: (message: { title: string; text: string }) => void;
    setErrorModalOpen: (open: boolean) => void;
    pageErrorsOrUnsavedState: PageErrorsOrUnsavedState;
    setPageErrorsOrUnsavedState: Dispatch<SetStateAction<PageErrorsOrUnsavedState>>;
    setSaveErrorState: Dispatch<SetStateAction<SaveErrorState>>;
    onStepChange: (x: number) => void;
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
    const [saveErrorState, setSaveErrorState] = useState<SaveErrorState | undefined>();
    const [pageErrorsOrUnsavedState, setPageErrorsOrUnsavedState] = useState<PageErrorsOrUnsavedState>({
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
    const [nextStep, setNextStep] = useState<number>(undefined);
    const ref = useRef<HTMLDialogElement>(null);
    const onConfirm = () => {
        ref.current?.close();
        setActiveStep(nextStep);
        setPageErrorsOrUnsavedState({ ...pageErrorsOrUnsavedState, [activeStep]: { error: false } });
    };

    const erVirkningstidspunktNåværendeMånedEllerFramITid = isAfterEqualsDate(
        dateOrNull(behandling.virkningstidspunkt.virkningstidspunkt),
        firstDayOfMonth(new Date())
    );

    const onStepChange = (x: number) => {
        const currentPageErrors = pageErrorsOrUnsavedState[activeStep];

        if (
            currentPageErrors &&
            (currentPageErrors.error ||
                (currentPageErrors.openFields && Object.values(currentPageErrors.openFields).some((open) => open)))
        ) {
            setNextStep(x);
            ref.current?.showModal();
        } else {
            setActiveStep(x);
        }
    };

    const value = React.useMemo(
        () => ({
            activeStep,
            behandlingId,
            vedtakId,
            erVirkningstidspunktNåværendeMånedEllerFramITid,
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
            setSaveErrorState,
            onConfirm,
            onStepChange,
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
    return (
        <ForskuddContext.Provider value={value}>
            <ConfirmationModal
                ref={ref}
                closeable
                description={getPageErrorTexts().description}
                heading={
                    <Heading size="small" className="flex gap-x-1.5 items-center">
                        <XMarkOctagonFillIcon title="a11y-title" fontSize="1.5rem" color="var(--a-icon-danger)" />
                        {getPageErrorTexts().title}
                    </Heading>
                }
                footer={
                    <>
                        <Button type="button" onClick={() => ref.current?.close()} size="small">
                            {text.label.tilbakeTilUtfylling}
                        </Button>
                        <Button type="button" variant="secondary" size="small" onClick={onConfirm}>
                            {text.label.gåVidereUtenÅLagre}
                        </Button>
                    </>
                }
            />
            <ErrorConfirmationModal
                onConfirm={saveErrorState?.retryFn}
                onCancel={saveErrorState?.rollbackFn}
                onClose={() => setSaveErrorState({ error: false })}
                open={saveErrorState?.error}
            />
            {children}
        </ForskuddContext.Provider>
    );
}
function useForskudd() {
    const context = useContext(ForskuddContext);
    if (context === undefined) {
        throw new Error("useForskudd must be used within a ForskuddProvider");
    }
    return context;
}

export { ForskuddProvider, useForskudd };
