import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { dateToDDMMYYYYString, RedirectTo, SecuritySessionUtils } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Button, Heading, Link, Table } from "@navikt/ds-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import { useParams } from "react-router-dom";

import { ResultatPeriode, RolleDtoRolleType } from "../../api/BidragBehandlingApi";
import { BIDRAG_VEDTAK_API } from "../../constants/api";
import { BEHANDLING_API } from "../../constants/api";
import { useForskudd } from "../../context/ForskuddContext";
import environment from "../../environment";
import { useGetBehandling, usePersonsQueries } from "../../hooks/useApiData";
import {
    mapBehandlingReferanseliste,
    mapGrunnlagPersonInfo,
    mapResultatKodeToDisplayValue,
} from "../../mapper/VedtakBeregningkMapper";
import { uniqueByKey } from "../../utils/array-utils";
import { toISODateTimeString } from "../../utils/date-utils";
import { FlexRow } from "../layout/grid/FlexRow";
import { PersonNavn } from "../PersonNavn";
import { QueryErrorWrapper } from "../query-error-boundary/QueryErrorWrapper";
import { RolleTag } from "../RolleTag";

const Vedtak = () => {
    const { saksnummer } = useParams<{ saksnummer?: string }>();
    const { behandlingId } = useForskudd();
    const { data: behandling } = useGetBehandling(behandlingId);
    const personsQueries = usePersonsQueries(behandling.roller);
    const { data: beregnetForskudd } = useQuery({
        queryKey: ["beregning"],
        queryFn: () => BEHANDLING_API.api.beregnForskudd(behandlingId),
        select: (data) => data.data,
    });
    const fatteVedtakFn = useMutation({
        mutationFn: async () => {
            if (process.env.DISABLE_FATTE_VEDTAK == "true") return;
            const now = toISODateTimeString(new Date())!;

            if (behandling && beregnetForskudd && beregnetForskudd.resultat) {
                const saksBehandlerId = await SecuritySessionUtils.hentSaksbehandlerId();
                const saksBehandlerNavn = await SecuritySessionUtils.hentSaksbehandlerNavn();
                const grunnlagListe = beregnetForskudd.resultat!.flatMap((i) => i.grunnlagListe || []) || [];
                const personInfoListe = personsQueries.map((p) => p.data);
                const bidragsMottaker = behandling.roller.find(
                    (rolle) => rolle.rolleType == RolleDtoRolleType.BIDRAGSMOTTAKER
                );
                const { data: vedtakId } = await BIDRAG_VEDTAK_API.vedtak.opprettVedtak({
                    kilde: "MANUELT",
                    type: behandling.soknadType,
                    opprettetAv: saksBehandlerId,
                    opprettetAvNavn: saksBehandlerNavn,
                    vedtakTidspunkt: now,
                    enhetId: behandling.behandlerEnhet,
                    grunnlagListe: [
                        //TODO: Skal inntekter ikke valgt tas med? Må da legge til valgt: true på innhold
                        //TODO: Inntekter må inkludere rolle (BIDRAGSMOTTAKER, BIDRAGSPLIKTIG, BARN)
                        //TODO: Skal barn i samme hustand men ikke i søknaden tas med i grunnlagslisten? (Kan feks i framtiden klage over feil tall på barn i hustand)
                        ...uniqueByKey(grunnlagListe, "referanse"),
                        ...mapGrunnlagPersonInfo(behandling, personInfoListe),
                    ],
                    stonadsendringListe: beregnetForskudd.resultat.map((resultat) => ({
                        type: behandling.behandlingType,
                        sakId: saksnummer,
                        skyldnerId: "NAV",
                        kravhaverId: resultat.ident,
                        innkreving: "JA",
                        endring: false,
                        mottakerId: bidragsMottaker.ident,
                        periodeListe: resultat.beregnetForskuddPeriodeListe.map((liste) => ({
                            fomDato: liste.periode?.datoFom,
                            tilDato: liste.periode?.datoTil,
                            belop: liste.resultat.belop,
                            valutakode: "NOK",
                            resultatkode: liste.resultat.kode,
                            grunnlagReferanseListe: liste.grunnlagReferanseListe,
                        })),
                    })),
                    behandlingsreferanseListe: mapBehandlingReferanseliste(behandlingId, behandling),
                });

                await BEHANDLING_API.api.oppdaterVedtakId(behandlingId, vedtakId);
            }
        },
        onSuccess: () => {
            RedirectTo.sakshistorikk(saksnummer, environment.url.bisys);
        },
    });

    const getNotatUrl = () => {
        const notatUrl = `/behandling/${behandlingId}/notat`;
        return saksnummer ? `/sak/${saksnummer}${notatUrl}` : notatUrl;
    };

    const getInntektForPeriode = (periode: ResultatPeriode): number => {
        const grunnlagListe = beregnetForskudd.resultat[0].grunnlagListe;
        const inntekter = grunnlagListe
            .filter((g) => g.type == "INNTEKT")
            .filter((g) => periode.grunnlagReferanseListe.includes(g.referanse));
        return inntekter.reduce((currentValue, g) => (g.innhold["belop"] as number) + currentValue, 0);
    };

    return (
        <div className="grid gap-y-8">
            {beregnetForskudd?.feil && (
                <Alert variant="error" className="w-8/12 m-auto mt-8">
                    <div>
                        <BodyShort size="small">
                            <ul>
                                {beregnetForskudd.feil?.map((f) => (
                                    <li>{f}</li>
                                ))}
                            </ul>
                        </BodyShort>
                    </div>
                </Alert>
            )}
            {fatteVedtakFn.isError && (
                <Alert variant="error" className="w-8/12 m-auto mt-8">
                    <div>
                        <BodyShort size="small">Det skjedde en feil ved fatte vedtak</BodyShort>
                    </div>
                </Alert>
            )}
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

                {behandling &&
                    beregnetForskudd &&
                    beregnetForskudd.resultat?.map((r, i) => (
                        <div key={i + r.ident} className="mb-8">
                            <div className="my-4 flex items-center gap-x-2">
                                <RolleTag rolleType={RolleDtoRolleType.BARN} />
                                <BodyShort>
                                    <PersonNavn ident={r.ident}></PersonNavn> / <span className="ml-1">{r.ident}</span>
                                </BodyShort>
                            </div>
                            <Table>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                                        <Table.HeaderCell scope="col">Inntekt</Table.HeaderCell>
                                        <Table.HeaderCell scope="col">Resultat</Table.HeaderCell>
                                        <Table.HeaderCell scope="col">Forskudd</Table.HeaderCell>
                                        <Table.HeaderCell scope="col">Sivilstand til BM</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {r.beregnetForskuddPeriodeListe.map((periode) => (
                                        <Table.Row>
                                            <Table.DataCell>
                                                {dateToDDMMYYYYString(new Date(periode.periode.datoFom))} -{" "}
                                                {periode.periode.datoTil
                                                    ? dateToDDMMYYYYString(new Date(periode.periode.datoTil))
                                                    : ""}
                                            </Table.DataCell>
                                            <Table.DataCell>{getInntektForPeriode(periode)}</Table.DataCell>
                                            <Table.DataCell>
                                                {mapResultatKodeToDisplayValue(periode.resultat.kode)}
                                            </Table.DataCell>
                                            <Table.DataCell>{periode.resultat.belop}</Table.DataCell>
                                            <Table.DataCell>{periode.sivilstandType}</Table.DataCell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                        </div>
                    ))}
            </div>
            {!behandling.erVedtakFattet && (
                <>
                    <Alert variant="info">
                        <div className="grid gap-y-4">
                            <Heading level="3" size="medium">
                                Sjekk notat
                            </Heading>
                            <div>
                                Så snart vedtaket er fattet, kan den gjenfinnes i sakshistorikk. Notatet blir generert
                                automatisk basert på opplysningene oppgitt.
                                <Link href={getNotatUrl()} target="_blank" className="font-bold ml-2">
                                    Sjekk notat <ExternalLinkIcon aria-hidden />
                                </Link>
                            </div>
                        </div>
                    </Alert>
                    <FlexRow>
                        <Button
                            loading={fatteVedtakFn.isLoading}
                            disabled={
                                (beregnetForskudd && beregnetForskudd.feil && beregnetForskudd.feil.length > 0) ||
                                process.env.DISABLE_FATTE_VEDTAK == "true"
                            }
                            onClick={() => fatteVedtakFn.mutate()}
                            className="w-max"
                            size="small"
                        >
                            Fatte vedtak og gå til sakshistorikk
                        </Button>
                        <Button
                            type="button"
                            loading={false}
                            disabled={fatteVedtakFn.isLoading}
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
                </>
            )}
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
