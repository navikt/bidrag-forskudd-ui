import { BodyLong, BodyShort, Heading, Label, Loader } from "@navikt/ds-react";
import React, { Fragment, Suspense, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useGetArbeidsforhold } from "../../__mocks__/mocksForMissingEndpoints/useMockApi";
import { RolleType } from "../../api/BidragBehandlingApi";
import { NavLogo } from "../../assets/NavLogo";
import { createInitialValues, mapHusstandsMedlemmerToBarn } from "../../components/forms/helpers/boforholdFormHelpers";
import { getPerioderFraInntekter } from "../../components/forms/helpers/inntektFormHelpers";
import { FlexRow } from "../../components/layout/grid/FlexRow";
import { PersonNavn } from "../../components/PersonNavn";
import { TableRowWrapper, TableWrapper } from "../../components/table/TableWrapper";
import { Avslag } from "../../enum/Avslag";
import { ForskuddBeregningKodeAarsak } from "../../enum/ForskuddBeregningKodeAarsak";
import { InntektBeskrivelse } from "../../enum/InntektBeskrivelse";
import {
    useGetBehandling,
    useGetBoforhold,
    useGetBoforoholdOpplysninger,
    useGetVirkningstidspunkt,
    useGrunnlagspakke,
    useHentInntekter,
} from "../../hooks/useApiData";
import { dateOrNull, DateToDDMMYYYYString, ISODateTimeStringToDDMMYYYYString } from "../../utils/date-utils";

export enum NotatVirkningsTidspunktFields {
    "virkningsDato",
    "aarsak",
    "virkningsTidspunktBegrunnelseMedIVedtakNotat",
    "virkningsTidspunktBegrunnelseKunINotat",
}
export default () => {
    return (
        <div className="max-w-[1092px] mx-auto px-6 py-6">
            <div className="grid grid-cols-[60%,40%]">
                <Virkningstidspunkt />
                <NavLogo />
            </div>
            <Suspense
                fallback={
                    <div className="flex justify-center">
                        <Loader size="3xlarge" title="venter..." variant="interaction" />
                    </div>
                }
            >
                <Boforhold />
            </Suspense>
            <Inntekter />
        </div>
    );
};

const Virkningstidspunkt = () => {
    const { behandlingId } = useParams<{ behandlingId?: string }>();
    const { data: behandling } = useGetBehandling(Number(behandlingId));
    const { data: behandlingVirkningstidspunkt } = useGetVirkningstidspunkt(Number(behandlingId));

    return (
        <Suspense
            fallback={
                <div className="flex justify-center">
                    <Loader size="3xlarge" title="venter..." variant="interaction" />
                </div>
            }
        >
            <VirkningstidspunktView
                behandling={behandling}
                behandlingVirkningstidspunkt={behandlingVirkningstidspunkt}
            />
        </Suspense>
    );
};

const VirkningstidspunktView = ({ behandling, behandlingVirkningstidspunkt }) => {
    const [virkningstidspunkt, setVirkningstidspunkt] = useState(behandlingVirkningstidspunkt.virkningsDato);
    const [aarsak, setAarsak] = useState(behandlingVirkningstidspunkt.aarsak);
    const [begrunnelse, setBegrunnelse] = useState(
        behandlingVirkningstidspunkt.virkningsTidspunktBegrunnelseMedIVedtakNotat
    );
    const [begrunnelseKunINotat, setBegrunnelseKunINotat] = useState(
        behandlingVirkningstidspunkt.virkningsTidspunktBegrunnelseKunINotat
    );
    const channel = new BroadcastChannel("virkningstidspunkt");

    useEffect(() => {
        channel.onmessage = (ev) => {
            const data = JSON.parse(ev.data);

            if (virkningstidspunkt !== data[NotatVirkningsTidspunktFields.virkningsDato]) {
                setVirkningstidspunkt(
                    ISODateTimeStringToDDMMYYYYString(data[NotatVirkningsTidspunktFields.virkningsDato])
                );
            }
            if (aarsak !== data[NotatVirkningsTidspunktFields.aarsak])
                setAarsak(data[NotatVirkningsTidspunktFields.aarsak]);
            if (begrunnelse !== data[NotatVirkningsTidspunktFields.virkningsTidspunktBegrunnelseMedIVedtakNotat])
                setBegrunnelse(data[NotatVirkningsTidspunktFields.virkningsTidspunktBegrunnelseMedIVedtakNotat]);
            if (begrunnelseKunINotat !== data[NotatVirkningsTidspunktFields.virkningsTidspunktBegrunnelseKunINotat])
                setBegrunnelseKunINotat(data[NotatVirkningsTidspunktFields.virkningsTidspunktBegrunnelseKunINotat]);
        };

        return () => channel.close();
    }, [channel]);

    return (
        <div className="grid gap-y-8">
            <Heading level="2" size="large">
                Saksbehandlingsnotat: søknad om forskudd
            </Heading>
            <div className="grid gap-y-2">
                <Heading level="3" size="medium">
                    Parter
                </Heading>
                <div className="flex gap-x-2">
                    <Label size="small">BM:</Label>
                    <BodyShort size="small">
                        <PersonNavn
                            ident={
                                behandling.roller.find((rolle) => rolle.rolleType === RolleType.BIDRAGS_MOTTAKER).ident
                            }
                        ></PersonNavn>
                    </BodyShort>
                </div>
            </div>
            <div className="grid gap-y-2">
                <Heading level="3" size="medium">
                    Om søknad
                </Heading>
                <div className="flex gap-x-2">
                    <Label size="small">Saksnummer:</Label>
                    <BodyShort size="small">{behandling.saksnummer}</BodyShort>
                </div>
                <div className="flex gap-x-2">
                    <Label size="small">Mottatt dato:</Label>
                    <BodyShort size="small">{DateToDDMMYYYYString(new Date(behandling.mottatDato))}</BodyShort>
                </div>
                <div className="flex gap-x-2">
                    <Label size="small">Søkt fra dato:</Label>
                    <BodyShort size="small">{DateToDDMMYYYYString(new Date(behandling.datoFom))}</BodyShort>
                </div>
                <div className="flex gap-x-2">
                    <Label size="small">Virkningstidspunkt:</Label>
                    <BodyShort size="small">
                        {virkningstidspunkt ? DateToDDMMYYYYString(new Date(virkningstidspunkt)) : ""}
                    </BodyShort>
                </div>
                <div className="flex gap-x-2">
                    <Label size="small">Saksbehandler:</Label>
                    <BodyShort size="small">{"<id>"}</BodyShort>
                </div>
                <div className="flex gap-x-2">
                    <Label size="small">Årsak:</Label>
                    <BodyShort size="small">{ForskuddBeregningKodeAarsak[aarsak] ?? Avslag[aarsak]}</BodyShort>
                </div>
                <div>
                    <Label size="small">Begrunnelse:</Label>
                    <BodyLong size="small">{begrunnelse}</BodyLong>
                </div>
                <div>
                    <Label size="small">Begrunnelse kun i notat:</Label>
                    <BodyLong size="small">{begrunnelseKunINotat}</BodyLong>
                </div>
            </div>
        </div>
    );
};

const Boforhold = () => {
    const { behandlingId } = useParams<{ behandlingId?: string }>();
    const { data: behandling } = useGetBehandling(Number(behandlingId));
    const { data: boforhold } = useGetBoforhold(Number(behandlingId));
    const { data: grunnlagspakke } = useGrunnlagspakke(behandling);
    const { data: virkningstidspunktValues } = useGetVirkningstidspunkt(Number(behandlingId));
    const { data: boforoholdOpplysninger } = useGetBoforoholdOpplysninger(Number(behandlingId));
    const opplysningerFraFolkRegistre = mapHusstandsMedlemmerToBarn(grunnlagspakke.husstandmedlemmerOgEgneBarnListe);
    const virkningstidspunkt = dateOrNull(virkningstidspunktValues?.virkningsDato);
    const datoFom = virkningstidspunkt ?? dateOrNull(behandling.datoFom);

    const initialValues = createInitialValues(
        behandling,
        boforhold,
        opplysningerFraFolkRegistre,
        datoFom,
        grunnlagspakke,
        !!boforoholdOpplysninger?.data
    );

    console.log(initialValues);

    return null;
};

const Inntekter = () => {
    const { behandlingId } = useParams<{ behandlingId?: string }>();
    const { data: behandling } = useGetBehandling(Number(behandlingId));
    const bmOgBarn = behandling.roller.filter(
        (rolle) => rolle.rolleType === RolleType.BIDRAGS_MOTTAKER || rolle.rolleType === RolleType.BARN
    );
    const { data: inntekt } = useHentInntekter(Number(behandlingId));
    const { data: arbeidsforholder } = useGetArbeidsforhold(behandlingId);
    const inntektPerioder = getPerioderFraInntekter(bmOgBarn, inntekt.inntekter);

    return (
        <Suspense>
            <InntekterView inntekt={inntektPerioder} arbeidsforholder={arbeidsforholder} />
        </Suspense>
    );
};

const InntekterView = ({ inntekt, arbeidsforholder }) => {
    const channel = new BroadcastChannel("inntekter");
    const [inntekteneSomLeggesTilGrunn, setInntekteneSomLeggesTilGrunn] = useState(inntekt);

    useEffect(() => {
        channel.onmessage = (ev) => {
            const data = JSON.parse(ev.data);
            switch (data.field) {
                case "inntekteneSomLeggesTilGrunn":
                    setInntekteneSomLeggesTilGrunn(data.value);
                    break;
            }
        };

        return () => channel.close();
    }, [channel]);

    return (
        <div className="grid gap-y-8 mt-8">
            <div className="grid gap-y-2">
                <Heading level="4" size="small">
                    Arbeidsforhold
                </Heading>
                {arbeidsforholder.map((arbeidsforhold, index) => (
                    <FlexRow
                        key={`${arbeidsforhold.periode.fraDato}-${arbeidsforhold.periode.tilDato}-${index}`}
                        className="gap-x-12"
                    >
                        <div>
                            <Label size="small">Periode</Label>
                            <BodyShort size="small">
                                {DateToDDMMYYYYString(new Date(arbeidsforhold.periode.fraDato))} -{" "}
                                {DateToDDMMYYYYString(new Date(arbeidsforhold.periode.tilDato))}
                            </BodyShort>
                        </div>
                        <div>
                            <Label size="small">Arbeidsgiver</Label>
                            <BodyShort size="small">{arbeidsforhold.arbeidsgiverNavn}</BodyShort>
                        </div>
                        <div>
                            <Label size="small">Stilling</Label>
                            <BodyShort size="small">{arbeidsforhold.stillingsprosent}</BodyShort>
                        </div>
                        <div>
                            <Label size="small">Lønnsendring</Label>
                            <BodyShort size="small">
                                {DateToDDMMYYYYString(new Date(arbeidsforhold.sisteLoennsendring))}
                            </BodyShort>
                        </div>
                    </FlexRow>
                ))}
            </div>
            <div className="grid gap-y-2">
                <Heading level="4" size="small">
                    Inntekter
                </Heading>
                {inntekteneSomLeggesTilGrunn &&
                    Object.keys(inntekteneSomLeggesTilGrunn)
                        .map((ident) => ({
                            ident,
                            inntekter: inntekteneSomLeggesTilGrunn[ident].filter((inntekt) => inntekt.taMed),
                        }))
                        .filter(({ inntekter }) => inntekter.length > 0)
                        .map(({ ident, inntekter }, index) => {
                            return (
                                <Fragment key={`${ident}-${index}`}>
                                    <div className="mt-4">
                                        <BodyShort size="small">
                                            <PersonNavn ident={ident} />
                                            <span className="ml-4">/ {ident}</span>
                                        </BodyShort>
                                        <TableWrapper heading={["Periode", "Inntekt", "Beskrivelse"]}>
                                            {inntekter.map((inntekt, index) => (
                                                <TableRowWrapper
                                                    key={`${InntektBeskrivelse[inntekt.inntektType]}-${index}`}
                                                    cells={[
                                                        <BodyShort key={`${ident}-${index}-periode`} size="small">
                                                            {inntekt.datoFom &&
                                                                DateToDDMMYYYYString(new Date(inntekt.datoFom))}{" "}
                                                            -{" "}
                                                            {inntekt.datoTom &&
                                                                DateToDDMMYYYYString(new Date(inntekt.datoTom))}
                                                        </BodyShort>,
                                                        <BodyShort key={`${ident}-${index}-belop`} size="small">
                                                            {inntekt.belop}
                                                        </BodyShort>,
                                                        <BodyShort key={`${ident}-${index}-beskrivelse`} size="small">
                                                            {InntektBeskrivelse[inntekt.inntektType]}
                                                        </BodyShort>,
                                                    ]}
                                                />
                                            ))}
                                        </TableWrapper>
                                    </div>
                                </Fragment>
                            );
                        })}
            </div>
        </div>
    );
};
