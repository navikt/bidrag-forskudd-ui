import React, { createContext, PropsWithChildren, useContext } from "react";

import { RolleDto, TypeBehandling } from "../../../api/BidragBehandlingApiV1";
import { InntektTableType } from "../../constants/behandlingViewRules";
import { Barnetillegg } from "./Barnetillegg";
import { BeregnetInntekter } from "./BeregnetInntekter";
import { Kontantstøtte } from "./Kontantstoette";
import { SkattepliktigeOgPensjonsgivende } from "./SkattepliktigeOgPensjonsgivende";
import { Småbarnstillegg } from "./Smaabarnstilleg";
import { UtvidetBarnetrygd } from "./UtvidetBarnetrygd";

export const InntektTableComponent = {
    [InntektTableType.SKATTEPLIKTIG]: () => <SkattepliktigeOgPensjonsgivende />,
    [InntektTableType.UTVIDET_BARNETRYGD]: () => <UtvidetBarnetrygd />,
    [InntektTableType.SMÅBARNSTILLEGG]: () => <Småbarnstillegg />,
    [InntektTableType.KONTANTSTØTTE]: () => <Kontantstøtte />,
    [InntektTableType.BARNETILLEGG]: () => <Barnetillegg />,
    [InntektTableType.BEREGNET_INNTEKTER]: () => <BeregnetInntekter />,
};

interface IInntektTableContext {
    rolle: RolleDto;
    ident: string;
    type: TypeBehandling;
}

export const InntektTableContext = createContext<IInntektTableContext | null>(null);

export type InntektTableProviderProps = {
    rolle: RolleDto;
    type: TypeBehandling;
};

function InntektTableProvider({ children, ...props }: PropsWithChildren<InntektTableProviderProps>) {
    return (
        <InntektTableContext.Provider value={{ ...props, ident: props.rolle.ident }}>
            {children}
        </InntektTableContext.Provider>
    );
}
function useInntektTableProvider() {
    const context = useContext(InntektTableContext);
    if (!context) {
        throw new Error("useBehandlingProvider must be used within a BehandlingProvider");
    }
    return context;
}

export { InntektTableProvider, useInntektTableProvider };
