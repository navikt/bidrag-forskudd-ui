import React, { createContext, PropsWithChildren, useContext } from "react";

import { RolleDto, Rolletype, TypeBehandling } from "../../../api/BidragBehandlingApiV1";
import { InntektTableType } from "../../helpers/inntektFormHelpers";
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
    viewOnly: boolean;
}

export const InntektTableContext = createContext<IInntektTableContext | null>(null);

export type InntektTableProviderProps = {
    rolle: RolleDto;
    type: TypeBehandling;
};

function InntektTableProvider({ children, ...props }: PropsWithChildren<InntektTableProviderProps>) {
    function determineViewOnly() {
        switch (props.type) {
            case TypeBehandling.FORSKUDD: {
                return props.rolle.rolletype === Rolletype.BA;
            }
            default: {
                return false;
            }
        }
    }
    return (
        <InntektTableContext.Provider value={{ ...props, ident: props.rolle.ident, viewOnly: determineViewOnly() }}>
            {children}
        </InntektTableContext.Provider>
    );
}
function useInntektTableProvider() {
    const context = useContext(InntektTableContext);
    if (!context) {
        throw new Error("useInntektTableProvider must be used within a InntektTableProvider");
    }
    return context;
}

export { InntektTableProvider, useInntektTableProvider };
