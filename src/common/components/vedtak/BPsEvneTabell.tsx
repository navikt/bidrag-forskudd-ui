import { formatterBeløpForBeregning } from "../../../utils/number-utils";
import { useGetBeregningSærbidrag } from "../../hooks/useApiData";
import { CalculationTabell, MathDivision, MathMultiplication, MathValue } from "./CalculationTable";

export const BPsEvne = () => {
    const { data: beregnetSærbidrag } = useGetBeregningSærbidrag();

    const delberegningBidragsevne = beregnetSærbidrag.resultat.delberegningBidragsevne;
    const inntekter = beregnetSærbidrag.resultat.inntekter;
    return (
        <CalculationTabell
            title="BPs evne"
            data={[
                {
                    label: "Inntekt",
                    value: (
                        <MathDivision top={`${formatterBeløpForBeregning(inntekter.inntektBP, true)}/år`} bottom={12} />
                    ),
                    result: <MathValue value={formatterBeløpForBeregning(inntekter.inntektBPMånedlig, true)} />,
                },
                {
                    label: "Skatt",
                    value: (
                        <MathDivision
                            negativeValue
                            top={`${formatterBeløpForBeregning(delberegningBidragsevne.skatt.skattAlminneligInntekt, true)}/år`}
                            bottom={12}
                        />
                    ),
                    result: (
                        <MathValue
                            negativeValue
                            value={formatterBeløpForBeregning(
                                delberegningBidragsevne.skatt.skattAlminneligInntektMånedsbeløp,
                                true
                            )}
                        />
                    ),
                },
                {
                    label: "Trygdeavgift",
                    value: (
                        <MathDivision
                            negativeValue
                            top={`${formatterBeløpForBeregning(delberegningBidragsevne.skatt.trygdeavgift, true)}/år`}
                            bottom={12}
                        />
                    ),
                    result: (
                        <MathValue
                            negativeValue
                            value={formatterBeløpForBeregning(
                                delberegningBidragsevne.skatt.trygdeavgiftMånedsbeløp,
                                true
                            )}
                        />
                    ),
                },
                {
                    label: "Trinnskatt",
                    value: (
                        <MathDivision
                            negativeValue
                            top={`${formatterBeløpForBeregning(delberegningBidragsevne.skatt.trinnskatt, true)}/år`}
                            bottom={12}
                        />
                    ),
                    result: (
                        <MathValue
                            negativeValue
                            value={formatterBeløpForBeregning(
                                delberegningBidragsevne.skatt.trinnskattMånedsbeløp,
                                true
                            )}
                        />
                    ),
                },
                {
                    label: "Underhold egne barn i husstand",
                    value: (
                        <MathMultiplication
                            negativeValue
                            left={`${formatterBeløpForBeregning(delberegningBidragsevne.underholdEgneBarnIHusstand.sjablon, true)}`}
                            right={delberegningBidragsevne.underholdEgneBarnIHusstand.antallBarnIHusstanden}
                        />
                    ),
                    result: (
                        <MathValue
                            negativeValue
                            value={formatterBeløpForBeregning(
                                delberegningBidragsevne.underholdEgneBarnIHusstand.måndesbeløp,
                                true
                            )}
                        />
                    ),
                },
                {
                    label: "Boutgift",
                    value: delberegningBidragsevne.utgifter.borMedAndreVoksne
                        ? "Bor med andre voksne"
                        : "Bor ikke med andre voksne",
                    result: (
                        <MathValue
                            negativeValue
                            value={formatterBeløpForBeregning(delberegningBidragsevne.utgifter.boutgiftBeløp, true)}
                        />
                    ),
                },
                {
                    label: "Eget underhold",
                    value: delberegningBidragsevne.utgifter.borMedAndreVoksne
                        ? "Bor med andre voksne"
                        : "Bor ikke med andre voksne",
                    result: (
                        <MathValue
                            negativeValue
                            value={formatterBeløpForBeregning(delberegningBidragsevne.utgifter.underholdBeløp, true)}
                        />
                    ),
                },
            ]}
            result={{
                label: "Bidragsevne",
                value: formatterBeløpForBeregning(delberegningBidragsevne.bidragsevne, true),
            }}
        />
    );
};
