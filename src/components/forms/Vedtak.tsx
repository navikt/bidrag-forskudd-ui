import { useApi } from "@navikt/bidrag-ui-common";
import { ExternalLink } from "@navikt/ds-icons";
import { Button, ConfirmationPanel, Heading, Label, Link, Loader, Table } from "@navikt/ds-react";
import React, { Suspense, useState } from "react";

import { RolleType } from "../../api/BidragBehandlingApi";
import { Api as BidragVedtakApi } from "../../api/BidragVedtakApi";
import { useForskudd } from "../../context/ForskuddContext";
import environment from "../../environment";
import { useApiData } from "../../hooks/useApiData";
import { FlexRow } from "../layout/grid/FlexRow";
import { RolleDetaljer } from "../RolleDetaljer";
import { RolleTag } from "../RolleTag";

export default () => {
    const [erBekreftet, setBekreftet] = useState(false);
    const { behandlingId } = useForskudd();
    const { api } = useApiData();
    const { data: behandling } = api.getBehandling(behandlingId);

    const vedtakApi = useApi(new BidragVedtakApi({ baseURL: environment.url.bidragSak }), "bidrag-vedtak", "fss");

    const getBmIndex = () => behandling.data.roller.findIndex((r) => r.rolleType == RolleType.BIDRAGS_MOTTAKER);
    const getBm = () =>
        getBmIndex() > 0
            ? behandling.data.roller[getBmIndex()]
            : {
                  id: -1,
                  rolleType: RolleType.BIDRAGS_MOTTAKER,
                  ident: "UKJENT",
                  opprettetDato: "",
                  navn: "UKJENT",
                  //eksistererer ikke, feil
              };

    const getBarn = () => behandling.data.roller.filter((r) => r.rolleType == RolleType.BARN);

    const data = [
        {
            rolle: RolleType.BARN,
            fnmr: "081020 34566",
            navn: "Amalia Svendsen",
            type: "Forskudd",
            periode: "01.07.2022 - 3108.2022",
            inntekt: "651 791",
            sivilsStandBm: "Ugift",
            resultat: "Opph pga høy inntekt",
            beløp: 0,
        },
        {
            rolle: RolleType.BARN,
            fnmr: "081020 34566",
            navn: "Amalia Svendsen",
            type: "Forskudd",
            periode: "01.07.2022 - 3108.2022",
            inntekt: "651 791",
            sivilsStandBm: "Ugift",
            resultat: "Opph pga høy inntekt",
            beløp: 0,
        },
    ];

    const sendeVedtak = (): void => {
        vedtakApi.vedtak
            .opprettVedtak({
                kilde: "MANUELT",
                type: "INDEKSREGULERING",
                opprettetAv: "",
                vedtakTidspunkt: "",
                enhetId: "",
                grunnlagListe: [],
            })
            .then((r) => {})
            .catch((e) => {});
        throw new Error("Function not implemented.");
    };

    return (
        <Suspense
            fallback={
                <div className="flex justify-center">
                    <Loader size="3xlarge" title="venter..." />
                </div>
            }
        >
            <div className="grid gap-y-8">
                <div className="grid gap-y-4">
                    <Heading level="2" size="xlarge">
                        Fatte vedtak
                    </Heading>
                    {/* <div>
                    <SuccessStroke
                        width={"1.5rem"}
                        height={"1.5rem"}
                        scale={2}
                        title="Suksess ikon"
                        color="var(--a-icon-success)"
                        style={{ display: "inline" }}
                    />
                    Totrinnskontroll: inntekt
                </div> */}
                </div>
                <div className="grid gap-y-4">
                    <Heading level="3" size="medium">
                        Oppsummering
                    </Heading>
                    <div>
                        <Label size="small">Barn i egen husstand: </Label> {getBarn().length}
                    </div>

                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell scope="col">Rolle</Table.HeaderCell>
                                <Table.HeaderCell scope="col">Fødselsnummer</Table.HeaderCell>
                                <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                                <Table.HeaderCell scope="col">Type søknad</Table.HeaderCell>
                                <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                                <Table.HeaderCell scope="col">Inntekt</Table.HeaderCell>
                                <Table.HeaderCell scope="col">Sivilstand til BM</Table.HeaderCell>
                                <Table.HeaderCell scope="col">Resultat</Table.HeaderCell>
                                <Table.HeaderCell scope="col">Beløp</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {data.map((item, i) => {
                                return (
                                    <Table.Row key={i + item.fnmr}>
                                        <Table.DataCell>
                                            <RolleTag rolleType={item.rolle} />
                                        </Table.DataCell>
                                        <Table.DataCell>{item.fnmr}</Table.DataCell>
                                        <Table.DataCell>{item.navn}</Table.DataCell>
                                        <Table.DataCell>{item.type}</Table.DataCell>
                                        <Table.DataCell>{item.periode}</Table.DataCell>
                                        <Table.DataCell>{item.inntekt}</Table.DataCell>
                                        <Table.DataCell>{item.sivilsStandBm}</Table.DataCell>
                                        <Table.DataCell>{item.resultat}</Table.DataCell>
                                        <Table.DataCell>{item.beløp}</Table.DataCell>
                                    </Table.Row>
                                );
                            })}
                        </Table.Body>
                    </Table>
                </div>

                <div className="grid gap-y-4">
                    <Heading level="3" size="medium">
                        Forsendelse gjelder:
                    </Heading>

                    <RolleDetaljer withBorder={false} rolle={getBm()} />
                </div>
                <div className="grid gap-y-4">
                    <Heading level="3" size="medium">
                        Sjekk notat
                    </Heading>
                    <div>
                        Så snart vedtaket er fattet, kan den gjenfinnes i sakshistorik. Notatet blir generert automatisk
                        basert på opplysningene oppgitt.
                        <Link href="#" onClick={() => {}} className="font-bold">
                            Sjekk notat <ExternalLink aria-hidden />
                        </Link>
                    </div>
                </div>
                <div>
                    <ConfirmationPanel
                        checked={erBekreftet}
                        label="Jeg har sjekket notat og opplysninger i søknaden og bekrefter at opplysningene stemmer."
                        onChange={() => {
                            setBekreftet(!erBekreftet);
                        }}
                    >
                        bekreft tekst
                    </ConfirmationPanel>
                </div>

                <FlexRow>
                    <Button
                        disabled={!erBekreftet}
                        loading={false}
                        onClick={sendeVedtak}
                        className="w-max"
                        size="small"
                    >
                        Fatte vedtak
                    </Button>
                    <Button
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
        </Suspense>
    );
};
