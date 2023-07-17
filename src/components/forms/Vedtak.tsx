import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { useApi } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Button, Heading, Link, Loader, Table } from "@navikt/ds-react";
import { Suspense } from "react";
import { useParams } from "react-router-dom";

import { RolleType } from "../../api/BidragBehandlingApi";
import { Api as BidragVedtakApi } from "../../api/BidragVedtakApi";
import { useForskudd } from "../../context/ForskuddContext";
import environment from "../../environment";
import { useBeregnForskudd, useGetBehandling } from "../../hooks/useApiData";
import { FlexRow } from "../layout/grid/FlexRow";
import { PersonNavn } from "../PersonNavn";
import { RolleTag } from "../RolleTag";

const periodeToString = (periode?: number[]) => periode?.join("-")

const Vedtak = () => {
    const { saksnummer } = useParams<{ saksnummer?: string }>();
    const { behandlingId } = useForskudd();
    const { data: behandling } = useGetBehandling(behandlingId);
    const { data: {
        data: {
            feil: beregingFeil,
            resultat: beregingResultat,
        },
    } } = useBeregnForskudd(behandlingId);

    const vedtakApi = useApi(new BidragVedtakApi({ baseURL: environment.url.bidragSak }), "bidrag-vedtak", "fss");

    // const barn = behandling.roller.filter((r) => r.rolleType == RolleType.BARN);

    const sendeVedtak = (): void => {
        //TODO
        vedtakApi.vedtak
            .opprettVedtak({
                kilde: "MANUELT",
                type: "INDEKSREGULERING",
                opprettetAv: "",
                vedtakTidspunkt: "",
                enhetId: "",
                grunnlagListe: [],
            })
            .then((r) => { })
            .catch((e) => { });
        throw new Error("Function not implemented.");
    };

    const getNotatUrl = () => {
        const notatUrl = `/behandling/${behandlingId}/notat`;
        return saksnummer ? `/sak/${saksnummer}${notatUrl}` : notatUrl;
    };

    return (
        <div className="grid gap-y-8">
            <div className="grid gap-y-4">
                <Heading level="2" size="xlarge">
                    Vedtak
                </Heading>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Oppsummering
                </Heading>

                {beregingFeil?.map((feil) => <Alert variant="error">{feil}</Alert>)}

                {beregingResultat?.map((item, i) => item.beregnetForskuddPeriodeListe.map(forskudd =>
                    <div key={i + item.ident} className="mb-8">
                        <div className="my-8 flex items-center gap-x-2">
                            <RolleTag rolleType={RolleType.BARN} />
                            <BodyShort>
                                <PersonNavn ident={item.ident}></PersonNavn>
                                <span className="ml-4">{item.ident}</span>
                            </BodyShort>
                        </div>
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell scope="col">Type søknad</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Inntekt</Table.HeaderCell>
                                    {/* <Table.HeaderCell scope="col">Sivilstand til BM</Table.HeaderCell> */}
                                    <Table.HeaderCell scope="col">Resultat</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                <Table.Row>
                                    <Table.DataCell>{behandling.behandlingType}</Table.DataCell>
                                    <Table.DataCell>{periodeToString(forskudd.periode?.datoFom)} - {periodeToString(forskudd.periode.datoTil)}</Table.DataCell>
                                    <Table.DataCell>{forskudd.resultat.belop}</Table.DataCell>
                                    <Table.DataCell>{forskudd.resultat.kode}</Table.DataCell>
                                </Table.Row>
                            </Table.Body>
                        </Table>
                    </div>
                ))}
            </div>
            <Alert variant="info">
                <div className="grid gap-y-4">
                    <Heading level="3" size="medium">
                        Sjekk notat
                    </Heading>
                    <div>
                        Så snart vedtaket er fattet, kan den gjenfinnes i sakshistorik. Notatet blir generert automatisk
                        basert på opplysningene oppgitt.
                        <Link href={getNotatUrl()} target="_blank" className="font-bold ml-2">
                            Sjekk notat <ExternalLinkIcon aria-hidden />
                        </Link>
                    </div>
                </div>
            </Alert>
            <FlexRow>
                <Button loading={false} onClick={sendeVedtak} className="w-max" size="small">
                    Fatte vedtak
                </Button>
                <Button
                    type="button"
                    loading={false}
                    variant="secondary"
                    onClick={() => {
                        // TODO: legge til en sjekk/bekreftelse for å gå tilbake til bisys
                        // og kanskje stateId?
                        window.location.href = `${environment.url.bisys}Oppgaveliste.do`;
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

export default () => {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center">
                    <Loader size="3xlarge" title="venter..." variant="interaction" />
                </div>
            }
        >
            <Vedtak />
        </Suspense>
    );
};
