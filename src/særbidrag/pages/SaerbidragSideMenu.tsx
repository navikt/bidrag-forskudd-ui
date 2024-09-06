import { Rolletype, Vedtakstype } from "@api/BidragBehandlingApiV1";
import { MenuButton, SideMenu } from "@common/components/SideMenu/SideMenu";
import behandlingQueryKeys from "@common/constants/behandlingQueryKeys";
import elementIds from "@common/constants/elementIds";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { STEPS } from "../constants/steps";
import { SærligeutgifterStepper } from "../enum/SærligeutgifterStepper";

export const SaerbidragSideMenu = () => {
    const { onStepChange, activeStep } = useBehandlingProvider();
    const {
        erVedtakFattet,
        vedtakstype,
        utgift: { avslag, valideringsfeil: utgiftValideringsfeil },
        boforhold: { valideringsfeil: boforholdValideringsfeil },
        inntekter: { valideringsfeil: inntektValideringsfeil },
        ikkeAktiverteEndringerIGrunnlagsdata,
        roller,
    } = useGetBehandlingV2();
    const [searchParams] = useSearchParams();
    const getActiveButtonFromParams = () => {
        const step = searchParams.get(behandlingQueryKeys.steg);
        if (!step) return SærligeutgifterStepper.UTGIFT;
        const inntektTab = searchParams.get(behandlingQueryKeys.inntektTab);
        return `${step}${inntektTab ? `.${inntektTab}` : ""}`;
    };
    const [activeButton, setActiveButton] = useState<string>(getActiveButtonFromParams());
    const activeStepIndex = STEPS[activeStep];
    const interactive = vedtakstype !== Vedtakstype.OPPHOR && avslag === undefined;
    const inntektRoller = roller.sort((a, b) => {
        if (a.rolletype === Rolletype.BM) return -1;
        if (b.rolletype === Rolletype.BM) return 1;
        if (a.rolletype === Rolletype.BP) return -1;
        if (b.rolletype === Rolletype.BP) return 1;
        if (a.rolletype === Rolletype.BA || b.rolletype === Rolletype.BA) {
            return a.ident.localeCompare(b.ident);
        }
        return 0;
    });

    useEffect(() => {
        const activeButton = getActiveButtonFromParams();
        setActiveButton(activeButton);
    }, [searchParams, location]);

    const husstandsmedlemValideringsFeil = !!boforholdValideringsfeil?.husstandsmedlem?.length;
    const andreVoksneIHusstandenValideringsFeil = !!boforholdValideringsfeil?.andreVoksneIHusstanden;
    const boforholdValideringsFeil = husstandsmedlemValideringsFeil || andreVoksneIHusstandenValideringsFeil;
    const husstandsmedlemIkkeAktiverteEndringer = !!ikkeAktiverteEndringerIGrunnlagsdata?.husstandsmedlem?.length;
    const andreVoksneIHusstandenIkkeAktiverteEndringer = !!ikkeAktiverteEndringerIGrunnlagsdata?.andreVoksneIHusstanden;
    const boforholdIkkeAktiverteEndringer =
        husstandsmedlemIkkeAktiverteEndringer || andreVoksneIHusstandenIkkeAktiverteEndringer;
    const inntektValideringsFeil = inntektValideringsfeil && !!Object.keys(inntektValideringsfeil).length;
    const inntekterIkkeAktiverteEndringer =
        !!ikkeAktiverteEndringerIGrunnlagsdata?.inntekter &&
        Object.values(ikkeAktiverteEndringerIGrunnlagsdata.inntekter).some((inntekt) => !!inntekt.length);

    return (
        <SideMenu>
            <MenuButton
                completed={activeStepIndex > 1 && !!utgiftValideringsfeil}
                step={"1."}
                title={SærligeutgifterStepper.UTGIFT}
                onStepChange={() => onStepChange(STEPS[SærligeutgifterStepper.UTGIFT])}
                interactive={interactive}
                active={activeButton === SærligeutgifterStepper.UTGIFT}
                valideringsfeil={!!utgiftValideringsfeil}
            />
            <MenuButton
                completed={activeStepIndex > 2 && !boforholdValideringsFeil && !boforholdIkkeAktiverteEndringer}
                step={"2."}
                title={SærligeutgifterStepper.BOFORHOLD}
                onStepChange={() => onStepChange(STEPS[SærligeutgifterStepper.BOFORHOLD])}
                interactive={interactive}
                active={activeButton === SærligeutgifterStepper.BOFORHOLD}
                subMenu={
                    <>
                        <MenuButton
                            title={text.title.barn}
                            onStepChange={() =>
                                onStepChange(
                                    STEPS[SærligeutgifterStepper.BOFORHOLD],
                                    undefined,
                                    elementIds.seksjon_boforhold
                                )
                            }
                            interactive={interactive}
                            size="small"
                            active={activeButton === SærligeutgifterStepper.BOFORHOLD}
                            valideringsfeil={husstandsmedlemValideringsFeil}
                            unconfirmedUpdates={husstandsmedlemIkkeAktiverteEndringer}
                        />
                        <MenuButton
                            title={text.title.andreVoksneIHusstanden}
                            onStepChange={() =>
                                onStepChange(
                                    STEPS[SærligeutgifterStepper.BOFORHOLD],
                                    undefined,
                                    elementIds.seksjon_andreVoksneIHusstand
                                )
                            }
                            interactive={interactive}
                            size="small"
                            active={activeButton === SærligeutgifterStepper.BOFORHOLD}
                            valideringsfeil={andreVoksneIHusstandenValideringsFeil}
                            unconfirmedUpdates={andreVoksneIHusstandenIkkeAktiverteEndringer}
                        />
                    </>
                }
            />
            <MenuButton
                completed={activeStepIndex > 3 && !inntektValideringsFeil && !inntekterIkkeAktiverteEndringer}
                step={"3."}
                title={"Inntekt"}
                onStepChange={() => onStepChange(STEPS[SærligeutgifterStepper.INNTEKT])}
                interactive={interactive}
                active={activeButton?.includes(SærligeutgifterStepper.INNTEKT)}
                subMenu={inntektRoller.map((rolle) => (
                    <>
                        <MenuButton
                            title={`${rolle.rolletype} ${rolle.ident}`}
                            onStepChange={() =>
                                onStepChange(STEPS[SærligeutgifterStepper.INNTEKT], {
                                    [behandlingQueryKeys.inntektTab]: rolle.id.toString(),
                                })
                            }
                            interactive={interactive}
                            size="small"
                            valideringsfeil={
                                inntektValideringsfeil &&
                                Object.values(inntektValideringsfeil).some((valideringsfeil) => {
                                    if (Array.isArray(valideringsfeil)) {
                                        return valideringsfeil?.some((feil) => feil?.rolle?.id === rolle.id);
                                    }
                                    return valideringsfeil?.rolle?.id === rolle.id;
                                })
                            }
                            unconfirmedUpdates={
                                inntekterIkkeAktiverteEndringer &&
                                Object.values(ikkeAktiverteEndringerIGrunnlagsdata.inntekter).some((inntekter) =>
                                    inntekter.some((inntekt) => inntekt.ident === rolle.ident)
                                )
                            }
                            active={activeButton === `${SærligeutgifterStepper.INNTEKT}.${rolle.id.toString()}`}
                            subMenu={
                                rolle.rolletype === Rolletype.BM ? (
                                    <>
                                        <MenuButton
                                            title={text.title.skattepliktigeogPensjonsgivendeInntekt}
                                            onStepChange={() =>
                                                onStepChange(
                                                    STEPS[SærligeutgifterStepper.INNTEKT],
                                                    {
                                                        [behandlingQueryKeys.inntektTab]: rolle.id.toString(),
                                                    },
                                                    elementIds.seksjon_inntekt_skattepliktig
                                                )
                                            }
                                            interactive={interactive}
                                            valideringsfeil={inntektValideringsfeil?.årsinntekter?.some(
                                                (feil) => feil?.rolle?.id === rolle.id
                                            )}
                                            unconfirmedUpdates={ikkeAktiverteEndringerIGrunnlagsdata?.inntekter?.årsinntekter.some(
                                                (inntekt) => inntekt.ident === rolle.ident
                                            )}
                                            size="small"
                                            active={
                                                activeButton ===
                                                `${SærligeutgifterStepper.INNTEKT}.${rolle.id.toString()}`
                                            }
                                        />
                                        <MenuButton
                                            title={text.title.barnetillegg}
                                            onStepChange={() =>
                                                onStepChange(
                                                    STEPS[SærligeutgifterStepper.INNTEKT],
                                                    {
                                                        [behandlingQueryKeys.inntektTab]: rolle.id.toString(),
                                                    },
                                                    elementIds.seksjon_inntekt_barnetillegg
                                                )
                                            }
                                            interactive={interactive}
                                            size="small"
                                            active={
                                                activeButton ===
                                                `${SærligeutgifterStepper.INNTEKT}.${rolle.id.toString()}`
                                            }
                                            valideringsfeil={
                                                !!inntektValideringsfeil?.barnetillegg?.some(
                                                    (feil) => feil?.rolle?.ident === rolle.ident
                                                )
                                            }
                                            unconfirmedUpdates={
                                                !!ikkeAktiverteEndringerIGrunnlagsdata?.inntekter?.barnetillegg?.some(
                                                    (inntekt) => inntekt.ident === rolle.ident
                                                )
                                            }
                                        />
                                        <MenuButton
                                            title={text.title.utvidetBarnetrygd}
                                            onStepChange={() =>
                                                onStepChange(
                                                    STEPS[SærligeutgifterStepper.INNTEKT],
                                                    {
                                                        [behandlingQueryKeys.inntektTab]: rolle.id.toString(),
                                                    },
                                                    elementIds.seksjon_inntekt_utvidetbarnetrygd
                                                )
                                            }
                                            interactive={interactive}
                                            size="small"
                                            active={
                                                activeButton ===
                                                `${SærligeutgifterStepper.INNTEKT}.${rolle.id.toString()}`
                                            }
                                            valideringsfeil={!!inntektValideringsfeil?.utvidetBarnetrygd}
                                            unconfirmedUpdates={
                                                !!ikkeAktiverteEndringerIGrunnlagsdata?.inntekter?.utvidetBarnetrygd
                                                    ?.length
                                            }
                                        />
                                        <MenuButton
                                            title={text.title.småbarnstillegg}
                                            onStepChange={() =>
                                                onStepChange(
                                                    STEPS[SærligeutgifterStepper.INNTEKT],
                                                    {
                                                        [behandlingQueryKeys.inntektTab]: rolle.id.toString(),
                                                    },
                                                    elementIds.seksjon_inntekt_småbarnstillegg
                                                )
                                            }
                                            interactive={interactive}
                                            size="small"
                                            active={
                                                activeButton ===
                                                `${SærligeutgifterStepper.INNTEKT}.${rolle.id.toString()}`
                                            }
                                            valideringsfeil={!!inntektValideringsfeil?.småbarnstillegg}
                                            unconfirmedUpdates={
                                                !!ikkeAktiverteEndringerIGrunnlagsdata?.inntekter?.småbarnstillegg
                                                    ?.length
                                            }
                                        />
                                        <MenuButton
                                            title={text.title.kontantstøtte}
                                            onStepChange={() =>
                                                onStepChange(
                                                    STEPS[SærligeutgifterStepper.INNTEKT],
                                                    {
                                                        [behandlingQueryKeys.inntektTab]: rolle.id.toString(),
                                                    },
                                                    elementIds.seksjon_inntekt_kontantstøtte
                                                )
                                            }
                                            interactive={interactive}
                                            size="small"
                                            active={
                                                activeButton ===
                                                `${SærligeutgifterStepper.INNTEKT}.${rolle.id.toString()}`
                                            }
                                            valideringsfeil={!!inntektValideringsfeil?.kontantstøtte?.length}
                                            unconfirmedUpdates={
                                                !!ikkeAktiverteEndringerIGrunnlagsdata?.inntekter?.kontantstøtte?.length
                                            }
                                        />
                                    </>
                                ) : rolle.rolletype === Rolletype.BP ? (
                                    <>
                                        <MenuButton
                                            title={text.title.skattepliktigeogPensjonsgivendeInntekt}
                                            onStepChange={() =>
                                                onStepChange(
                                                    STEPS[SærligeutgifterStepper.INNTEKT],
                                                    {
                                                        [behandlingQueryKeys.inntektTab]: rolle.id.toString(),
                                                    },
                                                    elementIds.seksjon_inntekt_skattepliktig
                                                )
                                            }
                                            interactive={interactive}
                                            valideringsfeil={inntektValideringsfeil?.årsinntekter?.some(
                                                (feil) => feil?.rolle?.id === rolle.id
                                            )}
                                            unconfirmedUpdates={ikkeAktiverteEndringerIGrunnlagsdata?.inntekter?.årsinntekter.some(
                                                (inntekt) => inntekt.ident === rolle.ident
                                            )}
                                            size="small"
                                            active={
                                                activeButton ===
                                                `${SærligeutgifterStepper.INNTEKT}.${rolle.id.toString()}`
                                            }
                                        />
                                        <MenuButton
                                            title={text.title.barnetillegg}
                                            onStepChange={() =>
                                                onStepChange(
                                                    STEPS[SærligeutgifterStepper.INNTEKT],
                                                    {
                                                        [behandlingQueryKeys.inntektTab]: rolle.id.toString(),
                                                    },
                                                    elementIds.seksjon_inntekt_barnetillegg
                                                )
                                            }
                                            interactive={interactive}
                                            size="small"
                                            active={
                                                activeButton ===
                                                `${SærligeutgifterStepper.INNTEKT}.${rolle.id.toString()}`
                                            }
                                            valideringsfeil={
                                                !!inntektValideringsfeil?.barnetillegg?.some(
                                                    (feil) => feil?.rolle?.ident === rolle.ident
                                                )
                                            }
                                            unconfirmedUpdates={
                                                !!ikkeAktiverteEndringerIGrunnlagsdata?.inntekter?.barnetillegg?.some(
                                                    (inntekt) => inntekt.ident === rolle.ident
                                                )
                                            }
                                        />
                                    </>
                                ) : (
                                    <>
                                        <MenuButton
                                            title={text.title.skattepliktigeogPensjonsgivendeInntekt}
                                            onStepChange={() =>
                                                onStepChange(
                                                    STEPS[SærligeutgifterStepper.INNTEKT],
                                                    {
                                                        [behandlingQueryKeys.inntektTab]: rolle.id.toString(),
                                                    },
                                                    elementIds.seksjon_inntekt_skattepliktig
                                                )
                                            }
                                            interactive={interactive}
                                            size="small"
                                            active={
                                                activeButton ===
                                                `${SærligeutgifterStepper.INNTEKT}.${rolle.id.toString()}`
                                            }
                                            valideringsfeil={inntektValideringsfeil?.årsinntekter?.some(
                                                (feil) => feil?.rolle?.id === rolle.id
                                            )}
                                            unconfirmedUpdates={ikkeAktiverteEndringerIGrunnlagsdata?.inntekter?.årsinntekter.some(
                                                (inntekt) => inntekt.ident === rolle.ident
                                            )}
                                        />
                                    </>
                                )
                            }
                        />
                    </>
                ))}
            />
            <MenuButton
                completed={erVedtakFattet}
                step={"4."}
                title={SærligeutgifterStepper.VEDTAK}
                onStepChange={() => onStepChange(STEPS[SærligeutgifterStepper.VEDTAK])}
                interactive={interactive}
                active={activeButton === SærligeutgifterStepper.VEDTAK}
            />
        </SideMenu>
    );
};
