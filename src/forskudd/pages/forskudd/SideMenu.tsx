import { Rolletype, Vedtakstype } from "@api/BidragBehandlingApiV1";
import behandlingQueryKeys from "@common/constants/behandlingQueryKeys";
import elementIds from "@common/constants/elementIds";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import {
    BellDotIcon,
    CheckmarkIcon,
    ChevronLeftCircleIcon,
    ExclamationmarkTriangleFillIcon,
} from "@navikt/aksel-icons";
import { Button, VStack } from "@navikt/ds-react";
import { scrollToHash } from "@utils/window-utils";
import React, { ReactNode, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { STEPS } from "../../constants/steps";
import { ForskuddStepper } from "../../enum/ForskuddStepper";

const MenuButton = ({
    completed,
    step,
    title,
    onStepChange,
    interactive,
    subMenu,
    size,
    active,
    valideringsfeil,
    unconfirmedUpdates,
}: {
    completed?: boolean;
    step?: string;
    title: string;
    onStepChange: () => void;
    interactive?: boolean;
    subMenu?: ReactNode;
    size?: "small" | "medium" | "xsmall";
    active: boolean;
    valideringsfeil?: boolean;
    unconfirmedUpdates?: boolean;
}) => {
    const onClick = () => {
        onStepChange();
        scrollToHash();
    };

    return (
        <>
            <Button
                variant="tertiary"
                className={`w-full justify-start rounded-none py-3 px-5 ${active ? "bg-[var(--a-blue-50)]" : ""}`}
                onClick={onClick}
                disabled={!interactive}
                size={size ?? "medium"}
            >
                <span className="flex items-center gap-1 h-5">
                    <span className="w-5">
                        {((unconfirmedUpdates && !active) || (unconfirmedUpdates && !subMenu)) && (
                            <BellDotIcon title="Info" />
                        )}
                    </span>
                    <span className="w-5">
                        {completed && <CheckmarkIcon title="Checked" />}
                        {((valideringsfeil && !active) || (valideringsfeil && !subMenu)) && (
                            <ExclamationmarkTriangleFillIcon
                                title="Advarsel"
                                style={{ color: "var(--ac-alert-icon-warning-color, var(--a-icon-warning))" }}
                            />
                        )}
                    </span>
                    <span className="w-5">{step && step}</span>
                    <span className={`text-left ${!subMenu && size === "small" ? "font-normal" : ""}`}>{title}</span>
                </span>
            </Button>
            {active && subMenu}
        </>
    );
};

export const SideMenu = () => {
    const { onStepChange, activeStep } = useBehandlingProvider();
    const {
        virkningstidspunkt,
        erVedtakFattet,
        vedtakstype,
        boforhold: { valideringsfeil: boforholdValideringsfeil },
        inntekter: { valideringsfeil: inntektValideringsfeil },
        ikkeAktiverteEndringerIGrunnlagsdata,
        roller,
    } = useGetBehandlingV2();
    const [searchParams] = useSearchParams();
    const [menuOpen, setMenuOpen] = useState<boolean>(true);
    const [activeButton, setActiveButton] = useState<string>(searchParams.get("steg"));
    const activeStepIndex = STEPS[activeStep];
    const interactive = !virkningstidspunkt.avslag && vedtakstype !== Vedtakstype.OPPHOR;
    const inntekterIkkeAktiveGrunnlag = ikkeAktiverteEndringerIGrunnlagsdata?.inntekter
        ? Object.keys(ikkeAktiverteEndringerIGrunnlagsdata.inntekter).flatMap(
              (f) => ikkeAktiverteEndringerIGrunnlagsdata.inntekter[f]
          )
        : [];
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

    const closedMenuCss = "p-0 w-0 min-w-0";
    const openMenuCss = "p-6 min-w-[248px]";

    useEffect(() => {
        const step = searchParams.get(behandlingQueryKeys.steg);
        const inntektTab = searchParams.get(behandlingQueryKeys.inntektTab);
        setActiveButton(`${step}${inntektTab ? `.${inntektTab}` : ""}`);
    }, [searchParams, location]);

    return (
        <div
            className={`top-0 z-10 h-screen sticky border-solid border-0 border-r-2 border-r-blue-400 max-w-[412px] ${
                menuOpen ? openMenuCss : closedMenuCss
            }`}
        >
            {menuOpen && (
                <VStack gap="0" className="border border-solid border-[var(--a-border-divider)]">
                    <MenuButton
                        completed={activeStepIndex > 1}
                        step={"1."}
                        title={"Virkningstidspunkt"}
                        onStepChange={() => onStepChange(STEPS[ForskuddStepper.VIRKNINGSTIDSPUNKT])}
                        interactive={interactive}
                        active={activeButton === ForskuddStepper.VIRKNINGSTIDSPUNKT}
                    />
                    <hr className="navds-dropdown__divider m-0" />
                    <MenuButton
                        completed={
                            activeStepIndex > 2 &&
                            (boforholdValideringsfeil?.husstandsmedlem === undefined ||
                                boforholdValideringsfeil?.husstandsmedlem?.length === 0) &&
                            (ikkeAktiverteEndringerIGrunnlagsdata?.husstandsmedlem === undefined ||
                                ikkeAktiverteEndringerIGrunnlagsdata?.husstandsmedlem?.length === 0) &&
                            ikkeAktiverteEndringerIGrunnlagsdata?.sivilstand === null &&
                            boforholdValideringsfeil?.sivilstand === null
                        }
                        valideringsfeil={
                            boforholdValideringsfeil?.husstandsmedlem !== undefined ||
                            boforholdValideringsfeil?.husstandsmedlem?.length !== 0 ||
                            boforholdValideringsfeil?.sivilstand !== null
                        }
                        unconfirmedUpdates={
                            !!ikkeAktiverteEndringerIGrunnlagsdata?.husstandsmedlem?.length ||
                            !!ikkeAktiverteEndringerIGrunnlagsdata?.sivilstand
                        }
                        step={"2."}
                        title={"Boforhold"}
                        onStepChange={() => onStepChange(STEPS[ForskuddStepper.BOFORHOLD])}
                        interactive={interactive}
                        active={activeButton === ForskuddStepper.BOFORHOLD}
                        subMenu={
                            <>
                                <hr className="navds-dropdown__divider m-0" />
                                <MenuButton
                                    title={text.title.barn}
                                    onStepChange={() =>
                                        onStepChange(
                                            STEPS[ForskuddStepper.BOFORHOLD],
                                            undefined,
                                            elementIds.seksjon_boforhold
                                        )
                                    }
                                    interactive={interactive}
                                    size="small"
                                    active={activeButton === ForskuddStepper.BOFORHOLD}
                                    valideringsfeil={!!boforholdValideringsfeil?.husstandsmedlem?.length}
                                    unconfirmedUpdates={!!ikkeAktiverteEndringerIGrunnlagsdata?.husstandsmedlem?.length}
                                />
                                <hr className="navds-dropdown__divider m-0" />
                                <MenuButton
                                    title={text.title.sivilstand}
                                    onStepChange={() =>
                                        onStepChange(
                                            STEPS[ForskuddStepper.BOFORHOLD],
                                            undefined,
                                            elementIds.seksjon_sivilstand
                                        )
                                    }
                                    interactive={interactive}
                                    size="small"
                                    active={activeButton === ForskuddStepper.BOFORHOLD}
                                    valideringsfeil={!!boforholdValideringsfeil?.sivilstand}
                                    unconfirmedUpdates={!!ikkeAktiverteEndringerIGrunnlagsdata?.sivilstand}
                                />
                            </>
                        }
                    />
                    <hr className="navds-dropdown__divider m-0" />
                    <MenuButton
                        completed={
                            activeStepIndex > 3 &&
                            (!inntektValideringsfeil || !Object.keys(inntektValideringsfeil).length) &&
                            inntekterIkkeAktiveGrunnlag.length === 0
                        }
                        step={"3."}
                        title={"Inntekt"}
                        onStepChange={() => onStepChange(STEPS[ForskuddStepper.INNTEKT])}
                        interactive={interactive}
                        active={activeButton?.includes(ForskuddStepper.INNTEKT)}
                        valideringsfeil={inntektValideringsfeil && Object.keys(inntektValideringsfeil).length !== 0}
                        unconfirmedUpdates={!!ikkeAktiverteEndringerIGrunnlagsdata?.inntekter}
                        subMenu={inntektRoller.map((rolle) => (
                            <>
                                <hr className="navds-dropdown__divider m-0" />
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
                                        Object.values(inntektValideringsfeil).some(
                                            (valideringsfeil) =>
                                                valideringsfeil?.some((feil) => feil?.rolle?.id === rolle.id)
                                        )
                                    }
                                    unconfirmedUpdates={
                                        ikkeAktiverteEndringerIGrunnlagsdata?.inntekter &&
                                        Object.values(ikkeAktiverteEndringerIGrunnlagsdata.inntekter).some(
                                            (inntekter) => inntekter.some((inntekt) => inntekt.ident === rolle.ident)
                                        )
                                    }
                                    active={activeButton === `${ForskuddStepper.INNTEKT}.${rolle.id.toString()}`}
                                    subMenu={
                                        rolle.rolletype === Rolletype.BM ? (
                                            <>
                                                <hr className="navds-dropdown__divider m-0" />
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
                                                        activeButton ===
                                                        `${ForskuddStepper.INNTEKT}.${rolle.id.toString()}`
                                                    }
                                                />
                                                <hr className="navds-dropdown__divider m-0" />
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
                                                        activeButton ===
                                                        `${ForskuddStepper.INNTEKT}.${rolle.id.toString()}`
                                                    }
                                                    valideringsfeil={!!inntektValideringsfeil?.barnetillegg}
                                                    unconfirmedUpdates={
                                                        !!ikkeAktiverteEndringerIGrunnlagsdata?.inntekter?.barnetillegg
                                                            ?.length
                                                    }
                                                />
                                                <hr className="navds-dropdown__divider m-0" />
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
                                                        activeButton ===
                                                        `${ForskuddStepper.INNTEKT}.${rolle.id.toString()}`
                                                    }
                                                    valideringsfeil={!!inntektValideringsfeil?.utvidetBarnetrygd}
                                                    unconfirmedUpdates={
                                                        !!ikkeAktiverteEndringerIGrunnlagsdata?.inntekter
                                                            ?.utvidetBarnetrygd?.length
                                                    }
                                                />
                                                <hr className="navds-dropdown__divider m-0" />
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
                                                        activeButton ===
                                                        `${ForskuddStepper.INNTEKT}.${rolle.id.toString()}`
                                                    }
                                                    valideringsfeil={!!inntektValideringsfeil?.småbarnstillegg}
                                                    unconfirmedUpdates={
                                                        !!ikkeAktiverteEndringerIGrunnlagsdata?.inntekter
                                                            ?.småbarnstillegg?.length
                                                    }
                                                />
                                                <hr className="navds-dropdown__divider m-0" />
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
                                                        activeButton ===
                                                        `${ForskuddStepper.INNTEKT}.${rolle.id.toString()}`
                                                    }
                                                    valideringsfeil={!!inntektValideringsfeil?.kontantstøtte}
                                                    unconfirmedUpdates={
                                                        !!ikkeAktiverteEndringerIGrunnlagsdata?.inntekter?.kontantstøtte
                                                            ?.length
                                                    }
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <hr className="navds-dropdown__divider m-0" />
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
                                                        activeButton ===
                                                        `${ForskuddStepper.INNTEKT}.${rolle.id.toString()}`
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
                    <hr className="navds-dropdown__divider m-0" />
                    <MenuButton
                        completed={erVedtakFattet}
                        step={"4."}
                        title={"Vedtak"}
                        onStepChange={() => onStepChange(STEPS[ForskuddStepper.VEDTAK])}
                        interactive={interactive}
                        active={activeButton === ForskuddStepper.VEDTAK}
                    />
                </VStack>
            )}
            <Button
                className={`absolute right-[-1rem] top-[40%] p-0 rounded-full bg-white z-10 duration-500 ${
                    !menuOpen ? "rotate-180" : "rotate-0"
                }`}
                variant="tertiary"
                icon={<ChevronLeftCircleIcon title="sidebar-button" fontSize="2rem" />}
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
            />
        </div>
    );
};
