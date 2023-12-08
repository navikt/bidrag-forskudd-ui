import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { dateToDDMMYYYYString, RedirectTo, SecuritySessionUtils } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Button, Heading, Link, Table } from "@navikt/ds-react";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { useParams } from "react-router-dom";

import { Grunnlag, ResultatPeriode, RolleDtoRolleType } from "../../../api/BidragBehandlingApi";
import { OpprettGrunnlagRequestDto } from "../../../api/BidragVedtakApi";
import { BEHANDLING_API, BIDRAG_VEDTAK_API } from "../../../constants/api";
import { useForskudd } from "../../../context/ForskuddContext";
import { Avslag } from "../../../enum/Avslag";
import environment from "../../../environment";
import { useGetBehandling, usePersonsQueries } from "../../../hooks/useApiData";
import useFeatureToogle from "../../../hooks/useFeatureToggle";
import useVisningsnavn from "../../../hooks/useVisningsnavn";
import { mapBehandlingReferanseliste, mapGrunnlagPersonInfo } from "../../../mapper/VedtakBeregningkMapper";
import { uniqueByKey } from "../../../utils/array-utils";
import { toISODateTimeString } from "../../../utils/date-utils";
import { FlexRow } from "../../layout/grid/FlexRow";
import { PersonNavn } from "../../PersonNavn";
import { QueryErrorWrapper } from "../../query-error-boundary/QueryErrorWrapper";
import { RolleTag } from "../../RolleTag";
import UnderArbeidAlert from "../../UnderArbeidAlert";

function grunnlagTilOpprettGrunnlagRequestDto(grunnlag: Grunnlag): OpprettGrunnlagRequestDto {
    return {
        referanse: grunnlag.referanse,
        type: grunnlag.type,
        innhold: grunnlag.innhold,
    };
}

const Vedtak = () => {
    const { saksnummer } = useParams<{ saksnummer?: string }>();
    const { behandlingId } = useForskudd();
    const toVisningsnavn = useVisningsnavn();
    const { data: behandling } = useGetBehandling(behandlingId);
    const personsQueries = usePersonsQueries(behandling.roller);
    const isAvslag = behandling && Object.keys(Avslag).includes(behandling.getårsak);
    const { data: beregnetForskudd } = useSuspenseQuery({
        queryKey: ["beregning"],
        queryFn: () => BEHANDLING_API.api.beregnForskudd(behandlingId),
        select: (data) => data.data,
        enabled: !isAvslag,
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
                    type: behandling.søknadstype,
                    opprettetAv: saksBehandlerId,
                    opprettetAvNavn: saksBehandlerNavn,
                    vedtakTidspunkt: now,
                    enhetId: behandling.behandlerenhet,
                    grunnlagListe: [
                        //TODO: Skal inntekter ikke valgt tas med? Må da legge til valgt: true på innhold
                        //TODO: Inntekter må inkludere rolle (BIDRAGSMOTTAKER, BIDRAGSPLIKTIG, BARN)
                        //TODO: Skal barn i samme hustand men ikke i søknaden tas med i grunnlagslisten? (Kan feks i framtiden klage over feil tall på barn i hustand)
                        ...uniqueByKey(grunnlagListe, "referanse").map(grunnlagTilOpprettGrunnlagRequestDto),
                        ...mapGrunnlagPersonInfo(behandling, personInfoListe),
                    ],
                    stonadsendringListe: beregnetForskudd.resultat.map((resultat) => ({
                        type: behandling.behandlingtype,
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
                            <ul>{beregnetForskudd.feil?.map((f) => <li>{f}</li>)}</ul>
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
                                            <Table.DataCell>{toVisningsnavn(periode.resultat.kode)}</Table.DataCell>
                                            <Table.DataCell>{periode.resultat.belop}</Table.DataCell>
                                            <Table.DataCell>{periode.sivilstand}</Table.DataCell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                        </div>
                    ))}

                {behandling &&
                    isAvslag &&
                    behandling.roller
                        .filter((rolle) => rolle.rolleType === RolleDtoRolleType.BARN)
                        .map((barn, i) => (
                            <div key={i + barn.ident} className="mb-8">
                                <div className="my-4 flex items-center gap-x-2">
                                    <RolleTag rolleType={RolleDtoRolleType.BARN} />
                                    <BodyShort>
                                        <PersonNavn ident={barn.ident}></PersonNavn> /{" "}
                                        <span className="ml-1">{barn.ident}</span>
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
                                                {dateToDDMMYYYYString(
                                                    new Date(behandling.virkningsdato ?? behandling.datoFom)
                                                )}{" "}
                                                -
                                            </Table.DataCell>
                                            <Table.DataCell>Avslag</Table.DataCell>
                                            <Table.DataCell>{Avslag[behandling.getårsak]}</Table.DataCell>
                                        </Table.Row>
                                    </Table.Body>
                                </Table>
                            </div>
                        ))}
            </div>
            {!behandling.erVedtakFattet && !isAvslag && (
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
