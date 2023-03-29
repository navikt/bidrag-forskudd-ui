import { Link, Loader, Table } from "@navikt/ds-react";
import React, { Suspense } from "react";

import { SOKNAD_LABELS } from "../../constants/soknadFraLabels";
import { useApiData } from "../../hooks/useApiData";
import PageWrapper from "../PageWrapper";

export const Index = () => {
    const { api } = useApiData();
    const behandlings = api.listBehandlings();

    return (
        <Suspense
            fallback={
                <div className="flex justify-center">
                    <Loader size="3xlarge" title="venter..." variant="interaction" />
                </div>
            }
        >
            <PageWrapper name="tracking-wide">
                <div className="max-w-[1092px] mx-auto px-6 py-6">
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell scope="col">ID</Table.HeaderCell>
                                <Table.HeaderCell scope="col">Saksnummer</Table.HeaderCell>
                                <Table.HeaderCell scope="col">Søknadstype</Table.HeaderCell>
                                <Table.HeaderCell scope="col">Søknad fra</Table.HeaderCell>
                                <Table.HeaderCell scope="col">Mottat dato</Table.HeaderCell>
                                <Table.HeaderCell scope="col">Søkt fra dato</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {behandlings.data.data.map((item, i) => {
                                return (
                                    <Table.Row key={i + item.id}>
                                        <Table.DataCell>
                                            <Link href={`/forskudd/${item.id}`} target="_blank" className="font-bold">
                                                {item.id}
                                            </Link>
                                        </Table.DataCell>
                                        <Table.DataCell>{item.saksnummer}</Table.DataCell>
                                        <Table.DataCell>{item.soknadType}</Table.DataCell>
                                        <Table.DataCell>{SOKNAD_LABELS[item.soknadFraType]}</Table.DataCell>
                                        <Table.DataCell>{item.mottatDato}</Table.DataCell>
                                        <Table.DataCell>{item.datoFom}</Table.DataCell>
                                    </Table.Row>
                                );
                            })}
                        </Table.Body>
                    </Table>
                </div>
            </PageWrapper>
        </Suspense>
    );
};
