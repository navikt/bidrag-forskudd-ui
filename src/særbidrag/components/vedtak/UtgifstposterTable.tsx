import { dateToDDMMYYYYString } from "@navikt/bidrag-ui-common";
import { Heading } from "@navikt/ds-react";

import tekster from "../../../common/constants/texts";
import { useGetBeregningSærbidrag } from "../../../common/hooks/useApiData";
import { dateOrNull } from "../../../utils/date-utils";
import { formatterBeløpForBeregning } from "../../../utils/number-utils";

export const UtgifsposterTable: React.FC = () => {
    const { data: beregnetSærbidrag } = useGetBeregningSærbidrag();

    const utgifstposter = beregnetSærbidrag.resultat.utgiftsposter;
    return (
        <div>
            <Heading size="xsmall">{"Utgiftene lagt til grunn"}</Heading>
            <table className="table-auto text-left border-collapse">
                <thead>
                    <tr>
                        <th className="pr-[16px]">{tekster.label.forfallsdato}</th>
                        <th className="px-[16px]">{tekster.label.utgift}</th>
                        <th className="px-[16px]">{tekster.label.kravbeløp}</th>
                        <th className="px-[16px]">{tekster.label.godkjentBeløp}</th>
                    </tr>
                </thead>
                <tbody>
                    {utgifstposter.map((utgifspost, rowIndex) => (
                        <tr key={rowIndex} className="pr-[16px]">
                            <td style={{ padding: "0 16px 0 0" }}>
                                {dateToDDMMYYYYString(dateOrNull(utgifspost.dato))}
                            </td>
                            <td className="px-[16px]">{utgifspost.utgiftstypeVisningsnavn}</td>
                            <td className="px-[16px] text-right">
                                {formatterBeløpForBeregning(utgifspost.kravbeløp, true)}
                            </td>
                            <td className="px-[16px] text-right">
                                {formatterBeløpForBeregning(utgifspost.godkjentBeløp, true)}
                            </td>
                        </tr>
                    ))}
                    <tr className="border-t border-solid border-black border-b-2 border-l-0 border-r-0">
                        <td>Sum</td>
                        <td colSpan={1} />
                        <td className={"text-right px-[16px] "}>
                            {formatterBeløpForBeregning(beregnetSærbidrag.resultat.beregning.totalKravbeløp, true)}
                        </td>
                        <td className={"text-right px-[16px] "}>
                            {formatterBeløpForBeregning(beregnetSærbidrag.resultat.beregning.totalGodkjentBeløp, true)}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};
