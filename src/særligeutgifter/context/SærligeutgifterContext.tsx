import ErrorConfirmationModal from "@common/components/ErrorConfirmationModal";
import { ConfirmationModal } from "@common/components/modal/ConfirmationModal";
import text from "@common/constants/texts";
import { useBehandlingV2 } from "@common/hooks/useApiData";
import { XMarkOctagonFillIcon } from "@navikt/aksel-icons";
import { Button, Heading } from "@navikt/ds-react";
import { dateOrNull, firstDayOfMonth, isAfterEqualsDate } from "@utils/date-utils";
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

import { STEPS } from "../constants/steps";
import { SærligeutgifterStepper } from "../enum/SærligeutgifterStepper";
import { InntektFormValues } from "../types/inntektFormValues";

export type InntektTables =
    | "småbarnstillegg"
    | "utvidetBarnetrygd"
    | `årsinntekter.${string}`
    | `barnetillegg.${string}`
    | `kontantstøtte.${string}`;

type HusstandsbarnTables = "sivilstand" | "newBarn" | `husstandsbarn.${string}`;

export type PageErrorsOrUnsavedState = {
    utgifter: { error: boolean };
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
interface ISærligeutgifterContext {
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

export const SærligeutgifterContext = createContext<ISærligeutgifterContext | null>(null);

function SærligeutgifterProvider({ behandlingId, children, vedtakId }: PropsWithChildren<IForskuddContextProps>) {
    const { saksnummer } = useParams<{ behandlingId?: string; saksnummer?: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const [inntektFormValues, setInntektFormValues] = useState(undefined);
    const [saveErrorState, setSaveErrorState] = useState<SaveErrorState | undefined>();
    const [pageErrorsOrUnsavedState, setPageErrorsOrUnsavedState] = useState<PageErrorsOrUnsavedState>({
        utgifter: { error: false },
        boforhold: { error: false },
        inntekt: { error: false },
    });
    const [errorMessage, setErrorMessage] = useState<{ title: string; text: string }>(null);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const activeStep = searchParams.get("steg") ?? SærligeutgifterStepper.UTGIFTER;
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
        return {
            title: text.varsel.statusIkkeLagret,
            description: text.varsel.statusIkkeLagretDescription,
        };
    }
    return (
        <SærligeutgifterContext.Provider value={value}>
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
        </SærligeutgifterContext.Provider>
    );
}
function useSærligeutgifter() {
    const context = useContext(SærligeutgifterContext);
    if (context === undefined) {
        throw new Error("useForskudd must be used within a ForskuddProvider");
    }
    return context;
}

export { SærligeutgifterProvider, useSærligeutgifter };
