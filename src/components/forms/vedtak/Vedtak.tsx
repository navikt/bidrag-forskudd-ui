import { dateToDDMMYYYYString, RedirectTo } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Button, ConfirmationPanel, ErrorSummary, Heading, Table } from "@navikt/ds-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
    OpplysningerType,
    ResultatBeregningBarnDto,
    ResultatRolle,
    Rolletype,
    Vedtakstype,
} from "../../../api/BidragBehandlingApiV1";
import { BEHANDLING_API_V1 } from "../../../constants/api";
import elementId from "../../../constants/elementIds";
import elementIds from "../../../constants/elementIds";
import { STEPS } from "../../../constants/steps";
import text, { mapOpplysningtypeSomMåBekreftesTilFeilmelding } from "../../../constants/texts";
import texts from "../../../constants/texts";
import { useForskudd } from "../../../context/ForskuddContext";
import environment from "../../../environment";
import { QueryKeys, useGetBehandlingV2, useGetBeregningForskudd } from "../../../hooks/useApiData";
import useFeatureToogle from "../../../hooks/useFeatureToggle";
import { hentVisningsnavn, hentVisningsnavnVedtakstype } from "../../../hooks/useVisningsnavn";
import { VedtakBeregningResult } from "../../../types/vedtakTypes";
import { deductDays } from "../../../utils/date-utils";
import { formatterBeløp } from "../../../utils/number-utils";
import { FlexRow } from "../../layout/grid/FlexRow";
import NotatButton from "../../NotatButton";
import { QueryErrorWrapper } from "../../query-error-boundary/QueryErrorWrapper";
import { RolleTag } from "../../RolleTag";
import UnderArbeidAlert from "../../UnderArbeidAlert";

const Vedtak = () => {
    const { behandlingId, activeStep, lesemodus } = useForskudd();
    const { erVedtakFattet } = useGetBehandlingV2();
    const queryClient = useQueryClient();
    const beregnetForskudd = queryClient.getQueryData<VedtakBeregningResult>(QueryKeys.beregningForskudd());

    useEffect(() => {
        queryClient.refetchQueries({ queryKey: QueryKeys.behandlingV2(behandlingId) });
        queryClient.resetQueries({ queryKey: QueryKeys.beregningForskudd() });
    }, [activeStep]);

    return (
        <div className="grid gap-y-8">
            {erVedtakFattet && !lesemodus && <Alert variant="warning">Vedtak er fattet for behandling</Alert>}
            <div className="grid gap-y-2">
                <Heading level="2" size="medium">
                    {text.title.vedtak}
                </Heading>
            </div>
            <div className="grid gap-y-2">
                {!beregnetForskudd?.feil && (
                    <Heading level="3" size="small">
                        {text.title.oppsummering}
                    </Heading>
                )}

                <VedtakResultat />
            </div>

            {!beregnetForskudd?.feil && !lesemodus && <FatteVedtakButtons />}
            <AdminButtons />
        </div>
    );
};

function AdminButtons() {
    const { isAdminEnabled } = useFeatureToogle();
    const { behandlingId } = useForskudd();
    if (!isAdminEnabled) return null;

    return (
        <div className="border-t border-solid">
            <Button
                variant="tertiary-neutral"
                size="small"
                onClick={() =>
                    window.open(
                        `${window.location.origin}/admin/vedtak/explorer/?erBehandlingId=true&id=${behandlingId}&graftype=flowchart`
                    )
                }
            >
                Vis vedtaksgraf
            </Button>
        </div>
    );
}
class MåBekrefteOpplysningerStemmerError extends Error {
    constructor() {
        super("Bekreft at opplysningene stemmer");
    }
}
const FatteVedtakButtons = () => {
    const [bekreftetVedtak, setBekreftetVedtak] = useState(false);
    const { isFatteVedtakEnabled } = useFeatureToogle();
    const { behandlingId } = useForskudd();
    const { saksnummer } = useParams<{ saksnummer?: string }>();
    const queryClient = useQueryClient();
    const isBeregningError = queryClient.getQueryState(QueryKeys.beregningForskudd())?.status == "error";
    const fatteVedtakFn = useMutation({
        mutationFn: () => {
            if (!bekreftetVedtak) {
                throw new MåBekrefteOpplysningerStemmerError();
            }
            return BEHANDLING_API_V1.api.fatteVedtak(behandlingId);
        },
        onSuccess: () => {
            RedirectTo.sakshistorikk(saksnummer, environment.url.bisys);
        },
    });

    const måBekrefteAtOpplysningerStemmerFeil =
        fatteVedtakFn.isError && fatteVedtakFn.error instanceof MåBekrefteOpplysningerStemmerError;

    return (
        <div>
            <ConfirmationPanel
                className="pb-2"
                checked={bekreftetVedtak}
                label={text.varsel.bekreftFatteVedtak}
                onChange={() => {
                    setBekreftetVedtak((x) => !x);
                    fatteVedtakFn.reset();
                }}
                error={måBekrefteAtOpplysningerStemmerFeil ? "Du må bekrefte at opplysningene stemmer" : undefined}
            >
                <Heading spacing level="2" size="xsmall">
                    {text.title.sjekkNotatOgOpplysninger}
                </Heading>
                <div>
                    {text.varsel.vedtakNotat} <NotatButton />
                </div>
            </ConfirmationPanel>
            {fatteVedtakFn.isError && !måBekrefteAtOpplysningerStemmerFeil && (
                <Alert variant="error" className="mt-2 mb-2">
                    <Heading spacing size="small" level="3">
                        {text.error.kunneIkkFatteVedtak}
                    </Heading>
                    <BodyShort>{text.error.fatteVedtak}</BodyShort>
                </Alert>
            )}
            {fatteVedtakFn.isSuccess && (
                <Alert variant="success" size="small" className={"mt-2 mb-2"}>
                    <Heading size="small" level="3">
                        {text.title.vedtakFattet}
                    </Heading>
                    <BodyShort>{text.varsel.vedtakFattet}</BodyShort>
                </Alert>
            )}
            <FlexRow>
                <Button
                    loading={fatteVedtakFn.isPending}
                    disabled={isBeregningError || !isFatteVedtakEnabled || fatteVedtakFn.isSuccess}
                    onClick={() => fatteVedtakFn.mutate()}
                    className="w-max"
                    size="small"
                >
                    {text.label.fatteVedtakButton}
                </Button>
            </FlexRow>
        </div>
    );
};
const opplysningTilStep = (opplysninger: OpplysningerType) => {
    switch (opplysninger) {
        case OpplysningerType.SKATTEPLIKTIGE_INNTEKTER:
        case OpplysningerType.SMABARNSTILLEGG:
        case OpplysningerType.UTVIDET_BARNETRYGD:
        case OpplysningerType.BARNETILLEGG:
        case OpplysningerType.KONTANTSTOTTE:
            return STEPS.inntekt;
        case OpplysningerType.SIVILSTAND:
        case OpplysningerType.BOFORHOLD:
            return STEPS.boforhold;
    }
};
const opplysningTilElementId = (opplysninger: OpplysningerType) => {
    switch (opplysninger) {
        case OpplysningerType.SKATTEPLIKTIGE_INNTEKTER:
            return elementId.seksjon_inntekt_skattepliktig;
        case OpplysningerType.SMABARNSTILLEGG:
            return elementId.seksjon_inntekt_småbarnstillegg;
        case OpplysningerType.UTVIDET_BARNETRYGD:
            return elementId.seksjon_inntekt_utvidetbarnetrygd;
        case OpplysningerType.BARNETILLEGG:
            return elementId.seksjon_inntekt_barnetillegg;
        case OpplysningerType.KONTANTSTOTTE:
            return elementId.seksjon_inntekt_kontantstøtte;
        case OpplysningerType.BOFORHOLD:
            return elementId.seksjon_boforhold;
        case OpplysningerType.SIVILSTAND:
            return elementId.seksjon_sivilstand;
    }
};
const VedtakResultat = () => {
    const { data: beregnetForskudd } = useGetBeregningForskudd();
    const { onStepChange } = useForskudd();
    const {
        virkningstidspunkt: { avslag },
        vedtakstype,
    } = useGetBehandlingV2();
    function renderFeilmeldinger() {
        console.log(beregnetForskudd);
        if (!beregnetForskudd.feil?.detaljer) return null;
        const feilInnhold = beregnetForskudd.feil?.detaljer;
        const feilliste = [];
        if (feilInnhold.virkningstidspunkt != null) {
            const beskrivelse = feilInnhold.virkningstidspunkt.virkningstidspunktKanIkkeVæreSenereEnnOpprinnelig
                ? "Virkningstidspunkt kan ikke være senere enn opprinnelig virkningstidspunkt"
                : feilInnhold.virkningstidspunkt.manglerVirkningstidspunkt
                  ? "Mangler virkningstidspunkt"
                  : feilInnhold.virkningstidspunkt.manglerÅrsakEllerAvslag
                    ? "Virkningstidspunkt: Mangler årsak"
                    : "Virkningstidspunkt";
            feilliste.push(
                <ErrorSummary.Item href="#" onClick={() => onStepChange(STEPS.virkningstidspunkt)}>
                    {beskrivelse}
                </ErrorSummary.Item>
            );
        }
        if (feilInnhold.husstandsbarn != null) {
            feilInnhold.husstandsbarn.forEach((value) =>
                feilliste.push(
                    <ErrorSummary.Item
                        href={`#${elementIds.seksjon_boforhold}_${value.barn.tekniskId}`}
                        onClick={() => onStepChange(STEPS.boforhold)}
                    >
                        Boforhold: Perioder for barn {value.barn.navn}
                    </ErrorSummary.Item>
                )
            );
        }
        if (feilInnhold.sivilstand != null) {
            feilliste.push(
                <ErrorSummary.Item
                    href={`#${elementIds.seksjon_sivilstand}`}
                    onClick={() => onStepChange(STEPS.boforhold)}
                >
                    Sivilstand
                </ErrorSummary.Item>
            );
        }
        if (feilInnhold.inntekter != null) {
            feilInnhold.inntekter.årsinntekter &&
                feilliste.push(
                    <ErrorSummary.Item
                        href={`#${elementId.seksjon_inntekt_skattepliktig}`}
                        onClick={() => onStepChange(STEPS.inntekt)}
                    >
                        Inntekter: Perioder i {texts.title.skattepliktigeogPensjonsgivendeInntekt.toLowerCase()}
                    </ErrorSummary.Item>
                );
            feilInnhold.inntekter.barnetillegg &&
                feilliste.push(
                    <ErrorSummary.Item
                        href={`#${elementId.seksjon_inntekt_barnetillegg}`}
                        onClick={() => onStepChange(STEPS.inntekt)}
                    >
                        Inntekter: Perioder i {texts.title.barnetillegg.toLowerCase()}
                    </ErrorSummary.Item>
                );
            feilInnhold.inntekter.kontantstøtte &&
                feilliste.push(
                    <ErrorSummary.Item
                        href={`#${elementId.seksjon_inntekt_kontantstøtte}`}
                        onClick={() => onStepChange(STEPS.inntekt)}
                    >
                        Inntekter: Perioder i {texts.title.kontantstøtte.toLowerCase()}
                    </ErrorSummary.Item>
                );
            feilInnhold.inntekter.utvidetBarnetrygd &&
                feilliste.push(
                    <ErrorSummary.Item
                        href={`#${elementId.seksjon_inntekt_utvidetbarnetrygd}`}
                        onClick={() => onStepChange(STEPS.inntekt)}
                    >
                        Inntekter: Perioder i {texts.title.utvidetBarnetrygd.toLowerCase()}
                    </ErrorSummary.Item>
                );
            feilInnhold.inntekter.småbarnstillegg &&
                feilliste.push(
                    <ErrorSummary.Item
                        href={`#${elementId.seksjon_inntekt_småbarnstillegg}`}
                        onClick={() => onStepChange(STEPS.inntekt)}
                    >
                        Inntekter: Perioder i {texts.title.småbarnstillegg.toLowerCase()}
                    </ErrorSummary.Item>
                );
        }
        feilInnhold.måBekrefteNyeOpplysninger?.forEach((value) => {
            feilliste.push(
                <ErrorSummary.Item
                    href={`#${opplysningTilElementId(value)}`}
                    onClick={() => onStepChange(opplysningTilStep(value))}
                >
                    {mapOpplysningtypeSomMåBekreftesTilFeilmelding(value)}
                </ErrorSummary.Item>
            );
        });
        return feilliste;
    }
    if (beregnetForskudd.feil) {
        if (!beregnetForskudd.feil?.detaljer) {
            return (
                <Alert variant={"error"} size="small">
                    <Heading spacing size="small" level="3">
                        {text.error.ukjentfeil}
                    </Heading>
                    <BodyShort>{text.error.beregning}</BodyShort>
                </Alert>
            );
        }
        return (
            <ErrorSummary heading={text.varsel.beregneFeil} size="small">
                {renderFeilmeldinger().map((Component) => Component)}
            </ErrorSummary>
        );
    }

    const erAvslag = avslag != null;
    return (
        <>
            {beregnetForskudd.resultat?.map((r, i) => (
                <div key={i + r.barn.ident + r.barn.navn} className="mb-8">
                    <VedtakResultatBarn barn={r.barn} />
                    <Table>
                        <VedtakTableHeader avslag={erAvslag} />
                        <VedtakTableBody
                            resultatBarn={r}
                            avslag={erAvslag}
                            opphør={vedtakstype == Vedtakstype.OPPHOR}
                        />
                    </Table>
                </div>
            ))}
        </>
    );
};

const VedtakTableBody = ({
    resultatBarn,
    avslag,
    opphør,
}: {
    resultatBarn: ResultatBeregningBarnDto;
    avslag: boolean;
    opphør: boolean;
}) => {
    const { vedtakstype } = useGetBehandlingV2();

    return (
        <Table.Body>
            {resultatBarn.perioder.map((periode) => (
                <>
                    {avslag ? (
                        <Table.Row>
                            <Table.DataCell textSize="small">
                                {dateToDDMMYYYYString(new Date(periode.periode.fom))} -{" "}
                                {periode.periode.til
                                    ? dateToDDMMYYYYString(deductDays(new Date(periode.periode.til), 1))
                                    : ""}
                            </Table.DataCell>
                            <Table.DataCell textSize="small">
                                {opphør ? text.label.opphør : text.label.avslag}
                            </Table.DataCell>
                            <Table.DataCell textSize="small">
                                {hentVisningsnavnVedtakstype(periode.resultatKode, vedtakstype)}
                            </Table.DataCell>
                        </Table.Row>
                    ) : (
                        <Table.Row>
                            <Table.DataCell textSize="small">
                                {dateToDDMMYYYYString(new Date(periode.periode.fom))} -{" "}
                                {periode.periode.til
                                    ? dateToDDMMYYYYString(deductDays(new Date(periode.periode.til), 1))
                                    : ""}
                            </Table.DataCell>

                            <Table.DataCell textSize="small">{formatterBeløp(periode.inntekt)}</Table.DataCell>

                            <Table.DataCell textSize="small">{hentVisningsnavn(periode.sivilstand)}</Table.DataCell>

                            <Table.DataCell textSize="small">{periode.antallBarnIHusstanden}</Table.DataCell>
                            <Table.DataCell textSize="small">{formatterBeløp(periode.beløp)}</Table.DataCell>
                            <Table.DataCell textSize="small">
                                {hentVisningsnavnVedtakstype(periode.resultatKode, vedtakstype)}
                            </Table.DataCell>
                        </Table.Row>
                    )}
                </>
            ))}
        </Table.Body>
    );
};

const VedtakResultatBarn = ({ barn }: { barn: ResultatRolle }) => (
    <div className="my-4 flex items-center gap-x-2">
        <RolleTag rolleType={Rolletype.BA} />
        <BodyShort>
            {barn.navn} / <span className="ml-1">{barn.ident}</span>
        </BodyShort>
    </div>
);
const VedtakTableHeader = ({ avslag = false }: { avslag: boolean }) => (
    <Table.Header>
        {avslag ? (
            <Table.Row>
                <Table.HeaderCell textSize="small" scope="col">
                    {text.label.periode}
                </Table.HeaderCell>
                <Table.HeaderCell textSize="small" scope="col">
                    {text.label.resultat}
                </Table.HeaderCell>
                <Table.HeaderCell textSize="small" scope="col">
                    {text.label.årsak}
                </Table.HeaderCell>
            </Table.Row>
        ) : (
            <Table.Row>
                <Table.HeaderCell textSize="small" scope="col" style={{ width: "200px" }}>
                    {text.label.periode}
                </Table.HeaderCell>
                <Table.HeaderCell textSize="small" scope="col" style={{ width: "150px" }}>
                    {text.label.inntekt}
                </Table.HeaderCell>
                <Table.HeaderCell textSize="small" scope="col" style={{ width: "200px" }}>
                    {text.label.sivilstandBM}
                </Table.HeaderCell>
                <Table.HeaderCell textSize="small" scope="col" style={{ width: "150px" }}>
                    {text.label.antallBarn}
                </Table.HeaderCell>
                <Table.HeaderCell textSize="small" scope="col" style={{ width: "100px" }}>
                    {text.label.forskudd}
                </Table.HeaderCell>
                <Table.HeaderCell textSize="small" scope="col" style={{ width: "250px" }}>
                    {text.label.resultat}
                </Table.HeaderCell>
            </Table.Row>
        )}
    </Table.Header>
);
export default () => {
    const { isVedtakSkjermbildeEnabled } = useFeatureToogle();

    if (!isVedtakSkjermbildeEnabled) {
        return <UnderArbeidAlert />;
    }
    return (
        <QueryErrorWrapper>
            <Vedtak />
        </QueryErrorWrapper>
    );
};
