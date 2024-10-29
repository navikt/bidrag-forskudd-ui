import { QueryErrorWrapper } from "@common/components/query-error-boundary/QueryErrorWrapper";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { QueryKeys, useGetBehandlingV2, useGetBeregningSærbidrag } from "@common/hooks/useApiData";
import { VedtakBeregningResult } from "@commonTypes/vedtakTypes";
import { Accordion, Alert, BodyShort, Heading, HStack, VStack } from "@navikt/ds-react";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";

import { Resultatkode } from "../../../api/BidragBehandlingApiV1";
import { AdminButtons } from "../../../common/components/vedtak/AdminButtons";
import { FatteVedtakButtons } from "../../../common/components/vedtak/FatteVedtakButtons";
import { ResultatTable } from "../../../common/components/vedtak/ResultatTable";
import VedtakWrapper from "../../../common/components/vedtak/VedtakWrapper";
import useFeatureToogle from "../../../common/hooks/useFeatureToggle";
import { hentVisningsnavn } from "../../../common/hooks/useVisningsnavn";
import { formatterBeløp, formatterProsent } from "../../../utils/number-utils";
import { STEPS } from "../../constants/steps";
import { DetaljertBeregningSærbidrag } from "./DetaljertBeregningSærbidrag";
import { UtgifsposterTable } from "./UtgifstposterTable";

const Vedtak = () => {
    const { behandlingId, activeStep, lesemodus } = useBehandlingProvider();
    const { erVedtakFattet, kanBehandlesINyLøsning } = useGetBehandlingV2();
    const queryClient = useQueryClient();
    const { isFatteVedtakEnabled } = useFeatureToogle();
    const beregnetSærbidrag = queryClient.getQueryData<VedtakBeregningResult>(QueryKeys.beregningSærbidrag());
    const isBeregningError = queryClient.getQueryState(QueryKeys.beregningSærbidrag())?.status === "error";

    useEffect(() => {
        queryClient.refetchQueries({ queryKey: QueryKeys.behandlingV2(behandlingId) });
        queryClient.resetQueries({ queryKey: QueryKeys.beregningSærbidrag() });
    }, [activeStep]);

    return (
        <div className="grid gap-y-4 m-auto w-[830px]">
            {erVedtakFattet && !lesemodus && <Alert variant="warning">Vedtak er fattet for behandling</Alert>}
            <Heading level="2" size="medium">
                {text.title.vedtak}
            </Heading>
            <VedtakResultat />

            {!beregnetSærbidrag?.feil && !lesemodus && (
                <FatteVedtakButtons
                    isBeregningError={isBeregningError}
                    disabled={!isFatteVedtakEnabled || !kanBehandlesINyLøsning}
                />
            )}
            <AdminButtons />
        </div>
    );
};

const VedtakResultat = () => {
    const { data: beregnetSærbidrag } = useGetBeregningSærbidrag();

    function renderResultat() {
        if (beregnetSærbidrag.feil) return;
        const erDirekteAvslag = beregnetSærbidrag.resultat?.erDirekteAvslag;
        const erAvslagSomInneholderUtgifter = [
            Resultatkode.GODKJENTBELOPERLAVEREENNFORSKUDDSSATS,
            Resultatkode.ALLE_UTGIFTER_ER_FORELDET,
        ].includes(beregnetSærbidrag.resultat?.resultatKode);
        const erBeregningeAvslag = beregnetSærbidrag.resultat?.resultatKode !== Resultatkode.SAeRBIDRAGINNVILGET;
        const resultat = beregnetSærbidrag.resultat;
        if (erDirekteAvslag) {
            return (
                <div>
                    <Heading size="small">Avslag</Heading>
                    <BodyShort size="small">
                        <dl className="bd_datadisplay">
                            <dt>Årsak</dt>
                            <dd>{hentVisningsnavn(resultat.resultatKode)}</dd>
                        </dl>
                    </BodyShort>
                </div>
            );
        }
        if (erAvslagSomInneholderUtgifter) {
            return (
                <div>
                    <Heading size="small">Avslag</Heading>
                    <VStack gap={"4"}>
                        <UtgifsposterTable />
                        <BodyShort size="small">
                            <ResultatTable
                                data={[
                                    {
                                        label: "Årsak",
                                        value: hentVisningsnavn(resultat.resultatKode),
                                    },
                                    resultat.resultatKode === Resultatkode.GODKJENTBELOPERLAVEREENNFORSKUDDSSATS && {
                                        label: "Forskuddssats",
                                        value: formatterBeløp(resultat.forskuddssats, true),
                                    },
                                    {
                                        label: "Kravbeløp",
                                        value: formatterBeløp(resultat.beregning?.totalKravbeløp, true),
                                    },
                                    {
                                        label: "Godkjent beløp",
                                        value: formatterBeløp(resultat.beregning?.totalGodkjentBeløp, true),
                                    },
                                ].filter((d) => d)}
                            />
                        </BodyShort>
                    </VStack>
                </div>
            );
        }
        return (
            <div>
                {erBeregningeAvslag ? (
                    <Heading spacing size="small">
                        Avslag, {hentVisningsnavn(resultat.resultatKode).toLowerCase()}
                    </Heading>
                ) : (
                    <Heading spacing size="small">
                        Særbidrag innvilget
                    </Heading>
                )}
                <UtgifsposterTable />
                <VStack gap={"2"} className="pt-4">
                    <HStack gap={"24"} style={{ width: "max-content" }}>
                        <ResultatTable
                            title="Inntekter"
                            data={[
                                {
                                    label: "Inntekt BM",
                                    value: formatterBeløp(resultat.inntekter.inntektBM, true),
                                },
                                {
                                    label: "Inntekt BP",
                                    value: formatterBeløp(resultat.inntekter.inntektBP, true),
                                },
                                {
                                    label: "Inntekt BA",
                                    value: formatterBeløp(resultat.inntekter.inntektBarn, true),
                                },
                            ]}
                        />

                        <ResultatTable
                            title="Boforhold"
                            data={[
                                {
                                    label: "Antall barn i husstanden",
                                    value: resultat.antallBarnIHusstanden,
                                },
                                {
                                    label: "Voksne i husstanden",
                                    value: resultat.voksenIHusstanden
                                        ? resultat.enesteVoksenIHusstandenErEgetBarn
                                            ? "Ja (barn over 18 år)"
                                            : "Ja"
                                        : "Nei",
                                },
                            ]}
                        />
                        <ResultatTable
                            title="Beregning"
                            data={[
                                {
                                    label: "Kravbeløp",
                                    value: formatterBeløp(resultat.beregning?.totalKravbeløp, true),
                                },
                                {
                                    label: "Godkjent beløp",
                                    value: formatterBeløp(resultat.beregning?.totalGodkjentBeløp, true),
                                },
                                {
                                    label: "Maks godkjent beløp",
                                    value: formatterBeløp(resultat.maksGodkjentBeløp, true),
                                },
                                {
                                    label: "BP's andel",
                                    value: formatterProsent(resultat.bpsAndel?.endeligAndelFaktor),
                                },
                                {
                                    label: "BP har evne",
                                    value: resultat.bpHarEvne === false ? "Nei" : "Ja",
                                },

                                {
                                    label: "Resultat",
                                    value: erBeregningeAvslag ? "Avslag" : formatterBeløp(resultat.resultat, true),
                                },

                                {
                                    label: "Betalt av BP",
                                    value: formatterBeløp(resultat.beregning?.totalBeløpBetaltAvBp, true),
                                },
                                {
                                    label: "Beløp som innkreves",
                                    value: erBeregningeAvslag
                                        ? "Avslag"
                                        : formatterBeløp(resultat.beløpSomInnkreves, true),
                                },
                            ].filter((d) => d)}
                        />
                    </HStack>
                    <BeregningsdetaljerAccordion />
                </VStack>
            </div>
        );
    }
    return (
        <VedtakWrapper feil={beregnetSærbidrag.feil} steps={STEPS}>
            {renderResultat()}
        </VedtakWrapper>
    );
};

const BeregningsdetaljerAccordion: React.FC = () => {
    return (
        <Accordion size="small" headingSize="xsmall">
            <Accordion.Item>
                <Accordion.Header>Beregningsdetaljer</Accordion.Header>
                <Accordion.Content className="*:mb-5">
                    <DetaljertBeregningSærbidrag />
                </Accordion.Content>
            </Accordion.Item>
        </Accordion>
    );
};
export default () => {
    return (
        <QueryErrorWrapper>
            <Vedtak />
        </QueryErrorWrapper>
    );
};
