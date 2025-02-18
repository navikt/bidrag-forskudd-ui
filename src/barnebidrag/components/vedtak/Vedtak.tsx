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
import React, { Fragment, useEffect } from "react";

import {
    ResultatBidragsberegningBarnDto,
    ResultatRolle,
    Rolletype,
    Samvaersklasse,
    Vedtakstype,
} from "../../../api/BidragBehandlingApiV1";
import PersonNavnIdent from "../../../common/components/PersonNavnIdent";
import { RolleTag } from "../../../common/components/RolleTag";
import { ResultatDescription } from "../../../common/components/vedtak/ResultatDescription";
import { hentVisningsnavn } from "../../../common/hooks/useVisningsnavn";
import { VedtakBarnebidragBeregningResult } from "../../../types/vedtakTypes";
import { formatterBeløpForBeregning, formatterProsent } from "../../../utils/number-utils";
import { STEPS } from "../../constants/steps";
import { DetaljertBeregningBidrag } from "./DetaljertBeregningBidrag";

const Vedtak = () => {
    const { behandlingId, activeStep, lesemodus } = useBehandlingProvider();
    const { erVedtakFattet, kanBehandlesINyLøsning } = useGetBehandlingV2();
    const queryClient = useQueryClient();
    const { isFatteVedtakEnabled } = useFeatureToogle();
    const beregning = queryClient.getQueryData<VedtakBarnebidragBeregningResult>(QueryKeys.beregnBarnebidrag());
    const isBeregningError = queryClient.getQueryState(QueryKeys.beregnBarnebidrag())?.status === "error";

    useEffect(() => {
        queryClient.refetchQueries({ queryKey: QueryKeys.behandlingV2(behandlingId) });
        queryClient.resetQueries({ queryKey: QueryKeys.beregnBarnebidrag() });
    }, [activeStep]);

    return (
        <div className="grid gap-y-8  w-[1100px]">
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

            {!beregning?.feil && !lesemodus && isFatteVedtakEnabled && !beregning?.ugyldigBeregning && (
                <FatteVedtakButtons
                    isBeregningError={isBeregningError}
                    disabled={!kanBehandlesINyLøsning || !isFatteVedtakEnabled}
                />
            )}
            <AdminButtons />
        </div>
    );
};

const VedtakUgyldigBeregning = ({ resultat }: { resultat: ResultatBidragsberegningBarnDto }) => {
    if (!resultat.ugyldigBeregning) return null;
    return (
        <Alert variant="warning" size="small" className="mb-2">
            <Heading size="small">{resultat.ugyldigBeregning.tittel}</Heading>
            <BodyShort size="small">Kan ikke fatte vedtak</BodyShort>
            <BodyShort size="small">{resultat.ugyldigBeregning.begrunnelse}</BodyShort>
        </Alert>
    );
};

const VedtakResultat = () => {
    const { data: beregning } = useGetBeregningBidrag();
    const {
        virkningstidspunkt: { avslag },
        vedtakstype,
    } = useGetBehandlingV2();

    const erAvslag = avslag !== null && avslag !== undefined;
    return (
        <VedtakWrapper feil={beregning.feil} steps={STEPS}>
            {beregning.resultat?.resultatBarn?.map((r, i) => (
                <div key={i + r.barn.ident + r.barn.navn} className="mb-8">
                    <VedtakResultatBarn barn={r.barn} />
                    <VedtakUgyldigBeregning resultat={r} />
                    {r.barn.innbetaltBeløp && (
                        <ResultatDescription
                            data={[
                                {
                                    label: "Innbetalt beløp",
                                    textRight: false,
                                    labelBold: true,
                                    value: formatterBeløpForBeregning(r.barn.innbetaltBeløp),
                                },
                            ].filter((d) => d)}
                        />
                    )}
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
            {resultatBarn.perioder.map((periode, index) => (
                <Fragment key={periode.periode.fom + index}>
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
                            expandOnRowClick
                            expansionDisabled={
                                periode.beregningsdetaljer?.sluttberegning?.barnetErSelvforsørget ||
                                periode.beregningsdetaljer?.sluttberegning?.ikkeOmsorgForBarnet
                            }
                            content={<DetaljertBeregningBidrag periode={periode} />}
                        >
                            <Table.DataCell textSize="small">
                                {dateToDDMMYYYYString(new Date(periode.periode.fom))} -{" "}
                                {periode.periode.til
                                    ? dateToDDMMYYYYString(deductDays(new Date(periode.periode.til), 1))
                                    : ""}
                            </Table.DataCell>

                            <Table.DataCell textSize="small">
                                {formatterBeløpForBeregning(periode.underholdskostnad)}
                            </Table.DataCell>
                            <Table.DataCell textSize="small">
                                <table>
                                    <tbody>
                                        <tr>
                                            <td className="w-[45px]" align="right">
                                                {formatterProsent(periode.bpsAndelU)}
                                            </td>
                                            <td className="w-[10px]">/</td>
                                            <td>{formatterBeløpForBeregning(periode.bpsAndelBeløp)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </Table.DataCell>
                            <Table.DataCell textSize="small">
                                <table>
                                    <tbody>
                                        {periode.beregningsdetaljer.samværsfradrag != null ? (
                                            <tr>
                                                <td className="w-[45px]" align="right">
                                                    {formatterBeløpForBeregning(periode.samværsfradrag)}
                                                </td>
                                                <td className="w-[10px]">/</td>
                                                <td>
                                                    {periode.beregningsdetaljer.samværsfradrag.samværsklasse ===
                                                        Samvaersklasse.DELT_BOSTED
                                                        ? "D"
                                                        : hentVisningsnavn(
                                                            periode.beregningsdetaljer.samværsfradrag.samværsklasse
                                                        )}
                                                </td>
                                            </tr>
                                        ) : (
                                            <tr></tr>
                                        )}
                                    </tbody>
                                </table>
                            </Table.DataCell>
                            <Table.DataCell textSize="small">
                                <table>
                                    <tbody>
                                        <tr>
                                            <td className="w-[45px]" align="right">
                                                {formatterBeløpForBeregning(
                                                    periode.beregningsdetaljer.delberegningBidragsevne?.bidragsevne
                                                )}
                                            </td>
                                            <td className="w-[10px]">/</td>
                                            <td>
                                                {formatterBeløpForBeregning(
                                                    periode.beregningsdetaljer.delberegningBidragsevne
                                                        ?.sumInntekt25Prosent
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </Table.DataCell>

                            <Table.DataCell textSize="small">
                                {formatterBeløpForBeregning(periode.beregnetBidrag)}
                            </Table.DataCell>

                            <Table.DataCell textSize="small">
                                {formatterBeløpForBeregning(periode.faktiskBidrag)}
                            </Table.DataCell>

                            <Table.DataCell textSize="small">{periode.resultatkodeVisningsnavn}</Table.DataCell>
                        </Table.ExpandableRow>
                    )}
                </Fragment>
            ))}
        </Table.Body>
    );
};

const VedtakResultatBarn = ({ barn }: { barn: ResultatRolle }) => (
    <div className="my-4 flex items-center gap-x-2">
        <RolleTag rolleType={Rolletype.BA} />
        <BodyShort>
            <PersonNavnIdent ident={barn.ident} navn={barn.navn} variant="compact" />
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
                <Table.HeaderCell textSize="small" scope="col" style={{ width: "80px" }}>
                    U
                </Table.HeaderCell>
                <Table.HeaderCell textSize="small" scope="col" style={{ width: "150px" }}>
                    BPs andel U
                </Table.HeaderCell>
                <Table.HeaderCell textSize="small" scope="col" style={{ width: "100px" }}>
                    Samvær
                </Table.HeaderCell>
                <Table.HeaderCell textSize="small" scope="col" style={{ width: "70px" }}>
                    Evne / 25%
                </Table.HeaderCell>
                <Table.HeaderCell textSize="small" scope="col" style={{ width: "230px" }}>
                    Beregnet bidrag
                </Table.HeaderCell>
                <Table.HeaderCell textSize="small" scope="col" style={{ width: "230px" }}>
                    Endelig bidrag
                </Table.HeaderCell>
                <Table.HeaderCell textSize="small" scope="col" style={{ width: "350px" }}>
                    Resultat
                </Table.HeaderCell>
                <Table.HeaderCell textSize="small" scope="col" style={{ width: "24px" }}></Table.HeaderCell>
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
