import { QueryErrorWrapper } from "@common/components/query-error-boundary/QueryErrorWrapper";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { QueryKeys, useGetBehandlingV2, useGetBeregningSærbidrag } from "@common/hooks/useApiData";
import { VedtakBeregningResult } from "@commonTypes/vedtakTypes";
import { Alert, BodyShort, Heading, HStack } from "@navikt/ds-react";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";

import { Resultatkode } from "../../../api/BidragBehandlingApiV1";
import { AdminButtons } from "../../../common/components/vedtak/AdminButtons";
import { FatteVedtakButtons } from "../../../common/components/vedtak/FatteVedtakButtons";
import VedtakWrapper from "../../../common/components/vedtak/VedtakWrapper";
import { hentVisningsnavn } from "../../../common/hooks/useVisningsnavn";
import { formatterBeløp, formatterProsent } from "../../../utils/number-utils";
import { STEPS } from "../../constants/steps";

const Vedtak = () => {
    const { behandlingId, activeStep, lesemodus } = useBehandlingProvider();
    const { erVedtakFattet } = useGetBehandlingV2();
    const queryClient = useQueryClient();
    const beregnetForskudd = queryClient.getQueryData<VedtakBeregningResult>(QueryKeys.beregningSærbidrag());
    const isBeregningError = queryClient.getQueryState(QueryKeys.beregningSærbidrag())?.status === "error";

    useEffect(() => {
        queryClient.refetchQueries({ queryKey: QueryKeys.behandlingV2(behandlingId) });
        queryClient.resetQueries({ queryKey: QueryKeys.beregningSærbidrag() });
    }, [activeStep]);

    return (
        <div className="grid gap-y-4">
            {erVedtakFattet && !lesemodus && <Alert variant="warning">Vedtak er fattet for behandling</Alert>}
            <Heading level="2" size="medium">
                {text.title.vedtak}
            </Heading>
            <VedtakResultat />

            {!beregnetForskudd?.feil && !lesemodus && (
                <FatteVedtakButtons isBeregningError={isBeregningError} disabled />
            )}
            <AdminButtons />
        </div>
    );
};

const VedtakResultat = () => {
    const { data: beregnetSærbidrag } = useGetBeregningSærbidrag();

    const erDirekteAvslag = beregnetSærbidrag.resultat.erDirekteAvslag;
    const erBeregningeAvslag = beregnetSærbidrag.resultat.resultatKode !== Resultatkode.SAeRBIDRAGINNVILGET;
    const resultat = beregnetSærbidrag.resultat;
    return (
        <VedtakWrapper feil={beregnetSærbidrag.feil} steps={STEPS}>
            {erDirekteAvslag ? (
                <div>
                    <Heading size="small">Avslag</Heading>
                    <BodyShort size="small">
                        <dl className="bd_datadisplay">
                            <dt>Årsak</dt>
                            <dd>{hentVisningsnavn(resultat.resultatKode)}</dd>
                        </dl>
                    </BodyShort>
                </div>
            ) : (
                <div>
                    {erBeregningeAvslag ? (
                        <Heading spacing size="small">
                            {hentVisningsnavn(resultat.resultatKode)}
                        </Heading>
                    ) : (
                        <Heading spacing size="small">
                            Særbidrag innvilget
                        </Heading>
                    )}
                    <div>
                        <HStack gap={"12"} style={{ width: "max-content" }}>
                            <ResultatTabell
                                title="Inntekter"
                                data={[
                                    { label: "Inntekt BM", value: formatterBeløp(resultat.inntekter.inntektBM, true) },
                                    { label: "Inntekt BP", value: formatterBeløp(resultat.inntekter.inntektBP, true) },
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
                                        value: resultat.voksenIHusstanden ? "Ja" : "Nei",
                                    },
                                ]}
                            />
                            <ResultatTabell
                                title="Beregning"
                                data={[
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
                                        label: "Direkte betalt av BP",
                                        value: formatterBeløp(resultat.beregning?.beløpDirekteBetaltAvBp, true),
                                    },
                                    {
                                        label: "Beløp som innkreves",
                                        value: erBeregningeAvslag
                                            ? "Avslag"
                                            : formatterBeløp(resultat.beløpSomInnkreves, true),
                                    },
                                ]}
                            />
                        </HStack>
                    </div>
                </div>
            )}
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
