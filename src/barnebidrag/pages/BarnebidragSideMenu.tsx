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
import { BarnebidragStepper } from "../enum/BarnebidragStepper";

export const BarnebidragSideMenu = () => {
    const { onStepChange } = useBehandlingProvider();
    const {
        vedtakstype,
        virkningstidspunkt,
        boforhold: { valideringsfeil: boforholdValideringsfeil },
        inntekter: { valideringsfeil: inntektValideringsfeil },
        ikkeAktiverteEndringerIGrunnlagsdata,
        roller,
    } = useGetBehandlingV2();
    const [searchParams] = useSearchParams();
    const getActiveButtonFromParams = () => {
        const step = searchParams.get(behandlingQueryKeys.steg);
        if (!step) return BarnebidragStepper.VIRKNINGSTIDSPUNKT;
        const inntektTab = searchParams.get(behandlingQueryKeys.inntektTab);
        return `${step}${inntektTab ? `.${inntektTab}` : ""}`;
    };
    const [activeButton, setActiveButton] = useState<string>(getActiveButtonFromParams());
    const interactive = !virkningstidspunkt.avslag && vedtakstype !== Vedtakstype.OPPHOR;
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
    const boforholdValideringsFeil = husstandsmedlemValideringsFeil;
    const husstandsmedlemIkkeAktiverteEndringer = !!ikkeAktiverteEndringerIGrunnlagsdata?.husstandsmedlem?.length;
    const andreVoksneIHusstandenIkkeAktiverteEndringer = !!ikkeAktiverteEndringerIGrunnlagsdata?.andreVoksneIHusstanden;
    const boforholdIkkeAktiverteEndringer =
        husstandsmedlemIkkeAktiverteEndringer || andreVoksneIHusstandenIkkeAktiverteEndringer;
    const inntektHasValideringsFeil = inntektValideringsfeil && !!Object.keys(inntektValideringsfeil).length;
    const inntekterIkkeAktiverteEndringer =
        !!ikkeAktiverteEndringerIGrunnlagsdata?.inntekter &&
        Object.values(ikkeAktiverteEndringerIGrunnlagsdata.inntekter).some((inntekt) => !!inntekt.length);

    return (
        <SideMenu>
            <MenuButton
                step={"1."}
                title={text.title.virkningstidspunkt}
                onStepChange={() => onStepChange(STEPS[BarnebidragStepper.VIRKNINGSTIDSPUNKT])}
                active={activeButton === BarnebidragStepper.VIRKNINGSTIDSPUNKT}
            />
            <MenuButton
                step={"2."}
                title={text.title.underholdskostnad}
                interactive={interactive}
                onStepChange={() => onStepChange(STEPS[BarnebidragStepper.UNDERHOLDSKOSTNAD])}
                active={activeButton === BarnebidragStepper.UNDERHOLDSKOSTNAD}
            />

            <MenuButton
                step={"3."}
                title={text.title.inntekt}
                onStepChange={() => onStepChange(STEPS[BarnebidragStepper.INNTEKT])}
                interactive={interactive}
                active={activeButton?.includes(BarnebidragStepper.INNTEKT)}
                valideringsfeil={inntektHasValideringsFeil}
                unconfirmedUpdates={inntekterIkkeAktiverteEndringer}
                subMenu={inntektRoller.map((rolle) => (
                    <>
                        <MenuButton
                            title={`${rolle.rolletype} ${rolle.ident}`}
                            onStepChange={() =>
                                onStepChange(STEPS[BarnebidragStepper.INNTEKT], {
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
                            active={activeButton === `${BarnebidragStepper.INNTEKT}.${rolle.id.toString()}`}
                            subMenu={
                                rolle.rolletype === Rolletype.BM ? (
                                    <>
                                        <MenuButton
                                            title={text.title.skattepliktigeogPensjonsgivendeInntekt}
                                            onStepChange={() =>
                                                onStepChange(
                                                    STEPS[BarnebidragStepper.INNTEKT],
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
                                                activeButton === `${BarnebidragStepper.INNTEKT}.${rolle.id.toString()}`
                                            }
                                        />
                                        <MenuButton
                                            title={text.title.barnetillegg}
                                            onStepChange={() =>
                                                onStepChange(
                                                    STEPS[BarnebidragStepper.INNTEKT],
                                                    {
                                                        [behandlingQueryKeys.inntektTab]: rolle.id.toString(),
                                                    },
                                                    elementIds.seksjon_inntekt_barnetillegg
                                                )
                                            }
                                            interactive={interactive}
                                            size="small"
                                            active={
                                                activeButton === `${BarnebidragStepper.INNTEKT}.${rolle.id.toString()}`
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
                                                    STEPS[BarnebidragStepper.INNTEKT],
                                                    {
                                                        [behandlingQueryKeys.inntektTab]: rolle.id.toString(),
                                                    },
                                                    elementIds.seksjon_inntekt_utvidetbarnetrygd
                                                )
                                            }
                                            interactive={interactive}
                                            size="small"
                                            active={
                                                activeButton === `${BarnebidragStepper.INNTEKT}.${rolle.id.toString()}`
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
                                                    STEPS[BarnebidragStepper.INNTEKT],
                                                    {
                                                        [behandlingQueryKeys.inntektTab]: rolle.id.toString(),
                                                    },
                                                    elementIds.seksjon_inntekt_småbarnstillegg
                                                )
                                            }
                                            interactive={interactive}
                                            size="small"
                                            active={
                                                activeButton === `${BarnebidragStepper.INNTEKT}.${rolle.id.toString()}`
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
                                                    STEPS[BarnebidragStepper.INNTEKT],
                                                    {
                                                        [behandlingQueryKeys.inntektTab]: rolle.id.toString(),
                                                    },
                                                    elementIds.seksjon_inntekt_kontantstøtte
                                                )
                                            }
                                            interactive={interactive}
                                            size="small"
                                            active={
                                                activeButton === `${BarnebidragStepper.INNTEKT}.${rolle.id.toString()}`
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
                                                    STEPS[BarnebidragStepper.INNTEKT],
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
                                                activeButton === `${BarnebidragStepper.INNTEKT}.${rolle.id.toString()}`
                                            }
                                        />
                                        <MenuButton
                                            title={text.title.barnetillegg}
                                            onStepChange={() =>
                                                onStepChange(
                                                    STEPS[BarnebidragStepper.INNTEKT],
                                                    {
                                                        [behandlingQueryKeys.inntektTab]: rolle.id.toString(),
                                                    },
                                                    elementIds.seksjon_inntekt_barnetillegg
                                                )
                                            }
                                            interactive={interactive}
                                            size="small"
                                            active={
                                                activeButton === `${BarnebidragStepper.INNTEKT}.${rolle.id.toString()}`
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
                                                    STEPS[BarnebidragStepper.INNTEKT],
                                                    {
                                                        [behandlingQueryKeys.inntektTab]: rolle.id.toString(),
                                                    },
                                                    elementIds.seksjon_inntekt_skattepliktig
                                                )
                                            }
                                            interactive={interactive}
                                            size="small"
                                            active={
                                                activeButton === `${BarnebidragStepper.INNTEKT}.${rolle.id.toString()}`
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
                step={"4."}
                title={text.title.boforhold}
                onStepChange={() => onStepChange(STEPS[BarnebidragStepper.BOFORHOLD])}
                interactive={interactive}
                active={activeButton === BarnebidragStepper.BOFORHOLD}
                valideringsfeil={boforholdValideringsFeil}
                unconfirmedUpdates={boforholdIkkeAktiverteEndringer}
            />
            <MenuButton
                step={"5."}
                title={text.title.samvær}
                interactive={interactive}
                onStepChange={() => onStepChange(STEPS[BarnebidragStepper.SAMVÆR])}
                active={activeButton === BarnebidragStepper.SAMVÆR}
            />
            <MenuButton
                step={"6."}
                title={text.title.vedtak}
                onStepChange={() => onStepChange(STEPS[BarnebidragStepper.VEDTAK])}
                active={activeButton === BarnebidragStepper.VEDTAK}
            />
        </SideMenu>
    );
};
