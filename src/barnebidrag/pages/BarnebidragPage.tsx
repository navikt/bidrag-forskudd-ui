import { NavigationLoaderWrapper } from "@common/components/NavigationLoaderWrapper";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import PageWrapper from "@common/PageWrapper";
import { Alert, Heading, Provider } from "@navikt/ds-react";
import React, { useLayoutEffect, useRef } from "react";

import texts from "../../common/constants/texts";
import FormWrapper from "../components/forms/FormWrapper";
import { BarnebidragSideMenu } from "./BarnebidragSideMenu";
import EksterneLenkerKnapper from "./EksterneLenkerKnapper";
export const BarnebidragPage = () => {
    const { erVedtakFattet, kanBehandlesINyLøsning, kanIkkeBehandlesBegrunnelse } = useGetBehandlingV2();
    const ref = useRef<HTMLDivElement>(null);
    const [rootElement, setRootElement] = React.useState<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        setRootElement(ref.current);
    }, []);

    return (
        <PageWrapper name="tracking-wide">
            <Provider rootElement={rootElement}>
                <div
                    ref={ref}
                    className="m-auto max-w-[1272px] min-[1440px]:max-w-[1920px] grid grid-cols-[max-content,auto]"
                >
                    <BarnebidragSideMenu />
                    <div className="w-full p-6 overflow-x-scroll min-[1440px]:overflow-x-visible">
                        {erVedtakFattet && (
                            <Alert variant="info" size="small" className="mb-4 w-max m-auto">
                                <Heading level="3" size="small">
                                    Vedtak er fattet
                                </Heading>
                                Vedtak er fattet for behandlingen og kan derfor ikke endres
                            </Alert>
                        )}
                        {!kanBehandlesINyLøsning && (
                            <Alert variant="info" size="small" className="mb-4 w-max m-auto">
                                <Heading level="3" size="small">
                                    {texts.title.kanIkkeBehandlesGjennomNyLøsning}
                                </Heading>
                                {kanIkkeBehandlesBegrunnelse}
                            </Alert>
                        )}
                        <NavigationLoaderWrapper>
                            <FormWrapper />
                        </NavigationLoaderWrapper>
                    </div>
                </div>
                <EksterneLenkerKnapper />
            </Provider>
        </PageWrapper>
    );
};
