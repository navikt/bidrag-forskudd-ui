import { BodyLong, BodyShort, Heading, Label, Loader } from "@navikt/ds-react";
import React, { Fragment, Suspense, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useGetArbeidsforhold, useGetInntekt } from "../../__mocks__/mocksForMissingEndpoints/useMockApi";
import { RolleType } from "../../api/BidragBehandlingApi";
import { NavLogo } from "../../assets/NavLogo";
import { FlexRow } from "../../components/layout/grid/FlexRow";
import { PersonNavn } from "../../components/PersonNavn";
import { TableRowWrapper, TableWrapper } from "../../components/table/TableWrapper";
import { ForskuddBeregningKodeAarsak } from "../../enum/ForskuddBeregningKodeAarsak";
import { useGetBehandling } from "../../hooks/useApiData";
import { ISODateTimeStringToDDMMYYYYString } from "../../utils/date-utils";

export enum NotatVirkningsTidspunktFields {
    "virkningsDato",
    "aarsak",
    "begrunnelse",
}
export default () => {
    return (
        <div className="max-w-[1092px] mx-auto px-6 py-6">
            <div className="grid grid-cols-[60%,40%]">
                <Virkningstidspunkt />
                <NavLogo />
            </div>
            <Inntekter />
        </div>
    );
};

const Virkningstidspunkt = () => {
    const { behandlingId } = useParams<{ behandlingId?: string }>();
    const { data: behandling } = useGetBehandling(Number(behandlingId));

    return (
        <Suspense
            fallback={
                <div className="flex justify-center">
                    <Loader size="3xlarge" title="venter..." variant="interaction" />
                </div>
            }
        >
            <VirkningstidspunktView behandling={behandling} />
        </Suspense>
    );
};

const VirkningstidspunktView = ({ behandling }) => {
    const [virkningstidspunkt, setVirkningstidspunkt] = useState(behandling.virkningsDato);
    const [aarsak, setAarsak] = useState(behandling.aarsak);
    const [begrunnelse, setBegrunnelse] = useState(behandling.virkningsTidspunktBegrunnelseMedIVedtakNotat);
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
            if (begrunnelse !== data[NotatVirkningsTidspunktFields.begrunnelse])
                setBegrunnelse(data[NotatVirkningsTidspunktFields.begrunnelse]);
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
                    <BodyShort size="small">{behandling.mottatDato}</BodyShort>
                </div>
                <div className="flex gap-x-2">
                    <Label size="small">Søkt fra dato:</Label>
                    <BodyShort size="small">{behandling.datoFom}</BodyShort>
                </div>
                <div className="flex gap-x-2">
                    <Label size="small">Virkningstidspunkt:</Label>
                    <BodyShort size="small">{virkningstidspunkt}</BodyShort>
                </div>
                <div className="flex gap-x-2">
                    <Label size="small">Saksbehandler:</Label>
                    <BodyShort size="small">{"<id>"}</BodyShort>
                </div>
                <div className="flex gap-x-2">
                    <Label size="small">Årsak:</Label>
                    <BodyShort size="small">{ForskuddBeregningKodeAarsak[aarsak]}</BodyShort>
                </div>
                <div>
                    <Label size="small">Begrunnelse:</Label>
                    <BodyLong size="small">{begrunnelse}</BodyLong>
                </div>
            </div>
        </div>
    );
};

const Inntekter = () => {
    const { behandlingId } = useParams<{ behandlingId?: string }>();
    const { data: behandling } = useGetBehandling(Number(behandlingId));
    const roller = behandling?.roller?.filter((rolle) => rolle.rolleType !== RolleType.BIDRAGS_PLIKTIG);
    const { data: inntekt } = useGetInntekt(behandlingId, roller);
    const { data: arbeidsforholder } = useGetArbeidsforhold(behandlingId);

    return (
        <Suspense>
            <InntekterView inntekt={inntekt} arbeidsforholder={arbeidsforholder} roller={roller} />
        </Suspense>
    );
};

const InntekterView = ({ inntekt, arbeidsforholder, roller }) => {
    const channel = new BroadcastChannel("inntekter");
    const [inntekteneSomLeggesTilGrunn, setInntekteneSomLeggesTilGrunn] = useState(inntekt.inntekteneSomLeggesTilGrunn);

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

    const bidragsMottakerInntekt = inntekt.inntekteneSomLeggesTilGrunn.find(
        (i) => i.ident === roller.find((rolle) => rolle.rolleType === RolleType.BIDRAGS_MOTTAKER).ident
    );
    const treMaanderBeregnet = bidragsMottakerInntekt.inntekt.find(
        (inntekt) => inntekt.tekniskNavn === "gjennomsnittInntektSisteTreMaaneder"
    ).totalt;
    const tolvMaanderBeregnet = bidragsMottakerInntekt.inntekt.find(
        (inntekt) => inntekt.tekniskNavn === "gjennomsnittInntektSisteTolvMaaneder"
    ).totalt;

    return (
        <div className="grid gap-y-8 mt-8">
            <Heading level="3" size="medium">
                Inntekter
            </Heading>
            <div className="grid gap-y-2">
                <Heading level="4" size="small">
                    {"<Inntekter og/eller utbetalinger fra NAV>"}
                </Heading>
                <div className="flex gap-x-2">
                    <Label size="small">Gjennomsnitt inntekt siste 3 måneder (omregnet til årsinntekt):</Label>
                    <BodyShort size="small">
                        {treMaanderBeregnet}/{Math.round(treMaanderBeregnet / 12)}
                    </BodyShort>
                </div>
                <div className="flex gap-x-2">
                    <Label size="small">Gjennomsnitt inntekt siste 12 måneder (omregnet til årsinntekt):</Label>
                    <BodyShort size="small">
                        {tolvMaanderBeregnet}/{Math.round(tolvMaanderBeregnet / 12)}
                    </BodyShort>
                </div>
            </div>
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
                                {arbeidsforhold.periode.fraDato} - {arbeidsforhold.periode.tilDato}
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
                            <BodyShort size="small">{arbeidsforhold.sisteLoennsendring}</BodyShort>
                        </div>
                    </FlexRow>
                ))}
            </div>
            <div className="grid gap-y-2">
                <Heading level="4" size="small">
                    Inntekter
                </Heading>
                {inntekteneSomLeggesTilGrunn
                    .map(({ ident, inntekt }) => ({ ident, inntekt: inntekt.filter((inntekt) => inntekt.selected) }))
                    .filter(({ inntekt }) => inntekt.length > 0)
                    .map(({ ident, inntekt }, index) => {
                        return (
                            <Fragment key={`${inntekt.ident}-${index}`}>
                                <div className="mt-4">
                                    <BodyShort size="small">
                                        <PersonNavn ident={ident} />
                                        <span className="ml-4">/ {ident}</span>
                                    </BodyShort>
                                    <TableWrapper heading={["Periode", "Inntekt", "Beskrivelse"]}>
                                        {inntekt.map((inntekt, index) => (
                                            <TableRowWrapper
                                                key={`${inntekt.beskrivelse}-${index}`}
                                                cells={[
                                                    <BodyShort size="small">
                                                        {inntekt.fraDato} - {inntekt.tilDato}
                                                    </BodyShort>,
                                                    <BodyShort size="small">{inntekt.totalt}</BodyShort>,
                                                    <BodyShort size="small">{inntekt.beskrivelse}</BodyShort>,
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
