import { QueryErrorWrapper } from "@common/components/query-error-boundary/QueryErrorWrapper";
import text from "@common/constants/texts";
import tekster from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { QueryKeys, useGetBehandlingV2, useGetBeregningSærbidrag } from "@common/hooks/useApiData";
import { VedtakBeregningResult } from "@commonTypes/vedtakTypes";
import { dateToDDMMYYYYString } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Heading, HStack, VStack } from "@navikt/ds-react";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";

import { Resultatkode, UtgiftspostDto } from "../../../api/BidragBehandlingApiV1";
import { AdminButtons } from "../../../common/components/vedtak/AdminButtons";
import { FatteVedtakButtons } from "../../../common/components/vedtak/FatteVedtakButtons";
import VedtakWrapper from "../../../common/components/vedtak/VedtakWrapper";
import useFeatureToogle from "../../../common/hooks/useFeatureToggle";
import { hentVisningsnavn } from "../../../common/hooks/useVisningsnavn";
import { dateOrNull } from "../../../utils/date-utils";
import { formatterBeløp, formatterProsent } from "../../../utils/number-utils";
import { STEPS } from "../../constants/steps";

const Vedtak = () => {
    const { behandlingId, activeStep, lesemodus } = useBehandlingProvider();
    const { erVedtakFattet } = useGetBehandlingV2();
    const queryClient = useQueryClient();
    const { isFatteVedtakEnabled } = useFeatureToogle();
    const beregnetForskudd = queryClient.getQueryData<VedtakBeregningResult>(QueryKeys.beregningSærbidrag());
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

            {!beregnetForskudd?.feil && !lesemodus && (
                <FatteVedtakButtons isBeregningError={isBeregningError} disabled={!isFatteVedtakEnabled} />
            )}
            <AdminButtons />
        </div>
    );
};

const VedtakResultat = () => {
    const { data: beregnetSærbidrag } = useGetBeregningSærbidrag();

    const { isSærbidragBetaltAvBpEnabled } = useFeatureToogle();
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
                        <BodyShort size="small">
                            <ResultatTabell
                                data={[
                                    {
                                        label: "Årsak",
                                        value: hentVisningsnavn(resultat.resultatKode),
                                    },
                                    {
                                        label: "Kravbeløp",
                                        value: formatterBeløp(resultat.beregning?.totalKravbeløp, true),
                                    },
                                    {
                                        label: "Godkjent beløp",
                                        value: formatterBeløp(resultat.beregning?.totalGodkjentBeløp, true),
                                    },
                                ]}
                            />
                        </BodyShort>
                        <UtgifsposterTabell utgifstposter={resultat.utgiftsposter} />
                    </VStack>
                </div>
            );
        }
        return (
            <div>
                {erBeregningeAvslag ? (
                    <Heading spacing size="small">
                        Avslag: {hentVisningsnavn(resultat.resultatKode).toLowerCase()}
                    </Heading>
                ) : (
                    <Heading spacing size="small">
                        Særbidrag innvilget
                    </Heading>
                )}
                <VStack gap={"2"}>
                    <HStack gap={"24"} style={{ width: "max-content" }}>
                        <ResultatTabell
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

                        <ResultatTabell
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
                        <ResultatTabell
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
                                    label: "BP's andel",
                                    value: formatterProsent(resultat.bpsAndel?.andelProsent),
                                },
                                {
                                    label: "Resultat",
                                    value: erBeregningeAvslag ? "Avslag" : formatterBeløp(resultat.resultat, true),
                                },
                                {
                                    label: "BP har evne",
                                    value: resultat.bpHarEvne === false ? "Nei" : "Ja",
                                },
                                isSærbidragBetaltAvBpEnabled && {
                                    label: "Direkte betalt av BP",
                                    value: formatterBeløp(resultat.beregning?.beløpDirekteBetaltAvBp, true),
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
                    <UtgifsposterTabell utgifstposter={resultat.utgiftsposter} />
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
interface TableData {
    label: string;
    value: string | number;
}

interface GenericTableProps {
    data: TableData[]; // Array of data objects
    title?: string;
}

const UtgifsposterTabell: React.FC<{ utgifstposter: UtgiftspostDto[] }> = ({ utgifstposter }) => {
    return (
        <div>
            <Heading size="xsmall">{"Utgiftene lagt til grunn"}</Heading>
            <table className="table-auto text-left">
                <thead>
                    <tr>
                        <th className="pr-[16px]">{tekster.label.forfallsdato}</th>
                        <th className="px-[16px]">{tekster.label.utgift}</th>
                        <th className="px-[16px]">{tekster.label.kravbeløp}</th>
                        <th className="px-[16px]">{tekster.label.godkjentBeløp}</th>
                    </tr>
                </thead>
                <tbody>
                    {utgifstposter.map((utgifspost, rowIndex) => (
                        <tr key={rowIndex} className="pr-[16px]">
                            <td style={{ padding: "0 16px 0 0" }}>
                                {dateToDDMMYYYYString(dateOrNull(utgifspost.dato))}
                            </td>
                            <td className="px-[16px]">{utgifspost.utgiftstypeVisningsnavn}</td>
                            <td className="px-[16px] text-right">{formatterBeløp(utgifspost.kravbeløp, true)}</td>
                            <td className="px-[16px] text-right">{formatterBeløp(utgifspost.godkjentBeløp, true)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const ResultatTabell: React.FC<GenericTableProps> = ({ data, title }) => {
    return (
        <div>
            {title && <Heading size="xsmall">{title}</Heading>}
            <table>
                <thead>
                    <tr>
                        <tr>
                            <th></th>
                            <th></th>
                        </tr>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td style={{ paddingRight: "10px" }}>{row.label}: </td>
                            <td>{row.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default () => {
    return (
        <QueryErrorWrapper>
            <Vedtak />
        </QueryErrorWrapper>
    );
};
