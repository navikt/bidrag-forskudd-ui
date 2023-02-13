import { ExternalLink } from "@navikt/ds-icons";
import { Button, ConfirmationPanel, Heading, Link, Table, Tag } from "@navikt/ds-react";
import React from "react";
import { RolleType } from "../../enum/RolleType";

import { CommonFormProps } from "../../pages/forskudd/ForskuddPage";
import { RolleDetaljer } from "../RolleDetaljer";
import { RolleTag } from "../RolleTag";

export default function Vedtak({ setActiveStep }: CommonFormProps) {
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
    ]
    return (
        <div>
            <Heading level="2" size="large">
                Fatte vedtak
            </Heading>
            <div>
                Totrinnskontroll: inntekt
            </div>
            <Heading level="3" size="medium">
                Oppsummering
            </Heading>
            <div>
            Barn i egen husstand: 
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

            <Heading level="3" size="medium">
                Forsendelse gjelder:
            </Heading>
            <div>
                <RolleDetaljer rolle={{
                    navn: "Mia  Cathrine Svendsen",
                    fulltNavn: "Mia  Cathrine Svendsen",
                    fodselsnummer: "081020 34566",
                    type: RolleType.BM
                }} />
            </div>
            <Heading level="3" size="medium">
                Sjekk notat
            </Heading>
            <div>
            Så snart vedtaket er fattet, kan den gjenfinnes i sakshistorik. Notatet blir generert automatisk basert  på opplysningene oppgitt.   
            </div>
            <div>
                <Link href="#" onClick={() => {}} className="font-bold">
                    Sjekk notat <ExternalLink aria-hidden />
                </Link>
            </div>
            <div>
                <ConfirmationPanel
                    // checked={state}
                    label="Jeg har sjekket notat og opplysninger i søknaden og bekrefter at opplysningene stemmer."
                    onChange={() => {}}
                    >
                    bekreft tekst
                </ConfirmationPanel>
            </div>

            <div className="mt-4">
                <Button loading={false} onClick={() => {}} className="w-max">
                    Fatte veddtak
                </Button>
                <Button loading={false} variant="secondary" onClick={() => {}} className="w-max">
                    Avbryt
                </Button>
            </div>
        </div>
    );
}
