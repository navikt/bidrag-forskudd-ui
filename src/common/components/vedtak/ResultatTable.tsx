import { Heading } from "@navikt/ds-react";
import { ReactElement } from "react";

interface TableData {
    label: string;
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
        <div className={className}>
            {title && <Heading size="xsmall">{title}</Heading>}
            <table>
                <thead>
                    <tr>
                        <tr>
                            <th></th>
                            <th></th>
                        </tr>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td style={{ paddingRight: "8px" }}>{row.label}: </td>
                            <td className={row.textRight === false ? "text-left" : "text-right"}>{row.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
