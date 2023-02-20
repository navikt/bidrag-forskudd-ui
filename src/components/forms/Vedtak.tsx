import { ExternalLink } from "@navikt/ds-icons";
import { SuccessStroke } from "@navikt/ds-icons";
import { Button, ConfirmationPanel, Heading, Label, Link, Table } from "@navikt/ds-react";
import React, { useState } from "react";

import { useForskudd } from "../../context/ForskuddContext";
import { RolleType } from "../../enum/RolleType";
import environment from "../../environment";
import { FlexRow } from "../layout/grid/FlexRow";
import { RolleDetaljer } from "../RolleDetaljer";
import { RolleTag } from "../RolleTag";

export default () => {
    const [erBekreftet, setBekreftet] = useState(false);
    const { sak } = useForskudd();

    const rolle = {
        navn: "Mia  Cathrine Svendsen",
        fulltNavn: "Mia  Cathrine Svendsen",
        fodselsnummer: "081020 34566",
        type: RolleType.BM,
    };

    const antalBarn = 1;

    const data = [
        {
            rolle: RolleType.BA,
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
            rolle: RolleType.BA,
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
        throw new Error("Function not implemented.");
    };

    return (
        <div className="grid gap-y-8">
            <div className="grid gap-y-4">
                <Heading level="2" size="xlarge">
                    Fatte vedtak
                </Heading>
                <div>
                    <SuccessStroke
                        width={"1.5rem"}
                        height={"1.5rem"}
                        scale={2}
                        title="Suksess ikon"
                        color="var(--a-icon-success)"
                        style={{ display: "inline" }}
                    />
                    Totrinnskontroll: inntekt
                </div>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Oppsummering
                </Heading>
                <div>
                    <Label size="small">Barn i egen husstand: </Label> {antalBarn}
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

                <RolleDetaljer withBorder={false} rolle={rolle} />
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
                <Button disabled={!erBekreftet} loading={false} onClick={sendeVedtak} className="w-max" size="small">
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
    );
};
