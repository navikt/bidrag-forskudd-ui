import { Heading, Label, Table } from "@navikt/ds-react";
import { ReactElement } from "react";
//file:@ts-ignore
interface CalculationTableData {
    label: string | ReactElement;
    labelBold?: boolean;
    value?: string | number | ReactElement;
    result: string | number | ReactElement;
}

interface CalculationTableProps {
    data: CalculationTableData[]; // Array of data objects
    title?: string;
    result?: {
        label: string;
        value: string | number | ReactElement;
    };
    message?: string | ReactElement;
    className?: string;
}

export const CalculationTabell: React.FC<CalculationTableProps> = ({ data, title, result, message, className }) => {
    return (
        <div className={className}>
            {title && <Heading size="xsmall">{title}</Heading>}
            <table className="table-auto  pb-[5px] border-collapse w-full">
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td colSpan={row.value ? 1 : 2}>{row.label}</td>
                            {row.value && <td className={"text-right w-[200px]"}>{row.value}</td>}
                            <td className={"text-right w-[100px]"}>{row.result}</td>
                        </tr>
                    ))}
                    {result && (
                        <tr className="border-t border-solid border-black border-b-2 border-l-0 border-r-0">
                            <td colSpan={2}>{result.label}</td>
                            <td className={"text-right w-[120px] "}>{result.value}</td>
                        </tr>
                    )}
                    {message && (
                        <tr className="mt-1">
                            <td colSpan={3}>{message}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export const CalculationTabellV2: React.FC<CalculationTableProps> = ({ data, title, result, message, className }) => {
    const harBeregning = data.some((d) => d.value);
    return (
        <div className={className}>
            {title && <Heading size="xsmall">{title}</Heading>}
            <Table size="small">
                <Table.Header>
                    <Table.Row></Table.Row>
                    <Table.HeaderCell textSize="small" className="w-[250px]">
                        Beskrivelse
                    </Table.HeaderCell>
                    {harBeregning && (
                        <Table.HeaderCell textSize="small" align="right" className="w-[150px]">
                            Beregning
                        </Table.HeaderCell>
                    )}
                    <Table.HeaderCell textSize="small" align="right" className="w-[150px]">
                        Beløp
                    </Table.HeaderCell>
                </Table.Header>
                <Table.Body>
                    {data.map((row, rowIndex) => (
                        <Table.Row key={rowIndex}>
                            <Table.DataCell textSize="small" className={`${row.labelBold ? "font-bold" : ""}`}>
                                {row.label}
                            </Table.DataCell>
                            {harBeregning && (
                                <Table.DataCell textSize="small" align="right">
                                    {row.value}
                                </Table.DataCell>
                            )}
                            <Table.DataCell textSize="small" align="right">
                                {row.result}
                            </Table.DataCell>
                        </Table.Row>
                    ))}
                    {result && (
                        <Table.Row>
                            <Table.DataCell textSize="small" colSpan={2}>
                                <Label size="small">{result.label}</Label>
                            </Table.DataCell>
                            <Table.DataCell textSize="small" className={"text-right w-[120px] "}>
                                {result.value}
                            </Table.DataCell>
                        </Table.Row>
                    )}
                    {message && (
                        <Table.Row className="mt-1">
                            <Table.DataCell textSize="small" colSpan={3}>
                                {message}
                            </Table.DataCell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>
        </div>
    );
};

interface MathDivisionProps {
    negativeValue?: boolean;
    top: string;
    bottom: number | string;
}

//@ts-ignore
export const MathDivision: React.FC<MathDivisionProps> = ({ negativeValue, top, bottom }) => {
    return (
        <math xmlns="http://www.w3.org/1998/Math/MathML" style={{ fontSize: "1.125rem" }}>
            <mrow>
                {negativeValue && <mi>-</mi>}
                <mn>{top}</mn>
                <mo>&#247;</mo> {/* Multiplication symbol */}
                <mn>{bottom}</mn>
            </mrow>
        </math>
    );
};

export const MathValue: React.FC<{ value: string | number; negativeValue?: boolean }> = ({ value, negativeValue }) => {
    return (
        <math xmlns="http://www.w3.org/1998/Math/MathML">
            <mrow>
                {negativeValue && <mi>-</mi>}
                <mn>{value}</mn>
            </mrow>
        </math>
    );
};
interface MathMultiplicationProps {
    negativeValue?: boolean;
    left: string;
    right: string | number;
}

export const MathMultiplication: React.FC<MathMultiplicationProps> = ({ negativeValue, left, right }) => {
    return (
        <math xmlns="http://www.w3.org/1998/Math/MathML" style={{ fontSize: "1.125rem" }}>
            <mrow>
                {negativeValue && <mi>-</mi>}
                <mn>{left}</mn>
                <mo>&#xD7;</mo> {/* Multiplication symbol */}
                <mn>{right}</mn>
            </mrow>
        </math>
    );
};
