import { NavigationLoaderWrapper } from "@common/components/NavigationLoaderWrapper";
import elementIds from "@common/constants/elementIds";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import PageWrapper from "@common/PageWrapper";
import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { LocalStorage } from "@navikt/bidrag-ui-common";
import { Alert, Button, Heading } from "@navikt/ds-react";
import React, { useEffect, useState } from "react";

import environment from "../../../environment";
import FormWrapper from "../../components/forms/FormWrapper";
import { ForskuddStepper } from "../../enum/ForskuddStepper";
import { ForskuddSideMenu } from "./ForskuddSideMenu";
export const NewForskuddPage = () => {
    const { erVedtakFattet } = useGetBehandlingV2();

    return (
        <PageWrapper name="tracking-wide">
            <div className="m-auto max-w-[1272px] min-[1440px]:max-w-[1920px] grid grid-cols-[max-content,auto]">
                <ForskuddSideMenu />
                <div className="w-full p-6 overflow-x-scroll min-[1440px]:overflow-x-visible">
                    {!kanBehandlesINyLøsning && (
                        <Alert variant="info" size="small" className="mb-4 w-max m-auto">
                            <Heading level="3" size="small">
                                Kan ikke behandles gjennom ny løsning
                            </Heading>
                            Behandlingen kan ikke behandles gjennom ny løsning.
                        </Alert>
                    )}
                    {erVedtakFattet && (
                        <Alert variant="info" size="small" className="mb-4 w-max m-auto">
                            <Heading level="3" size="small">
                                Vedtak er fattet
                            </Heading>
                            Vedtak er fattet for behandlingen og kan derfor ikke endres
                        </Alert>
                    )}
                    <NavigationLoaderWrapper>
                        <FormWrapper />
                    </NavigationLoaderWrapper>
                </div>
            </div>
            <EksterneLenkerKnapper />
        </PageWrapper>
    );
};

function EksterneLenkerKnapper() {
    return (
        <div className="agroup fixed bottom-0 right-0 p-2 flex items-end justify-end w-max h-0 flex-row gap-[5px]">
            <LovverkKnapper />
            <BrukerveiledningKnapp />
        </div>
    );
}
function BrukerveiledningKnapp() {
    const nudgeEnabledName = "brukerveiledningShowNudge";
    const { activeStep } = useBehandlingProvider();
    const [nudge, setNudge] = useState(LocalStorage.get(nudgeEnabledName) !== "false");

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setNudge(false);
            LocalStorage.set(nudgeEnabledName, "false");
        }, 5000);
        return () => clearTimeout(timeoutId);
    }, []);
    function renderHref() {
        switch (activeStep) {
            case ForskuddStepper.BOFORHOLD:
                return elementIds.brukerveildning.tittel_boforhold;
            case ForskuddStepper.INNTEKT:
                return elementIds.brukerveildning.tittel_inntekt;
            case ForskuddStepper.VEDTAK:
                return elementIds.brukerveildning.tittel_vedtak;
            case ForskuddStepper.VIRKNINGSTIDSPUNKT:
                return elementIds.brukerveildning.tittel_virkningstidspunkt;
            default:
                return "";
        }
    }
    return (
        <div>
            <Button
                title="Brukerveiledning"
                variant="tertiary"
                className={`rounded-xl border-solid ${
                    nudge ? "animate-bounce border-[var(--a-border-success)] border-[2px]" : "border"
                } `}
                size="xsmall"
                icon={<ExternalLinkIcon />}
                onClick={() => window.open(environment.url.forskuddBrukerveiledning + "#" + renderHref(), "_blank")}
            >
                Brukerveiledning
            </Button>
        </div>
    );
}
function LovverkKnapper() {
    const { activeStep } = useBehandlingProvider();

    function renderKnapp(tekst: string, url: string) {
        return (
            <div>
                <Button
                    title={tekst}
                    variant="tertiary"
                    className={`border rounded-xl border-solid`}
                    size="xsmall"
                    icon={<ExternalLinkIcon />}
                    onClick={() => window.open(url, "_blank")}
                >
                    {tekst}
                </Button>
            </div>
        );
    }
    if (activeStep === ForskuddStepper.VEDTAK) return null;
    return (
        <>
            {renderKnapp("Lov om bidragsforskudd", "https://lovdata.no/dokument/NL/lov/1989-02-17-2")}
            {activeStep === ForskuddStepper.BOFORHOLD &&
                renderKnapp("Rundskriv til forskuddsloven", "https://lovdata.no/nav/rundskriv/r54-00#KAPITTEL_2-3")}
            {activeStep === ForskuddStepper.INNTEKT &&
                renderKnapp(
                    "Forskrift om inntektsprøving av forskudd",
                    "https://lovdata.no/dokument/SF/forskrift/2003-02-06-125"
                )}
        </>
    );
}
