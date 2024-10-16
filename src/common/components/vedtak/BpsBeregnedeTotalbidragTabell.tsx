import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { Heading, HelpText, Link } from "@navikt/ds-react";

import { formatterBeløpForBeregning } from "../../../utils/number-utils";
import { useGetBeregningSærbidrag } from "../../hooks/useApiData";

export const BpsBeregnedeTotalbidragTabell = () => {
    const { data: beregnetSærbidrag } = useGetBeregningSærbidrag();

    const delberegning = beregnetSærbidrag.resultat.delberegningBPsBeregnedeTotalBidrag;
    const colPaddingClassname = "px-1";
    return (
        <div>
            <div>
                <Heading size="xsmall" className="inline-block align-middle">
                    {"BPs beregnede totalbidrag"}{" "}
                </Heading>
                <Link
                    className="pl-2"
                    inlineText
                    href="https://lovdata.no/nav/rundskriv/r55-02/KAPITTEL_4-2-3-2-2#KAPITTEL_4-2-3-2-2"
                >
                    {"Rundskriv"} <ExternalLinkIcon aria-hidden />
                </Link>
            </div>
            <table className="table-auto pb-[5px] border-collapse text-left border-spacing-2 w-full">
                <thead>
                    <tr>
                        <th className="pr-1">{"Barn"}</th>
                        <th className={`${colPaddingClassname}`}>{"Saksnummer"}</th>
                        <th className={`${colPaddingClassname} text-right`}>{"Løpende bidrag"}</th>
                        <th className={`${colPaddingClassname} text-right`}>
                            <div className="inline-block align-middle">Samvær</div>
                            <HelpText wrapperClassName="inline-block align-middle" className="size-4" placement="top">
                                Samværsfradraget beregnet etter dagens sats
                            </HelpText>
                        </th>
                        <th className={`${colPaddingClassname} text-right`}>
                            <div className="inline-block align-middle">Reduksjon av U</div>
                            <HelpText wrapperClassName="inline-block align-middle" className="size-4" placement="top">
                                Reduksjon av U viser hvor mye den bidragspliktiges andel av U er redusert på grunn av
                                feks bidragsevnen. Reduksjonen er beregnet som forskjellen mellom beregnet bidrag og
                                faktisk bidrag
                            </HelpText>
                        </th>
                        <th className={`${colPaddingClassname} text-right`}>Sum</th>
                    </tr>
                </thead>
                <tbody>
                    {delberegning.beregnetBidragPerBarnListe.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td className="pr-4">{row.personidentBarn}</td>
                            <td className={`${colPaddingClassname}`}>{row.saksnummer}</td>
                            <td className={`${colPaddingClassname} text-right`}>
                                {formatterBeløpForBeregning(row.løpendeBeløp, true)}
                            </td>
                            <td className={`${colPaddingClassname} text-right`}>
                                {formatterBeløpForBeregning(row.samværsfradrag, true)}
                            </td>
                            <td
                                className={`${colPaddingClassname} text-right`}
                                title={`Reduksjon av U = Beregnet bidrag - Faktisk bidrag = ${formatterBeløpForBeregning(row.beregnetBeløp, true)} - ${formatterBeløpForBeregning(row.faktiskBeløp, true)}`}
                            >
                                {formatterBeløpForBeregning(row.reduksjonUnderholdskostnad, true)}
                            </td>
                            <td className={`${colPaddingClassname} text-right`}>
                                {formatterBeløpForBeregning(row.beregnetBidrag, true)}
                            </td>
                        </tr>
                    ))}
                    <tr className="border-t border-solid border-black border-b-2 border-l-0 border-r-0">
                        <td colSpan={5} className="text-right ">
                            {"Beregnet totaltbidrag:"}
                        </td>
                        <td colSpan={1} className={`${colPaddingClassname} text-right`}>
                            {formatterBeløpForBeregning(delberegning.bbpsBeregnedeTotalbidrag, true)}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};
