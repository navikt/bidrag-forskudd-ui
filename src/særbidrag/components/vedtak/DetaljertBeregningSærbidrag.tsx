import { Resultatkode } from "../../../api/BidragBehandlingApiV1";
import { BPsAndel } from "../../../common/components/vedtak/BPAndelTable";
import { BpsBeregnedeTotalbidragTabellV2 } from "../../../common/components/vedtak/BpsBeregnedeTotalbidragTabell";
import { BPsEvne } from "../../../common/components/vedtak/BPsEvneTabell";
import { ResultatTable } from "../../../common/components/vedtak/ResultatTable";
import { useGetBeregningSærbidrag } from "../../../common/hooks/useApiData";
import { formatterBeløp } from "../../../utils/number-utils";

export const DetaljertBeregningSærbidrag: React.FC = () => {
    const { data: beregnetSærbidrag } = useGetBeregningSærbidrag();

    const resultat = beregnetSærbidrag.resultat;
    const erBeregningeAvslag = beregnetSærbidrag.resultat?.resultatKode !== Resultatkode.SAeRBIDRAGINNVILGET;

    return (
        <>
            <BPsAndel />
            <BPsEvne />
            <BpsBeregnedeTotalbidragTabellV2 />
            <ResultatTable
                title="Beregning"
                data={[
                    {
                        label: "BP har evne",
                        textRight: false,
                        value:
                            resultat.bpHarEvne === false
                                ? "Nei, bidragsevnen er lavere enn beregnet totalbidrag"
                                : "Ja, bidragsevnen er høyere enn beregnet totalbidrag",
                    },
                    {
                        label: "Resultat",
                        value: erBeregningeAvslag ? "Avslag" : formatterBeløp(resultat.resultat, true),
                    },
                    {
                        label: "Betalt av BP",
                        value: formatterBeløp(resultat.beregning?.totalBeløpBetaltAvBp, true),
                    },
                    {
                        label: "Beløp som innkreves",
                        value: erBeregningeAvslag ? "Avslag" : formatterBeløp(resultat.beløpSomInnkreves, true),
                    },
                ].filter((d) => d)}
            />
        </>
    );
};
