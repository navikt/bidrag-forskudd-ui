import { Rolletype, Vedtakstype } from "@api/BidragBehandlingApiV1";
import { MenuButton, SideMenu } from "@common/components/SideMenu/SideMenu";
import behandlingQueryKeys from "@common/constants/behandlingQueryKeys";
import elementIds from "@common/constants/elementIds";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { STEPS } from "../../constants/steps";
import { ForskuddStepper } from "../../enum/ForskuddStepper";

export const ForskuddSideMenu = () => {
    const { onStepChange } = useBehandlingProvider();
    const {
        virkningstidspunkt,
        vedtakstype,
        boforhold: { valideringsfeil: boforholdValideringsfeil },
        inntekter: { valideringsfeil: inntektValideringsfeil },
        ikkeAktiverteEndringerIGrunnlagsdata,
        roller,
    } = useGetBehandlingV2();
    const [searchParams] = useSearchParams();
    const getActiveButtonFromParams = () => {
        const step = searchParams.get(behandlingQueryKeys.steg);
        if (!step) return ForskuddStepper.VIRKNINGSTIDSPUNKT;
        const inntektTab = searchParams.get(behandlingQueryKeys.inntektTab);
        return `${step}${inntektTab ? `.${inntektTab}` : ""}`;
    };
    const [activeButton, setActiveButton] = useState<string>(getActiveButtonFromParams());
    const interactive = !virkningstidspunkt.avslag && vedtakstype !== Vedtakstype.OPPHOR;
    const inntektRoller = roller
        .filter((rolle) => rolle.rolletype !== Rolletype.BP)
        .sort((a, b) => {
            if (a.rolletype === Rolletype.BM) return -1;
            if (b.rolletype === Rolletype.BM) return 1;

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
    const sivilstandValideringsFeil = !!boforholdValideringsfeil?.sivilstand;
    const husstandsmedlemIkkeAktiverteEndringer = !!ikkeAktiverteEndringerIGrunnlagsdata?.husstandsmedlem?.length;
    const sivilstandIkkeAktiverteEndringer = !!ikkeAktiverteEndringerIGrunnlagsdata?.sivilstand;
    const inntekterIkkeAktiverteEndringer =
        !!ikkeAktiverteEndringerIGrunnlagsdata?.inntekter &&
        Object.values(ikkeAktiverteEndringerIGrunnlagsdata.inntekter).some((inntekt) => !!inntekt.length);

    return (
        <SideMenu>
            <MenuButton
                step={"1."}
                title={ForskuddStepper.VIRKNINGSTIDSPUNKT}
                onStepChange={() => onStepChange(STEPS[ForskuddStepper.VIRKNINGSTIDSPUNKT])}
                active={activeButton === ForskuddStepper.VIRKNINGSTIDSPUNKT}
            />
            <MenuButton
                step={"2."}
                title={ForskuddStepper.BOFORHOLD}
                onStepChange={() => onStepChange(STEPS[ForskuddStepper.BOFORHOLD])}
                interactive={interactive}
                active={activeButton === ForskuddStepper.BOFORHOLD}
                valideringsfeil={husstandsmedlemValideringsFeil || sivilstandValideringsFeil}
                unconfirmedUpdates={husstandsmedlemIkkeAktiverteEndringer || sivilstandIkkeAktiverteEndringer}
                subMenu={
                    <>
                        <MenuButton
                            title={text.title.barn}
                            onStepChange={() =>
                                onStepChange(STEPS[ForskuddStepper.BOFORHOLD], undefined, elementIds.seksjon_boforhold)
                            }
                            interactive={interactive}
                            size="small"
                            active={activeButton === ForskuddStepper.BOFORHOLD}
                            valideringsfeil={husstandsmedlemValideringsFeil}
                            unconfirmedUpdates={husstandsmedlemIkkeAktiverteEndringer}
                        />
                        <MenuButton
                            title={text.title.sivilstand}
                            onStepChange={() =>
                                onStepChange(STEPS[ForskuddStepper.BOFORHOLD], undefined, elementIds.seksjon_sivilstand)
                            }
                            interactive={interactive}
                            size="small"
                            active={activeButton === ForskuddStepper.BOFORHOLD}
                            valideringsfeil={sivilstandValideringsFeil}
                            unconfirmedUpdates={sivilstandIkkeAktiverteEndringer}
                        />
                    </>
                }
            />
            <MenuButton
                step={"3."}
                title={ForskuddStepper.INNTEKT}
                onStepChange={() => onStepChange(STEPS[ForskuddStepper.INNTEKT])}
                interactive={interactive}
                active={activeButton?.includes(ForskuddStepper.INNTEKT)}
                valideringsfeil={
                    inntektValideringsfeil &&
                    Object.values(inntektValideringsfeil).some((valideringsfeil) => valideringsfeil)
                }
                unconfirmedUpdates={inntekterIkkeAktiverteEndringer}
                subMenu={inntektRoller.map((rolle) => (
                    <>
                        <MenuButton
                            title={`${rolle.rolletype} ${rolle.ident}`}
                            onStepChange={() =>
                                onStepChange(STEPS[ForskuddStepper.INNTEKT], {
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
                            active={activeButton === `${ForskuddStepper.INNTEKT}.${rolle.id.toString()}`}
                            subMenu={
                                rolle.rolletype === Rolletype.BM ? (
                                    <>
                                        <MenuButton
                                            title={text.title.skattepliktigeogPensjonsgivendeInntekt}
                                            onStepChange={() =>
                                                onStepChange(
                                                    STEPS[ForskuddStepper.INNTEKT],
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
                                                activeButton === `${ForskuddStepper.INNTEKT}.${rolle.id.toString()}`
                                            }
                                        />
                                        <MenuButton
                                            title={text.title.barnetillegg}
                                            onStepChange={() =>
                                                onStepChange(
                                                    STEPS[ForskuddStepper.INNTEKT],
                                                    {
                                                        [behandlingQueryKeys.inntektTab]: rolle.id.toString(),
                                                    },
                                                    elementIds.seksjon_inntekt_barnetillegg
                                                )
                                            }
                                            interactive={interactive}
                                            size="small"
                                            active={
                                                activeButton === `${ForskuddStepper.INNTEKT}.${rolle.id.toString()}`
                                            }
                                            valideringsfeil={!!inntektValideringsfeil?.barnetillegg?.length}
                                            unconfirmedUpdates={
                                                !!ikkeAktiverteEndringerIGrunnlagsdata?.inntekter?.barnetillegg?.length
                                            }
                                        />
                                        <MenuButton
                                            title={text.title.utvidetBarnetrygd}
                                            onStepChange={() =>
                                                onStepChange(
                                                    STEPS[ForskuddStepper.INNTEKT],
                                                    {
                                                        [behandlingQueryKeys.inntektTab]: rolle.id.toString(),
                                                    },
                                                    elementIds.seksjon_inntekt_utvidetbarnetrygd
                                                )
                                            }
                                            interactive={interactive}
                                            size="small"
                                            active={
                                                activeButton === `${ForskuddStepper.INNTEKT}.${rolle.id.toString()}`
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
                                                    STEPS[ForskuddStepper.INNTEKT],
                                                    {
                                                        [behandlingQueryKeys.inntektTab]: rolle.id.toString(),
                                                    },
                                                    elementIds.seksjon_inntekt_småbarnstillegg
                                                )
                                            }
                                            interactive={interactive}
                                            size="small"
                                            active={
                                                activeButton === `${ForskuddStepper.INNTEKT}.${rolle.id.toString()}`
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
                                                    STEPS[ForskuddStepper.INNTEKT],
                                                    {
                                                        [behandlingQueryKeys.inntektTab]: rolle.id.toString(),
                                                    },
                                                    elementIds.seksjon_inntekt_kontantstøtte
                                                )
                                            }
                                            interactive={interactive}
                                            size="small"
                                            active={
                                                activeButton === `${ForskuddStepper.INNTEKT}.${rolle.id.toString()}`
                                            }
                                            valideringsfeil={!!inntektValideringsfeil?.kontantstøtte?.length}
                                            unconfirmedUpdates={
                                                !!ikkeAktiverteEndringerIGrunnlagsdata?.inntekter?.kontantstøtte?.length
                                            }
                                        />
                                    </>
                                ) : (
                                    <>
                                        <MenuButton
                                            title={text.title.skattepliktigeogPensjonsgivendeInntekt}
                                            onStepChange={() =>
                                                onStepChange(
                                                    STEPS[ForskuddStepper.INNTEKT],
                                                    {
                                                        [behandlingQueryKeys.inntektTab]: rolle.id.toString(),
                                                    },
                                                    elementIds.seksjon_inntekt_skattepliktig
                                                )
                                            }
                                            interactive={interactive}
                                            size="small"
                                            active={
                                                activeButton === `${ForskuddStepper.INNTEKT}.${rolle.id.toString()}`
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
                title={ForskuddStepper.VEDTAK}
                onStepChange={() => onStepChange(STEPS[ForskuddStepper.VEDTAK])}
                active={activeButton === ForskuddStepper.VEDTAK}
            />
        </SideMenu>
    );
};
