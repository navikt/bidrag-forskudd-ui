import { BodyShort, Heading } from "@navikt/ds-react";
import { ReactElement } from "react";

interface TableData {
    label: string;
    labelBold?: boolean;
    value: string | number | ReactElement;
    textRight?: boolean;
}
interface GenericTableProps {
    data: TableData[]; // Array of data objects
    title?: string;
    className?: string;
}

export const ResultatTable: React.FC<GenericTableProps> = ({ data, title, className }) => {
    return (
        <BodyShort size="small" className={className}>
            {title && <Heading size="xsmall">{title}</Heading>}
            <table>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td style={{ paddingRight: "8px" }}>
                                <BodyShort size="small" weight={row.labelBold ? "semibold" : "regular"}>
                                    {row.label}:{" "}
                                </BodyShort>
                            </td>
                            <td className={row.textRight === false ? "text-left" : "text-right"}>{row.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </BodyShort>
    );
};
