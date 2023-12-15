import { dateToDDMMYYYYString, RedirectTo } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Button, Heading, Table } from "@navikt/ds-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

import { RolleDtoRolleType } from "../../../api/BidragBehandlingApi";
import { ResultatForskuddsberegningBarn, ResultatRolle } from "../../../api/BidragBehandlingApiV1";
import { useForskudd } from "../../../context/ForskuddContext";
import { Avslag } from "../../../enum/Avslag";
import environment from "../../../environment";
import { QueryKeys, useGetBehandling, useGetBeregningForskudd } from "../../../hooks/useApiData";
import useFeatureToogle from "../../../hooks/useFeatureToggle";
import useVisningsnavn from "../../../hooks/useVisningsnavn";
import { VedtakBeregningResult } from "../../../types/vedtakTypes";
import { FlexRow } from "../../layout/grid/FlexRow";
import NotatButton from "../../NotatButton";
import { QueryErrorWrapper } from "../../query-error-boundary/QueryErrorWrapper";
import { RolleTag } from "../../RolleTag";
import UnderArbeidAlert from "../../UnderArbeidAlert";
import { mapToAntallBarnIHusstand, mapToInntekt, mapToSivilstand } from "../helpers/vedtakHelpers";

const Vedtak = () => {
    const { behandlingId, activeStep } = useForskudd();
    const { data: behandling } = useGetBehandling();
    const queryClient = useQueryClient();
    const isAvslag = behandling && Object.keys(Avslag).includes(behandling.årsak);
    const beregnetForskudd = queryClient.getQueryData<VedtakBeregningResult>(QueryKeys.beregningForskudd());

    useEffect(() => {
        queryClient.refetchQueries({ queryKey: QueryKeys.behandling(behandlingId) });
        queryClient.resetQueries({ queryKey: QueryKeys.beregningForskudd() });
    }, [activeStep]);

    return (
        <div className="grid gap-y-8">
            {behandling.erVedtakFattet && <Alert variant="warning">Vedtak er fattet for behandling</Alert>}
            <div className="grid gap-y-2">
                <Heading level="2" size="xlarge">
                    Vedtak
                </Heading>
            </div>
            <div className="grid gap-y-2">
                <Heading level="3" size="medium">
                    Oppsummering
                </Heading>

                {isAvslag ? <VedtakAvslag /> : <VedtakResultat />}
            </div>
            {!behandling.erVedtakFattet && !beregnetForskudd?.feil && (
                <>
                    <Alert variant="info">
                        <div className="grid gap-y-4">
                            <Heading level="3" size="medium">
                                Sjekk notat
                            </Heading>
                            <div>
                                Så snart vedtaket er fattet, kan den gjenfinnes i sakshistorikk. Notatet blir generert
                                automatisk basert på opplysningene oppgitt.
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
                        <BodyShort size="small">Det skjedde en feil ved fatte vedtak</BodyShort>
                    </div>
                </Alert>
            )}
            <FlexRow>
                <Button
                    loading={fatteVedtakFn.isPending}
                    disabled={isBeregningError || process.env.DISABLE_FATTE_VEDTAK == "true"}
                    onClick={() => fatteVedtakFn.mutate()}
                    className="w-max"
                    size="small"
                >
                    Fatte vedtak og gå til sakshistorikk
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
                    Avbryt
                </Button>
            </FlexRow>
        </div>
    );
};

const VedtakAvslag = () => {
    const { data: behandling } = useGetBehandling();
    return (
        <>
            {behandling.roller
                .filter((rolle) => rolle.rolleType === RolleDtoRolleType.BARN)
                .map((barn, i) => (
                    <div key={i + barn.ident} className="mb-8">
                        <div className="my-4 flex items-center gap-x-2">
                            <RolleTag rolleType={RolleDtoRolleType.BARN} />
                            <BodyShort>
                                {barn.navn} / <span className="ml-1">{barn.ident}</span> /{" "}
                                <span className="ml-1">{dateToDDMMYYYYString(new Date(barn.fodtDato))}</span>
                            </BodyShort>
                        </div>
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Resultat</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Årsak</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                <Table.Row>
                                    <Table.DataCell>
                                        {dateToDDMMYYYYString(new Date(behandling.virkningsdato ?? behandling.datoFom))}{" "}
                                        -
                                    </Table.DataCell>
                                    <Table.DataCell>Avslag</Table.DataCell>
                                    <Table.DataCell>{Avslag[behandling.årsak]}</Table.DataCell>
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
                        Kunne ikke beregne forskudd
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
            {beregnetForskudd.resultat?.resultatBarn?.map((r, i) => (
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

const VedtakTableBody = ({ resultatBarn }: { resultatBarn: ResultatForskuddsberegningBarn }) => {
    const toVisningsnavn = useVisningsnavn();

    return (
        <Table.Body>
            {resultatBarn.resultat.beregnetForskuddPeriodeListe.map((periode) => (
                <Table.Row>
                    <Table.DataCell>
                        {dateToDDMMYYYYString(new Date(periode.periode.fom))} -{" "}
                        {periode.periode.til ? dateToDDMMYYYYString(new Date(periode.periode.til)) : ""}
                    </Table.DataCell>
                    <Table.DataCell>{mapToInntekt(periode, resultatBarn.resultat.grunnlagListe)}</Table.DataCell>

                    <Table.DataCell>
                        {toVisningsnavn(mapToSivilstand(periode, resultatBarn.resultat.grunnlagListe))}
                    </Table.DataCell>

                    <Table.DataCell>
                        {mapToAntallBarnIHusstand(periode, resultatBarn.resultat.grunnlagListe)}
                    </Table.DataCell>
                    <Table.DataCell>{periode.resultat.belop}</Table.DataCell>
                    <Table.DataCell>{toVisningsnavn(periode.resultat.kode)}</Table.DataCell>
                </Table.Row>
            ))}
        </Table.Body>
    );
};

const VedtakResultatBarn = ({ barn }: { barn: ResultatRolle }) => (
    <div className="my-4 flex items-center gap-x-2">
        <RolleTag rolleType={RolleDtoRolleType.BARN} />
        <BodyShort>
            {barn.navn} / <span className="ml-1">{barn.ident}</span> /{" "}
            <span className="ml-1">{dateToDDMMYYYYString(new Date(barn.fødselsdato))}</span>
        </BodyShort>
    </div>
);
const VedtakTableHeader = () => (
    <Table.Header>
        <Table.Row>
            <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
            <Table.HeaderCell scope="col">Inntekt</Table.HeaderCell>
            <Table.HeaderCell scope="col">Sivilstand til BM</Table.HeaderCell>
            <Table.HeaderCell scope="col">Antall barn i husstand</Table.HeaderCell>
            <Table.HeaderCell scope="col">Forskudd</Table.HeaderCell>
            <Table.HeaderCell scope="col">Resultat</Table.HeaderCell>
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
