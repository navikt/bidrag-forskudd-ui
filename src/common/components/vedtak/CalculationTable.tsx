import { Heading } from "@navikt/ds-react";
import { ReactElement } from "react";
//file:@ts-ignore
interface CalculationTableData {
    label: string;
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
}

export const CalculationTabell: React.FC<CalculationTableProps> = ({ data, title, result, message }) => {
    return (
        <div>
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
                            <td className={"text-right w-[100px] "}>{result.value}</td>
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
            {negativeValue && <mi>-</mi>}

            <mn>{value}</mn>
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
