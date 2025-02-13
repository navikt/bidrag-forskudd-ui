import { FormControlledMonthPicker } from "@common/components/formFields/FormControlledMonthPicker";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { getFomAndTomForMonthPicker } from "@common/helpers/virkningstidspunktHelpers";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { useVirkningsdato } from "@common/hooks/useVirkningsdato";
import { ObjectUtils } from "@navikt/bidrag-ui-common";
import { addMonthsIgnoreDay, dateOrNull, DateToDDMMYYYYString, isAfterDate } from "@utils/date-utils";
import React from "react";
import { useFormContext } from "react-hook-form";

import { SamværBarnformvalues, SamværPeriodeFormvalues } from "../../../../common/types/samværFormValues";

export const Samværsperiode = ({
    editableRow,
    item,
    field,
    fieldName,
    label,
}: {
    editableRow: boolean;
    item: SamværPeriodeFormvalues;
    fieldName: `${string}.perioder.${number}`;
    field: "fom" | "tom";
    label: string;
}) => {
    const virkningsOrSoktFraDato = useVirkningsdato();
    const {
        virkningstidspunkt: {
            opphør: { opphørsdato },
        },
    } = useGetBehandlingV2();
    const { erVirkningstidspunktNåværendeMånedEllerFramITid } = useBehandlingProvider();
    const { getValues, clearErrors, setError } = useFormContext<SamværBarnformvalues>();
    const opphørsTomDato = opphørsdato ? new Date(opphørsdato) : undefined;
    const [fom, tom] = getFomAndTomForMonthPicker(virkningsOrSoktFraDato, opphørsTomDato);
    const fieldIsDatoTom = field === "tom";

    const validateFomOgTom = () => {
        const periode = getValues(fieldName);
        const fomOgTomInvalid = !ObjectUtils.isEmpty(periode.tom) && isAfterDate(periode?.fom, periode.tom);

        if (fomOgTomInvalid) {
            setError(`${fieldName}.fom`, {
                type: "notValid",
                message: text.error.tomDatoKanIkkeVæreFørFomDato,
            });
        } else {
            clearErrors(`${fieldName}.tom`);
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
