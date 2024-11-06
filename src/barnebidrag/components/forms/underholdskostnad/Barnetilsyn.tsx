import { FormControlledMonthPicker } from "@common/components/formFields/FormControlledMonthPicker";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { getFomAndTomForMonthPicker } from "@common/helpers/virkningstidspunktHelpers";
import { useVirkningsdato } from "@common/hooks/useVirkningsdato";
import { FloppydiskIcon, PencilIcon } from "@navikt/aksel-icons";
import { ObjectUtils } from "@navikt/bidrag-ui-common";
import { Button, Heading, Switch } from "@navikt/ds-react";
import { addMonthsIgnoreDay, dateOrNull, DateToDDMMYYYYString, isAfterDate } from "@utils/date-utils";
import React, { useState } from "react";
import { useFormContext } from "react-hook-form";

import { UnderholdkostnadsFormPeriode, UnderholdskostnadFormValues } from "../../../types/underholdskostnadFormValues";
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

export const UnderholdskostnadPeriode = ({
    fieldName,
    field,
    label,
    item,
}: {
    fieldName:
        | `underholdskostnader.${number}.stønadTilBarnetilsyn.${number}`
        | `underholdskostnader.${number}.faktiskeTilsynsutgifter.${number}`
        | `underholdskostnader.${number}.tilleggsstønad.${number}`;
    label: string;
    field: "datoFom" | "datoTom";
    item: UnderholdkostnadsFormPeriode;
}) => {
    const virkningsdato = useVirkningsdato();
    const [fom, tom] = getFomAndTomForMonthPicker(virkningsdato);
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
            toDate={fieldIsDatoTom ? tom : addMonthsIgnoreDay(tom, 1)}
            lastDayOfMonthPicker={fieldIsDatoTom}
            required={!fieldIsDatoTom}
            hideLabel
        />
    ) : (
        <div className="h-8 flex items-center">{item[field] && DateToDDMMYYYYString(dateOrNull(item[field]))}</div>
    );
};

export const Barnetilsyn = ({ index }: { index: number }) => {
    const [barnHarTilysnsordning, setBarnHarTilysnsordning] = useState<boolean>(false);

    return (
        <>
            <Heading level="2" size="small">
                {text.title.barneTilsyn}
            </Heading>
            <Switch
                value="barnHarTilysnsordning"
                checked={barnHarTilysnsordning}
                onChange={(e) => setBarnHarTilysnsordning(e.target.checked)}
                size="small"
            >
                {text.label.barnHarTilysnsordning}
            </Switch>
            <BarnetilsynTabel underholdIndex={index} />
            <FaktiskeTilsynsutgifterTabel underholdIndex={index} />
            <TilleggstønadTabel underholdIndex={index} />
            <BeregnetUnderholdskostnad underholdIndex={index} />
        </>
    );
};
