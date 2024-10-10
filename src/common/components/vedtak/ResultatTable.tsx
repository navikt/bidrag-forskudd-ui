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
}

export const ResultatTable: React.FC<GenericTableProps> = ({ data, title }) => {
    return (
        <div>
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
                            <td style={{ paddingRight: "10px" }}>{row.label}: </td>
                            <td className={row.textRight === false ? "text-left" : "text-right"}>{row.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
