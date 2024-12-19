import ErrorConfirmationModal from "@common/components/ErrorConfirmationModal";
import { ConfirmationModal } from "@common/components/modal/ConfirmationModal";
import urlSearchParams from "@common/constants/behandlingQueryKeys";
import text from "@common/constants/texts";
import { useBehandlingV2 } from "@common/hooks/useApiData";
import { useMutationStatus } from "@common/hooks/useMutationStatus";
import { XMarkOctagonFillIcon } from "@navikt/aksel-icons";
import { Button, Heading } from "@navikt/ds-react";
import { dateOrNull, firstDayOfMonth, isAfterEqualsDate } from "@utils/date-utils";
import { getAllSearchParamsExcludingKeys } from "@utils/window-utils";
import React, {
    createContext,
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { TypeBehandling } from "../../api/BidragBehandlingApiV1";
import { BarnebidragPageErrorsOrUnsavedState } from "../../barnebidrag/context/BarnebidragProviderWrapper";
import { BarnebidragStepper } from "../../barnebidrag/enum/BarnebidragStepper";
import { PageErrorsOrUnsavedState as ForskuddPageErrorsOrUnsavedState } from "../../forskudd/context/ForskuddBehandlingProviderWrapper";
import { ForskuddStepper } from "../../forskudd/enum/ForskuddStepper";
import { PageErrorsOrUnsavedState as SærligeutgifterPageErrorsOrUnsavedState } from "../../særbidrag/context/SærligeugifterProviderWrapper";
import { SærligeutgifterStepper } from "../../særbidrag/enum/SærligeutgifterStepper";
import behandlingQueryKeys from "../constants/behandlingQueryKeys";

interface SaveErrorState {
    error: boolean;
    retryFn?: () => void;
    rollbackFn?: () => void;
}
interface IBehandlingContext {
    activeStep: string;
    behandlingId: string;
    vedtakId: string;
    type: TypeBehandling;
    lesemodus: boolean;
    erVedtakFattet: boolean;
    beregnetGebyrErEndret: boolean;
    erVirkningstidspunktNåværendeMånedEllerFramITid: boolean;
    saksnummer?: string;
    errorMessage: { title: string; text: string };
    errorModalOpen: boolean;
    setErrorMessage: (message: { title: string; text: string }) => void;
    setErrorModalOpen: (open: boolean) => void;
    pageErrorsOrUnsavedState:
        | ForskuddPageErrorsOrUnsavedState
        | SærligeutgifterPageErrorsOrUnsavedState
        | BarnebidragPageErrorsOrUnsavedState;
    setPageErrorsOrUnsavedState: Dispatch<
        SetStateAction<
            | ForskuddPageErrorsOrUnsavedState
            | SærligeutgifterPageErrorsOrUnsavedState
            | BarnebidragPageErrorsOrUnsavedState
        >
    >;
    setSaveErrorState: Dispatch<SetStateAction<SaveErrorState>>;
    onStepChange: (x: number, query?: Record<string, string>, hash?: string) => void;
    pendingTransitionState: boolean;
    setDebouncing: React.Dispatch<React.SetStateAction<boolean>>;
    setBeregnetGebyrErEndret: React.Dispatch<React.SetStateAction<boolean>>;
    onNavigateToTab: (nextTab: string) => void;
}

export const BehandlingContext = createContext<IBehandlingContext | null>(null);

type ForskuddSteps = {
    defaultStep: ForskuddStepper;
    steps: { [_key in ForskuddStepper]: number };
};

type SærligeutgifterSteps = {
    defaultStep: SærligeutgifterStepper;
    steps: { [_key in SærligeutgifterStepper]: number };
};

type BarnebidragSteps = {
    defaultStep: BarnebidragStepper;
    steps: { [_key in BarnebidragStepper]: number };
};

export type BehandlingProviderProps = {
    props: {
        getPageErrorTexts: () => { title: string; description: string };
        formSteps: ForskuddSteps | SærligeutgifterSteps | BarnebidragSteps;
        pageErrorsOrUnsavedState:
            | ForskuddPageErrorsOrUnsavedState
            | SærligeutgifterPageErrorsOrUnsavedState
            | BarnebidragPageErrorsOrUnsavedState;
        setPageErrorsOrUnsavedState: Dispatch<
            SetStateAction<
                | ForskuddPageErrorsOrUnsavedState
                | SærligeutgifterPageErrorsOrUnsavedState
                | BarnebidragPageErrorsOrUnsavedState
            >
        >;
    };
};

function BehandlingProvider({ props, children }: PropsWithChildren<BehandlingProviderProps>) {
    const {
        formSteps: { defaultStep, steps },
        getPageErrorTexts,
        pageErrorsOrUnsavedState,
        setPageErrorsOrUnsavedState,
    } = props;
    const { behandlingId, saksnummer, vedtakId } = useParams<{
        behandlingId?: string;
        saksnummer?: string;
        vedtakId?: string;
    }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const [saveErrorState, setSaveErrorState] = useState<SaveErrorState | undefined>();
    const [errorMessage, setErrorMessage] = useState<{ title: string; text: string }>(null);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [beregnetGebyrErEndret, setBeregnetGebyrErEndret] = useState(false);
    const behandling = useBehandlingV2(behandlingId, vedtakId);
    const activeStep = searchParams.get(behandlingQueryKeys.steg) ?? defaultStep;
    const location = useLocation();
    const navigate = useNavigate();
    const setActiveStep = useCallback((x: number, query?: Record<string, string>, hash?: string) => {
        const updatedSearchParams = [
            [behandlingQueryKeys.steg, Object.keys(steps).find((k) => steps[k] === x)],
            ...getAllSearchParamsExcludingKeys(behandlingQueryKeys.steg, behandlingQueryKeys.tab).entries(),
            ...(query ? Object.entries(query) : []),
        ];

        const updatedSearchParamsString = Object.entries(updatedSearchParams)
            .map(([, [key, value]]) => `&${key}=${value}`)
            .join("");

        const url = `?${updatedSearchParamsString}${hash ? `#${hash}` : ""}`;
        navigate(`${location.pathname + url}`);
    }, []);
    const mutationStatus = useMutationStatus(behandlingId);
    const [debouncing, setDebouncing] = useState<boolean>(false);
    const [navigatingToNextPage, setNavigatingToNextPage] = useState<boolean>(false);
    const [navigatingToNextTab, setNavigatingToNextTab] = useState<boolean>(false);

    const queryLesemodus = searchParams.get(behandlingQueryKeys.lesemodus) === "true";
    const [nextStep, setNextStep] = useState<number>(undefined);
    const [nextTab, setNextTab] = useState<string>(undefined);
    const ref = useRef<HTMLDialogElement>(null);
    const erVirkningstidspunktNåværendeMånedEllerFramITid = isAfterEqualsDate(
        dateOrNull(behandling.virkningstidspunkt.virkningstidspunkt),
        firstDayOfMonth(new Date())
    );

    const onConfirm = () => {
        ref.current?.close();
        setActiveStep(nextStep);
        setPageErrorsOrUnsavedState({ ...pageErrorsOrUnsavedState, [activeStep]: { error: false } });
    };

    useEffect(() => {
        if (navigatingToNextPage && mutationStatus === "success") {
            setActiveStep(nextStep);
            setNavigatingToNextPage(false);
        }

        if (navigatingToNextPage && mutationStatus === "error") {
            setNavigatingToNextPage(false);
        }

        if (navigatingToNextTab && mutationStatus === "success") {
            setActiveTab(nextTab);
            setNavigatingToNextTab(false);
        }

        if (navigatingToNextTab && mutationStatus === "error") {
            setNavigatingToNextTab(false);
        }
    }, [mutationStatus]);

    const setActiveTab = (nextTab: string) => {
        setSearchParams((params) => {
            params.set(urlSearchParams.tab, nextTab);
            return params;
        });
    };

    const onNavigateToTab = (nextTab: string) => {
        if (mutationStatus === "pending" || debouncing) {
            setNavigatingToNextTab(true);
            setNextTab(nextTab);
        } else {
            setActiveTab(nextTab);
        }
    };

    const onStepChange = (x: number, query?: Record<string, string>, hash?: string) => {
        const currentPageErrors = pageErrorsOrUnsavedState[activeStep];

        if (
            currentPageErrors &&
            (currentPageErrors.error ||
                (currentPageErrors.openFields && Object.values(currentPageErrors.openFields).some((open) => open)))
        ) {
            setNextStep(x);
            ref.current?.showModal();
        } else if (mutationStatus === "pending" || debouncing) {
            setNavigatingToNextPage(true);
            setNextStep(x);
        } else {
            setActiveStep(x, query, hash);
        }
    };

    const value = React.useMemo(
        () => ({
            activeStep,
            behandlingId,
            vedtakId,
            erVirkningstidspunktNåværendeMånedEllerFramITid,
            beregnetGebyrErEndret,
            type: behandling.type,
            lesemodus:
                vedtakId != null ||
                behandling.erVedtakFattet ||
                queryLesemodus ||
                behandling.kanBehandlesINyLøsning === false,
            erVedtakFattet: behandling.erVedtakFattet,
            saksnummer,
            errorMessage,
            errorModalOpen,
            pageErrorsOrUnsavedState,
            setPageErrorsOrUnsavedState,
            pendingTransitionState:
                (navigatingToNextPage || navigatingToNextTab) && (mutationStatus === "pending" || debouncing),
            setErrorModalOpen,
            setErrorMessage,
            setSaveErrorState,
            onConfirm,
            onStepChange,
            setDebouncing,
            setBeregnetGebyrErEndret,
            onNavigateToTab,
        }),
        [
            activeStep,
            behandlingId,
            vedtakId,
            erVirkningstidspunktNåværendeMånedEllerFramITid,
            saksnummer,
            errorMessage,
            errorModalOpen,
            JSON.stringify(pageErrorsOrUnsavedState),
            queryLesemodus,
            behandling.erVedtakFattet,
            navigatingToNextPage,
            navigatingToNextTab,
            mutationStatus,
            debouncing,
        ]
    );

    return (
        <BehandlingContext.Provider value={value}>
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
        </BehandlingContext.Provider>
    );
}
function useBehandlingProvider() {
    const context = useContext(BehandlingContext);
    if (!context) {
        throw new Error("useBehandlingProvider must be used within a BehandlingProvider");
    }
    return context;
}

export { BehandlingProvider, useBehandlingProvider };
