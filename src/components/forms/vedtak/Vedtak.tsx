import { dateToDDMMYYYYString, RedirectTo } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Button, Heading, Table } from "@navikt/ds-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

import { ResultatBeregningBarnDto, ResultatRolle, Rolletype } from "../../../api/BidragBehandlingApiV1";
import text from "../../../constants/texts";
import { useForskudd } from "../../../context/ForskuddContext";
import environment from "../../../environment";
import { QueryKeys, useGetBehandlingV2, useGetBeregningForskudd } from "../../../hooks/useApiData";
import useFeatureToogle from "../../../hooks/useFeatureToggle";
import { hentVisningsnavn } from "../../../hooks/useVisningsnavn";
import { VedtakBeregningResult } from "../../../types/vedtakTypes";
import { FlexRow } from "../../layout/grid/FlexRow";
import NotatButton from "../../NotatButton";
import { QueryErrorWrapper } from "../../query-error-boundary/QueryErrorWrapper";
import { RolleTag } from "../../RolleTag";
import UnderArbeidAlert from "../../UnderArbeidAlert";

const Vedtak = () => {
    const { behandlingId, activeStep } = useForskudd();
    const {
        erVedtakFattet,
        virkningstidspunkt: { avslag },
    } = useGetBehandlingV2();
    const queryClient = useQueryClient();
    const isAvslag = avslag != null;
    const beregnetForskudd = queryClient.getQueryData<VedtakBeregningResult>(QueryKeys.beregningForskudd());

    useEffect(() => {
        queryClient.refetchQueries({ queryKey: QueryKeys.behandlingV2(behandlingId) });
        queryClient.resetQueries({ queryKey: QueryKeys.beregningForskudd() });
    }, [activeStep]);

    return (
        <div className="grid gap-y-8">
            {erVedtakFattet && <Alert variant="warning">Vedtak er fattet for behandling</Alert>}
            <div className="grid gap-y-2">
                <Heading level="2" size="xlarge">
                    {text.title.vedtak}
                </Heading>
            </div>
            <div className="grid gap-y-2">
                <Heading level="3" size="medium">
                    {text.title.oppsummering}
                </Heading>

                {isAvslag ? <VedtakAvslag /> : <VedtakResultat />}
            </div>
            {!erVedtakFattet && !beregnetForskudd?.feil && (
                <>
                    <Alert variant="info">
                        <div className="grid gap-y-4">
                            <Heading level="3" size="medium">
                                {text.title.sjekkNotat}
                            </Heading>
                            <div>
                                {text.varsel.vedtakNotat}
                                <NotatButton />
                            </div>
                        </div>
                    </Alert>
                </>
            )}
            {!beregnetForskudd?.feil && <FatteVedtakButtons />}
        </div>
    );
};

const FatteVedtakButtons = () => {
    const { isFatteVedtakEnabled } = useFeatureToogle();
    const { saksnummer } = useParams<{ saksnummer?: string }>();
    const queryClient = useQueryClient();
    const isBeregningError = queryClient.getQueryState(QueryKeys.beregningForskudd())?.status == "error";
    const fatteVedtakFn = useMutation({
        mutationFn: async () => {
            console.log("Fatte vedtak");
            return new Promise((resolve) => {
                setTimeout(resolve, 2000);
            });
        },
        onSuccess: () => {
            // RedirectTo.sakshistorikk(saksnummer, environment.url.bisys);
        },
    });

    return (
        <div>
            {fatteVedtakFn.isError && (
                <Alert variant="error" className="w-8/12 m-auto mt-8">
                    <div>
                        <BodyShort size="small">{text.error.fatteVedtak}</BodyShort>
                    </div>
                </Alert>
            )}
            <FlexRow>
                <Button
                    loading={fatteVedtakFn.isPending}
                    disabled={isBeregningError || !isFatteVedtakEnabled}
                    onClick={() => fatteVedtakFn.mutate()}
                    className="w-max"
                    size="small"
                >
                    {text.label.fatteVedtakButton}
                </Button>
                <Button
                    type="button"
                    loading={false}
                    disabled={fatteVedtakFn.isPending}
                    variant="secondary"
                    onClick={() => {
                        RedirectTo.sakshistorikk(saksnummer, environment.url.bisys);
                    }}
                    className="w-max"
                    size="small"
                >
                    {text.label.avbryt}
                </Button>
            </FlexRow>
        </div>
    );
};

const VedtakAvslag = () => {
    const {
        roller,
        virkningstidspunkt: { virkningstidspunkt, avslag },
        søktFomDato,
    } = useGetBehandlingV2();
    return (
        <>
            {roller
                .filter((rolle) => rolle.rolletype === Rolletype.BA)
                .map((barn, i) => (
                    <div key={i + barn.ident + avslag} className="mb-8">
                        <div className="my-4 flex items-center gap-x-2">
                            <RolleTag rolleType={Rolletype.BA} />
                            <BodyShort>
                                {barn.navn} / <span className="ml-1">{barn.ident}</span> /{" "}
                                <span className="ml-1">{dateToDDMMYYYYString(new Date(barn.fødselsdato))}</span>
                            </BodyShort>
                        </div>
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell scope="col">{text.label.periode}</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">{text.label.resultat}</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">{text.label.årsak}</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                <Table.Row>
                                    <Table.DataCell>
                                        {dateToDDMMYYYYString(new Date(virkningstidspunkt ?? søktFomDato))} -
                                    </Table.DataCell>
                                    <Table.DataCell>{text.label.avslag}</Table.DataCell>
                                    <Table.DataCell>{hentVisningsnavn(avslag)}</Table.DataCell>
                                </Table.Row>
                            </Table.Body>
                        </Table>
                    </div>
                ))}
        </>
    );
};
const VedtakResultat = () => {
    const { data: beregnetForskudd } = useGetBeregningForskudd();
    if (beregnetForskudd.feil) {
        return (
            <Alert variant="warning" className="w-8/12 m-auto mt-8">
                <div>
                    <Heading spacing size="small" level="3">
                        {text.varsel.beregneFeil}
                    </Heading>
                    <BodyShort size="small">
                        <ul>{beregnetForskudd.feil?.map((feil) => <li>{feil}</li>)}</ul>
                    </BodyShort>
                </div>
            </Alert>
        );
    }
    return (
        <>
            {beregnetForskudd.resultat?.map((r, i) => (
                <div key={i + r.barn.ident + r.barn.navn} className="mb-8">
                    <VedtakResultatBarn barn={r.barn} />
                    <Table>
                        <VedtakTableHeader />
                        <VedtakTableBody resultatBarn={r} />
                    </Table>
                </div>
            ))}
        </>
    );
};

const VedtakTableBody = ({ resultatBarn }: { resultatBarn: ResultatBeregningBarnDto }) => {
    return (
        <Table.Body>
            {resultatBarn.perioder.map((periode) => (
                <Table.Row>
                    <Table.DataCell>
                        {dateToDDMMYYYYString(new Date(periode.periode.fom))} -{" "}
                        {periode.periode.til ? dateToDDMMYYYYString(new Date(periode.periode.til)) : ""}
                    </Table.DataCell>
                    <Table.DataCell>{periode.inntekt}</Table.DataCell>

                    <Table.DataCell>{hentVisningsnavn(periode.sivilstand)}</Table.DataCell>

                    <Table.DataCell>{periode.antallBarnIHusstanden}</Table.DataCell>
                    <Table.DataCell>{periode.beløp}</Table.DataCell>
                    <Table.DataCell>{hentVisningsnavn(periode.resultatKode)}</Table.DataCell>
                </Table.Row>
            ))}
        </Table.Body>
    );
};

const VedtakResultatBarn = ({ barn }: { barn: ResultatRolle }) => (
    <div className="my-4 flex items-center gap-x-2">
        <RolleTag rolleType={Rolletype.BA} />
        <BodyShort>
            {barn.navn} / <span className="ml-1">{barn.ident}</span> /{" "}
            <span className="ml-1">{dateToDDMMYYYYString(new Date(barn.fødselsdato))}</span>
        </BodyShort>
    </div>
);
const VedtakTableHeader = () => (
    <Table.Header>
        <Table.Row>
            <Table.HeaderCell scope="col">{text.label.periode}</Table.HeaderCell>
            <Table.HeaderCell scope="col">{text.label.inntekt}</Table.HeaderCell>
            <Table.HeaderCell scope="col">{text.label.sivilstandBM}</Table.HeaderCell>
            <Table.HeaderCell scope="col">{text.label.antallBarn}</Table.HeaderCell>
            <Table.HeaderCell scope="col">{text.label.forskudd}</Table.HeaderCell>
            <Table.HeaderCell scope="col">{text.label.resultat}</Table.HeaderCell>
        </Table.Row>
    </Table.Header>
);
export default () => {
    const { isVedtakSkjermbildeEnabled } = useFeatureToogle();

    if (!isVedtakSkjermbildeEnabled) {
        return <UnderArbeidAlert />;
    }
    return (
        <QueryErrorWrapper>
            <Vedtak />
        </QueryErrorWrapper>
    );
};
