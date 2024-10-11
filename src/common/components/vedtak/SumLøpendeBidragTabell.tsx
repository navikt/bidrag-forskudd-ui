import { Heading } from "@navikt/ds-react";

import { formatterBeløpForBeregning } from "../../../utils/number-utils";
import { useGetBeregningSærbidrag } from "../../hooks/useApiData";

export const SumLøpendeBidragTabell = () => {
    const { data: beregnetSærbidrag } = useGetBeregningSærbidrag();

    const delberegning = beregnetSærbidrag.resultat.delberegningSumLøpendeBidrag;
    const colPaddingClassname = "px-1";
    return (
        <div>
            <Heading size="xsmall">{"BPs løpende bidrag"}</Heading>
            <table className="table-auto pb-[5px] border-collapse text-left border-spacing-2 w-full">
                <thead>
                    <tr>
                        <th className="pr-1">{"Barn"}</th>
                        <th className={`${colPaddingClassname}`}>{"Saksnummer"}</th>
                        <th className={`${colPaddingClassname} text-right`}>{"Løpende bidrag"}</th>
                        <th className={`${colPaddingClassname} text-right`}>{"Samværsfradrag"}</th>
                        <th className={`${colPaddingClassname} text-right`}>{"Beregnet bidrag"}</th>
                        <th className={`${colPaddingClassname} text-right`}>{"Faktisk bidrag"}</th>
                        <th className={`${colPaddingClassname} text-right`}>{"Resultat"}</th>
                    </tr>
                </thead>
                <tbody>
                    {delberegning.beregningPerBarn.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td className="pr-4">{row.personidentBarn}</td>
                            <td className={`${colPaddingClassname}`}>{row.saksnummer}</td>
                            <td className={`${colPaddingClassname} text-right`}>
                                {formatterBeløpForBeregning(row.løpendeBeløp, true)}
                            </td>
                            <td className={`${colPaddingClassname} text-right`}>
                                {formatterBeløpForBeregning(row.samværsfradrag, true)}
                            </td>
                            <td className={`${colPaddingClassname} text-right`}>
                                {formatterBeløpForBeregning(row.beregnetBeløp, true)}
                            </td>
                            <td className={`${colPaddingClassname} text-right`}>
                                {formatterBeløpForBeregning(row.faktiskBeløp, true)}
                            </td>

                            <td className={`${colPaddingClassname} text-right`}>
                                {formatterBeløpForBeregning(row.resultat, true)}
                            </td>
                        </tr>
                    ))}
                    <tr className="border-t border-solid border-black border-b-2 border-l-0 border-r-0">
                        {/* <td colSpan={5} className="text-right"></td> */}
                        <td colSpan={6} className="text-right ">
                            {"Sum løpende bidrag:"}
                        </td>
                        <td colSpan={1} className={`${colPaddingClassname} text-right`}>
                            {formatterBeløpForBeregning(delberegning.sumLøpendeBidrag, true)}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};
