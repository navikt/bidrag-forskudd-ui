import { Kilde } from "@api/BidragBehandlingApiV1";
import { Rolletype } from "@api/BidragDokumentProduksjonApi";
import { BehandlingAlert } from "@common/components/BehandlingAlert";
import { FormControlledMonthPicker } from "@common/components/formFields/FormControlledMonthPicker";
import { ConfirmationModal } from "@common/components/modal/ConfirmationModal";
import { RolleTag } from "@common/components/RolleTag";
import StatefulAlert from "@common/components/StatefulAlert";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import {
    getEitherFirstDayOfFoedselsOrVirkingsdatoMonth,
    getFomAndTomForMonthPicker,
} from "@common/helpers/virkningstidspunktHelpers";
import { useGetBehandlingV2, useGetOpplysningerBarnetilsyn } from "@common/hooks/useApiData";
import { useVirkningsdato } from "@common/hooks/useVirkningsdato";
import { FloppydiskIcon, PencilIcon, TrashIcon } from "@navikt/aksel-icons";
import { ObjectUtils } from "@navikt/bidrag-ui-common";
import { BodyShort, Button, Heading, Switch } from "@navikt/ds-react";
import { addMonthsIgnoreDay, calculateAge, dateOrNull, DateToDDMMYYYYString, isAfterDate } from "@utils/date-utils";
import React, { ChangeEvent, useRef } from "react";
import { useFormContext } from "react-hook-form";

import PersonNavnIdent from "../../../../common/components/PersonNavnIdent";
import { useOnUpdateHarTilysnsordning } from "../../../hooks/useOnUpdateHarTilysnsordning";
import {
    Underhold,
    UnderholdkostnadsFormPeriode,
    UnderholdskostnadFormValues,
} from "../../../types/underholdskostnadFormValues";
import { displayOver12Alert } from "../helpers/UnderholdskostnadFormHelpers";
import { BarnetilsynTabel } from "./BarnetilsynTabel";
import { BeregnetUnderholdskostnad } from "./BeregnetUnderholdskostnad";
import { FaktiskeTilsynsutgifterTabel } from "./FaktiskeTilsynsutgifterTabel";
import { TilleggstønadTabel } from "./TilleggstønadTabel";

export const EditOrSaveButton = ({
    index,
    item,
    onEditRow,
    onSaveRow,
}: {
    item: UnderholdkostnadsFormPeriode;
    index: number;
    onEditRow: (index: number) => void;
    onSaveRow: (index: number) => void;
}) => {
    const { lesemodus } = useBehandlingProvider();

    if (item.kanRedigeres === false) return null;
    return (
        <div className="h-8 flex items-center justify-center">
            {!lesemodus && !item.erRedigerbart && (
                <Button
                    type="button"
                    onClick={() => onEditRow(index)}
                    icon={<PencilIcon aria-hidden />}
                    variant="tertiary"
                    size="small"
                />
            )}
            {!lesemodus && item.erRedigerbart && (
                <Button
                    type="button"
                    onClick={() => onSaveRow(index)}
                    icon={<FloppydiskIcon aria-hidden />}
                    variant="tertiary"
                    size="small"
                />
            )}
        </div>
    );
};

export const DeleteButton = ({ onDelete }: { onDelete: () => void }) => {
    const { lesemodus } = useBehandlingProvider();

    return !lesemodus ? (
        <Button type="button" onClick={onDelete} icon={<TrashIcon aria-hidden />} variant="tertiary" size="small" />
    ) : (
        <div className="min-w-[40px]"></div>
    );
};

export const UnderholdskostnadPeriode = ({
    fieldName,
    field,
    label,
    item,
    underhold,
}: {
    fieldName:
        | `underholdskostnaderMedIBehandling.${number}.stønadTilBarnetilsyn.${number}`
        | `underholdskostnaderMedIBehandling.${number}.faktiskTilsynsutgift.${number}`
        | `underholdskostnaderMedIBehandling.${number}.tilleggsstønad.${number}`
        | `underholdskostnaderAndreBarn.${number}.faktiskTilsynsutgift.${number}`;
    label: string;
    field: "datoFom" | "datoTom";
    item: UnderholdkostnadsFormPeriode;
    underhold: Underhold;
}) => {
    const virkningsdato = useVirkningsdato();
    const {
        virkningstidspunkt: {
            opphør: { opphørsdato },
        },
    } = useGetBehandlingV2();
    const datoFra = getEitherFirstDayOfFoedselsOrVirkingsdatoMonth(underhold.gjelderBarn.fødselsdato, virkningsdato);
    const opphørsTomDato = opphørsdato ? new Date(opphørsdato) : undefined;
    const [fom, tom] = getFomAndTomForMonthPicker(datoFra, opphørsTomDato);
    const { getValues, clearErrors, setError } = useFormContext<UnderholdskostnadFormValues>();
    const fieldIsDatoTom = field === "datoTom";
    const { erVirkningstidspunktNåværendeMånedEllerFramITid } = useBehandlingProvider();

    const validateFomOgTom = () => {
        const periode = getValues(`${fieldName}`);
        const fomOgTomInvalid = !ObjectUtils.isEmpty(periode.datoTom) && isAfterDate(periode?.datoFom, periode.datoTom);

        if (fomOgTomInvalid) {
            setError(`${fieldName}.datoFom`, {
                type: "notValid",
                message: text.error.tomDatoKanIkkeVæreFørFomDato,
            });
        } else {
            clearErrors(`${fieldName}.datoFom`);
        }
    };

    return item.erRedigerbart && !erVirkningstidspunktNåværendeMånedEllerFramITid && item.kanRedigeres ? (
        <FormControlledMonthPicker
            name={`${fieldName}.${field}`}
            label={label}
            placeholder="DD.MM.ÅÅÅÅ"
            defaultValue={item[field]}
            fromDate={fom}
            customValidation={validateFomOgTom}
            toDate={fieldIsDatoTom || opphørsTomDato ? tom : addMonthsIgnoreDay(tom, 1)}
            lastDayOfMonthPicker={fieldIsDatoTom}
            required={!fieldIsDatoTom}
            hideLabel
        />
    ) : (
        <div className="h-8 flex items-center">
            {item[field] && <BodyShort size="small">{DateToDDMMYYYYString(dateOrNull(item[field]))}</BodyShort>}
        </div>
    );
};

export const RolleInfoBox = ({
    underholdFieldName,
    onDelete,
}: {
    underholdFieldName: `underholdskostnaderMedIBehandling.${number}` | `underholdskostnaderAndreBarn.${number}`;
    onDelete?: () => void;
}) => {
    const ref = useRef<HTMLDialogElement>(null);
    const { getValues } = useFormContext<UnderholdskostnadFormValues>();
    const underhold = getValues(underholdFieldName);

    const onConfirm = () => {
        ref.current?.close();
        onDelete();
    };

    return (
        underhold && (
            <>
                <div className="grid grid-cols-[max-content,auto] items-center p-2 bg-white border border-solid border-[var(--a-border-default)]">
                    <div className="flex">
                        {underhold.gjelderBarn.medIBehandlingen && <RolleTag rolleType={Rolletype.BA} />}
                        <PersonNavnIdent
                            ident={underhold.gjelderBarn.ident}
                            navn={underhold.gjelderBarn.navn}
                            fødselsdato={underhold.gjelderBarn.fødselsdato}
                        />
                    </div>
                    {!underhold.gjelderBarn.medIBehandlingen &&
                        underhold.gjelderBarn.kilde &&
                        underhold.gjelderBarn.kilde === Kilde.MANUELL && (
                            <>
                                <div className="flex items-center justify-end">
                                    <DeleteButton onDelete={() => ref.current?.showModal()} />
                                </div>
                                <ConfirmationModal
                                    ref={ref}
                                    closeable
                                    description={text.varsel.ønskerDuÅSletteBarnet}
                                    heading={<Heading size="small">{text.varsel.ønskerDuÅSlette}</Heading>}
                                    footer={
                                        <>
                                            <Button type="button" onClick={onConfirm} size="small">
                                                {text.label.jaSlett}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="small"
                                                onClick={() => ref.current?.close()}
                                            >
                                                {text.label.avbryt}
                                            </Button>
                                        </>
                                    }
                                />
                            </>
                        )}
                </div>
            </>
        )
    );
};

export const Barnetilsyn = ({ index }: { index: number }) => {
    const { setSaveErrorState } = useBehandlingProvider();
    const { aktiveOpplysninger } = useGetOpplysningerBarnetilsyn();
    const { underholdskostnader } = useGetBehandlingV2();
    const underholdFieldName = `underholdskostnaderMedIBehandling.${index}` as const;
    const { getValues, setValue } = useFormContext<UnderholdskostnadFormValues>();
    const underhold = getValues(underholdFieldName);
    const aktivePerioder = aktiveOpplysninger?.grunnlag[underhold.gjelderBarn.ident] ?? [];
    const hasAtLeastOnePeriod =
        !!underhold.stønadTilBarnetilsyn.length ||
        !!underhold.faktiskTilsynsutgift.length ||
        !!underhold.tilleggsstønad.length;
    const hasAtLeastOnePeriodOrActiveOpplysninger = hasAtLeastOnePeriod || !!aktivePerioder.length;
    const updateTilysnsordning = useOnUpdateHarTilysnsordning(underhold.id);
    const underholdsValideringsFeil = underholdskostnader.find((u) => u.id === underhold.id).valideringsfeil;

    const update = (checked: boolean) => {
        updateTilysnsordning.mutation.mutate(
            { harTilsynsordning: checked },
            {
                onSuccess: () => {
                    updateTilysnsordning.queryClientUpdater((currentData) => {
                        const updatedUnderholdIndex = currentData.underholdskostnader.findIndex(
                            (u) => u.id === underhold.id
                        );
                        return {
                            ...currentData,
                            underholdskostnader: currentData.underholdskostnader.toSpliced(
                                Number(updatedUnderholdIndex),
                                1,
                                {
                                    ...currentData.underholdskostnader[updatedUnderholdIndex],
                                    harTilsynsordning: checked,
                                }
                            ),
                        };
                    });
                },
                onError: () => {
                    setSaveErrorState({
                        error: true,
                        retryFn: () => update(checked),
                        rollbackFn: () => setValue(underholdFieldName, { ...underhold, harTilsynsordning: !checked }),
                    });
                },
            }
        );
    };
    const onToggle = (e: ChangeEvent<HTMLInputElement>) => {
        setValue(underholdFieldName, { ...underhold, harTilsynsordning: e.target.checked });
        update(e.target.checked);
    };

    return (
        <>
            <Switch
                value="barnHarTilysnsordning"
                checked={underhold.harTilsynsordning || hasAtLeastOnePeriodOrActiveOpplysninger}
                onChange={onToggle}
                size="small"
                readOnly={hasAtLeastOnePeriodOrActiveOpplysninger}
            >
                {text.label.barnHarTilsysnsordning}
            </Switch>
            {underhold.harTilsynsordning && underholdsValideringsFeil?.manglerPerioderForTilsynsordning && (
                <BehandlingAlert variant="warning">
                    <Heading size="xsmall" level="6">
                        {text.alert.manglerPerioderForTilsynsordning}
                    </Heading>
                    <BodyShort size="small">{text.alert.manglerPerioderForTilsynsordningDescription}</BodyShort>
                </BehandlingAlert>
            )}
            {(underhold.harTilsynsordning || hasAtLeastOnePeriod) && (
                <>
                    {displayOver12Alert(calculateAge(underhold.gjelderBarn.fødselsdato)) && (
                        <StatefulAlert
                            variant="info"
                            size="small"
                            alertKey={`12åralert-underhold-${underhold.id}`}
                            className="w-[708px]"
                            closeButton
                        >
                            <Heading size="small" level="3">
                                {text.title.barnOver12}
                            </Heading>
                            {text.barnetHarFylt12SjekkPerioder}
                        </StatefulAlert>
                    )}
                    <BarnetilsynTabel underholdFieldName={underholdFieldName} />
                    <FaktiskeTilsynsutgifterTabel underholdFieldName={underholdFieldName} />
                    <TilleggstønadTabel underholdFieldName={underholdFieldName} />
                </>
            )}
            <BeregnetUnderholdskostnad underholdFieldName={underholdFieldName} />
        </>
    );
};
