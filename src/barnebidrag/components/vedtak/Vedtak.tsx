import { QueryErrorWrapper } from "@common/components/query-error-boundary/QueryErrorWrapper";
import { AdminButtons } from "@common/components/vedtak/AdminButtons";
import { FatteVedtakButtons } from "@common/components/vedtak/FatteVedtakButtons";
import VedtakWrapper from "@common/components/vedtak/VedtakWrapper";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { QueryKeys, useGetBehandlingV2, useGetBeregningBidrag } from "@common/hooks/useApiData";
import useFeatureToogle from "@common/hooks/useFeatureToggle";
import { dateToDDMMYYYYString, deductDays } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Heading, Table } from "@navikt/ds-react";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";

import {
    ResultatBidragsberegningBarnDto,
    ResultatRolle,
    Rolletype,
    Vedtakstype,
} from "../../../api/BidragBehandlingApiV1";
import { RolleTag } from "../../../common/components/RolleTag";
import { hentVisningsnavn } from "../../../common/hooks/useVisningsnavn";
import { VedtakBarnebidragBeregningResult } from "../../../types/vedtakTypes";
import { formatterBeløp, formatterBeløpForBeregning, formatterProsent } from "../../../utils/number-utils";
import { STEPS } from "../../constants/steps";
import { DetaljertBeregningBidrag } from "./DetaljertBeregningBidrag";

const Vedtak = () => {
    const { behandlingId, activeStep, lesemodus } = useBehandlingProvider();
    const { erVedtakFattet } = useGetBehandlingV2();
    const queryClient = useQueryClient();
    const { isFatteVedtakEnabled } = useFeatureToogle();
    const beregning = queryClient.getQueryData<VedtakBarnebidragBeregningResult>(QueryKeys.beregnBarnebidrag());
    const isBeregningError = queryClient.getQueryState(QueryKeys.beregnBarnebidrag())?.status === "error";

    useEffect(() => {
        queryClient.refetchQueries({ queryKey: QueryKeys.behandlingV2(behandlingId) });
        queryClient.resetQueries({ queryKey: QueryKeys.beregnBarnebidrag() });
    }, [activeStep]);

    return (
        <div className="grid gap-y-8 m-auto w-[1100px]">
            {erVedtakFattet && !lesemodus && <Alert variant="warning">Vedtak er fattet for behandling</Alert>}
            <div className="grid gap-y-2">
                <Heading level="2" size="medium">
                    {text.title.vedtak}
                </Heading>
            </div>
            <div className="grid gap-y-2">
                {!beregning?.feil && (
                    <Heading level="3" size="small">
                        {text.title.oppsummering}
                    </Heading>
                )}

                <VedtakResultat />
            </div>

            {!beregning?.feil && !lesemodus && isFatteVedtakEnabled && (
                <FatteVedtakButtons isBeregningError={isBeregningError} />
            )}
            <AdminButtons />
        </div>
    );
};

const VedtakResultat = () => {
    const { data: beregning } = useGetBeregningBidrag();
    const {
        virkningstidspunkt: { avslag },
        vedtakstype,
    } = useGetBehandlingV2();

    const erAvslag = avslag != null;
    return (
        <VedtakWrapper feil={beregning.feil} steps={STEPS}>
            {beregning.resultat?.resultatBarn?.map((r, i) => (
                <div key={i + r.barn.ident + r.barn.navn} className="mb-8">
                    <VedtakResultatBarn barn={r.barn} />
                    <Table size="small">
                        <VedtakTableHeader avslag={erAvslag} />
                        <VedtakTableBody
                            resultatBarn={r}
                            avslag={erAvslag}
                            opphør={vedtakstype === Vedtakstype.OPPHOR}
                        />
                    </Table>
                </div>
            ))}
        </VedtakWrapper>
    );
};

const VedtakTableBody = ({
    resultatBarn,
    avslag,
    opphør,
}: {
    resultatBarn: ResultatBidragsberegningBarnDto;
    avslag: boolean;
    opphør: boolean;
}) => {
    return (
        <Table.Body>
            {resultatBarn.perioder.map((periode) => (
                <>
                    {avslag ? (
                        <Table.Row>
                            <Table.DataCell textSize="small">
                                {dateToDDMMYYYYString(new Date(periode.periode.fom))} -{" "}
                                {periode.periode.til
                                    ? dateToDDMMYYYYString(deductDays(new Date(periode.periode.til), 1))
                                    : ""}
                            </Table.DataCell>
                            <Table.DataCell textSize="small">
                                {opphør ? text.label.opphør : text.label.avslag}
                            </Table.DataCell>
                            <Table.DataCell textSize="small">{periode.resultatkodeVisningsnavn}</Table.DataCell>
                        </Table.Row>
                    ) : (
                        <Table.ExpandableRow
                            togglePlacement="right"
                            content={<DetaljertBeregningBidrag periode={periode} />}
                        >
                            <Table.DataCell textSize="small">
                                {dateToDDMMYYYYString(new Date(periode.periode.fom))} -{" "}
                                {periode.periode.til
                                    ? dateToDDMMYYYYString(deductDays(new Date(periode.periode.til), 1))
                                    : ""}
                            </Table.DataCell>

                            <Table.DataCell textSize="small">
                                {formatterBeløp(
                                    periode.beregningsdetaljer.delberegningUnderholdskostnad.underholdskostnad
                                )}
                            </Table.DataCell>
                            <Table.DataCell textSize="small">
                                {formatterProsent(periode.bpsAndelU)} /{" "}
                                {formatterBeløpForBeregning(periode.beregningsdetaljer.bpsAndel.andelBeløp)}
                            </Table.DataCell>
                            <Table.DataCell textSize="small">
                                {formatterBeløpForBeregning(periode.samværsfradrag)}
                            </Table.DataCell>
                            <Table.DataCell textSize="small">
                                {formatterBeløpForBeregning(periode.beregnetBidrag)}
                            </Table.DataCell>

                            <Table.DataCell textSize="small">
                                {formatterBeløpForBeregning(periode.faktiskBidrag)}
                            </Table.DataCell>

                            <Table.DataCell textSize="small">{hentVisningsnavn(periode.resultatKode)}</Table.DataCell>
                        </Table.ExpandableRow>
                    )}
                </>
            ))}
        </Table.Body>
    );
};

const VedtakResultatBarn = ({ barn }: { barn: ResultatRolle }) => (
    <div className="my-4 flex items-center gap-x-2">
        <RolleTag rolleType={Rolletype.BA} />
        <BodyShort>
            {barn.navn} / <span className="ml-1">{barn.ident}</span>
        </BodyShort>
    </div>
);
const VedtakTableHeader = ({ avslag = false }: { avslag: boolean }) => (
    <Table.Header>
        {avslag ? (
            <Table.Row>
                <Table.HeaderCell textSize="small" scope="col">
                    {text.label.periode}
                </Table.HeaderCell>
                <Table.HeaderCell textSize="small" scope="col">
                    {text.label.resultat}
                </Table.HeaderCell>
                <Table.HeaderCell textSize="small" scope="col">
                    {text.label.årsak}
                </Table.HeaderCell>
            </Table.Row>
        ) : (
            <Table.Row>
                <Table.HeaderCell textSize="small" scope="col" style={{ width: "350px" }}>
                    {text.label.periode}
                </Table.HeaderCell>
                <Table.HeaderCell textSize="small" scope="col" style={{ width: "100px" }}>
                    U
                </Table.HeaderCell>
                <Table.HeaderCell textSize="small" scope="col" style={{ width: "200px" }}>
                    BPs andel U
                </Table.HeaderCell>
                <Table.HeaderCell textSize="small" scope="col" style={{ width: "150px" }}>
                    Samværsfradrag
                </Table.HeaderCell>
                <Table.HeaderCell textSize="small" scope="col" style={{ width: "200px" }}>
                    Beregnet bidrag
                </Table.HeaderCell>
                <Table.HeaderCell textSize="small" scope="col" style={{ width: "200px" }}>
                    Endelig bidrag
                </Table.HeaderCell>
                <Table.HeaderCell textSize="small" scope="col" style={{ width: "400px" }}>
                    Resultat
                </Table.HeaderCell>
                <Table.HeaderCell textSize="small" scope="col" style={{ width: "54px" }}></Table.HeaderCell>
            </Table.Row>
        )}
    </Table.Header>
);
export default () => {
    return (
        <QueryErrorWrapper>
            <Vedtak />
        </QueryErrorWrapper>
    );
};
