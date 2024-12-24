import { BostatusperiodeDto, HusstandsmedlemDtoV2 } from "@api/BidragBehandlingApiV1";
import { FormControlledMonthPicker } from "@common/components/formFields/FormControlledMonthPicker";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { getEitherFirstDayOfFoedselsOrVirkingsdatoMonth } from "@common/helpers/virkningstidspunktHelpers";
import { getFomAndTomForMonthPicker } from "@common/helpers/virkningstidspunktHelpers";
import { useVirkningsdato } from "@common/hooks/useVirkningsdato";
import { ObjectUtils } from "@navikt/bidrag-ui-common";
import { addMonthsIgnoreDay, dateOrNull, DateToDDMMYYYYString, isAfterDate } from "@utils/date-utils";
import React from "react";
import { useFormContext } from "react-hook-form";

import { BoforholdFormValues } from "../../types/boforholdFormValues";

export const Periode = ({
    editableRow,
    item,
    field,
    fieldName,
    barn,
    label,
}: {
    editableRow: boolean;
    item: BostatusperiodeDto;
    fieldName: `husstandsbarn.${number}.perioder.${number}`;
    field: "datoFom" | "datoTom";
    barn: HusstandsmedlemDtoV2;
    label: string;
}) => {
    const virkningsOrSoktFraDato = useVirkningsdato();
    const { erVirkningstidspunktNåværendeMånedEllerFramITid } = useBehandlingProvider();
    const { getValues, clearErrors, setError } = useFormContext<BoforholdFormValues>();
    const datoFra = getEitherFirstDayOfFoedselsOrVirkingsdatoMonth(barn.fødselsdato, virkningsOrSoktFraDato);
    const [fom, tom] = getFomAndTomForMonthPicker(datoFra);
    const fieldIsDatoTom = field === "datoTom";

    const validateFomOgTom = () => {
        const periode = getValues(fieldName);
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

    return editableRow && !erVirkningstidspunktNåværendeMånedEllerFramITid ? (
        <FormControlledMonthPicker
            name={`${fieldName}.${field}`}
            label={label}
            placeholder="DD.MM.ÅÅÅÅ"
            defaultValue={item[field]}
            customValidation={validateFomOgTom}
            fromDate={fom}
            toDate={fieldIsDatoTom ? tom : addMonthsIgnoreDay(tom, 1)}
            lastDayOfMonthPicker={fieldIsDatoTom}
            required={!fieldIsDatoTom}
            hideLabel
        />
    ) : (
        <div className="h-8 flex items-center">{item[field] && DateToDDMMYYYYString(dateOrNull(item[field]))}</div>
    );
};
