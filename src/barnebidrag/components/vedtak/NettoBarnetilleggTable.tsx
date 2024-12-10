import { Heading, Label, Table } from "@navikt/ds-react";

import { Rolletype } from "../../../api/BidragBehandlingApiV1";
import { ResultatTable } from "../../../common/components/vedtak/ResultatTable";
import { ROLE_FORKORTELSER } from "../../../common/constants/roleTags";
import { formatterBeløpForBeregning, formatterProsent } from "../../../utils/number-utils";
import { useBidragBeregningPeriode } from "./DetaljertBeregningBidrag";

type NettoBarnetilleggTableProps = {
    rolle: Rolletype;
};
// eslint-disable-next-line no-empty-pattern
export const NettoBarnetilleggTable = ({ rolle }: NettoBarnetilleggTableProps) => {
    const { beregningsdetaljer } = useBidragBeregningPeriode();

    const barnetillegg = rolle === Rolletype.BP ? beregningsdetaljer.barnetilleggBP : beregningsdetaljer.barnetilleggBM;
    return (
        <div>
            <Heading size="xsmall">Netto barnetillegg ({ROLE_FORKORTELSER[rolle]})</Heading>
            <ResultatTable
                data={[
                    {
                        label: "Skatteprosent",
                        textRight: false,
                        labelBold: true,
                        value: formatterProsent(barnetillegg.skattFaktor),
                    },
                    {
                        label: "Inntekt siste 12 mnd",
                        textRight: false,
                        labelBold: true,
                        value: formatterBeløpForBeregning(barnetillegg.sumInntekt),
                    },
                ].filter((d) => d)}
            />
            <Table size="small" className="table-fixed table bg-white w-full">
                <Table.Header>
                    <Table.Row className="align-baseline">
                        <Table.HeaderCell textSize="small" scope="col" align="left" className="w-[200px]">
                            Type barnetillegg
                        </Table.HeaderCell>
                        <Table.HeaderCell textSize="small" scope="col" align="left">
                            Brutto
                        </Table.HeaderCell>
                        <Table.HeaderCell textSize="small" scope="col" align="left">
                            Netto
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {barnetillegg.barnetillegg.map((bt) => (
                        <Table.Row className="align-top">
                            <Table.DataCell textSize="small">{bt.visningsnavn}</Table.DataCell>
                            <Table.DataCell textSize="small">
                                {formatterBeløpForBeregning(bt.bruttoBeløp)}
                            </Table.DataCell>
                            <Table.DataCell textSize="small">
                                {formatterBeløpForBeregning(bt.nettoBeløp)}
                            </Table.DataCell>
                        </Table.Row>
                    ))}
                    <Table.Row className="align-top">
                        <Table.DataCell textSize="small">
                            <Label size="small">Resultat</Label>
                        </Table.DataCell>
                        <Table.DataCell textSize="small">
                            {formatterBeløpForBeregning(barnetillegg.sumBruttoBeløp)}
                        </Table.DataCell>
                        <Table.DataCell textSize="small">
                            {formatterBeløpForBeregning(barnetillegg.sumNettoBeløp)}
                        </Table.DataCell>
                    </Table.Row>
                </Table.Body>
            </Table>
        </div>
    );
};
