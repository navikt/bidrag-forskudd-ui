import { Buldings2Icon, FloppydiskIcon, PencilIcon, PersonIcon } from "@navikt/aksel-icons";
import { ObjectUtils } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Button, Heading } from "@navikt/ds-react";
import React, { useEffect, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { InntektDtoV2, Kilde, OppdatereInntektRequest, OpplysningerType } from "../../../api/BidragBehandlingApiV1";
import text from "../../../constants/texts";
import { useForskudd } from "../../../context/ForskuddContext";
import { useGetBehandlingV2 } from "../../../hooks/useApiData";
import { useOnSaveInntekt } from "../../../hooks/useOnSaveInntekt";
import { useVirkningsdato } from "../../../hooks/useVirkningsdato";
import { InntektFormPeriode, InntektFormValues } from "../../../types/inntektFormValues";
import { dateOrNull, DateToDDMMYYYYString, isAfterDate } from "../../../utils/date-utils";
import { removePlaceholder } from "../../../utils/string-utils";
import { FormControlledCheckbox } from "../../formFields/FormControlledCheckbox";
import { FormControlledMonthPicker } from "../../formFields/FormControlledMonthPicker";
import { FormControlledTextField } from "../../formFields/FormControlledTextField";
import { checkErrorsInPeriods, createPayload, transformInntekt } from "../helpers/inntektFormHelpers";
import { getFomAndTomForMonthPicker } from "../helpers/virkningstidspunktHelpers";

export const KildeIcon = ({ kilde }: { kilde: Kilde }) => {
    return (
        <div className="h-8 w-full flex items-center justify-center">
            {kilde === Kilde.OFFENTLIG ? (
                <Buldings2Icon title="a11y-title" fontSize="1.5rem" />
            ) : (
                <PersonIcon title="a11y-title" fontSize="1.5rem" />
            )}
        </div>
    );
};

export const TaMed = ({
    fieldName,
    handleOnSelect,
    index,
}: {
    fieldName: string;
    handleOnSelect: (checked: boolean, index: number) => void;
    index: number;
}) => (
    <div className="h-8 w-full flex items-center justify-center">
        <FormControlledCheckbox
            name={`${fieldName}.${index}.taMed`}
            onChange={(checked) => handleOnSelect(checked, index)}
            legend=""
        />
    </div>
);

export const Totalt = ({
    item,
    field,
    erRedigerbart,
}: {
    item: InntektFormPeriode;
    field: string;
    erRedigerbart: boolean;
}) => (
    <>
        {erRedigerbart ? (
            <FormControlledTextField
                name={`${field}.beløp`}
                label="Totalt"
                type="number"
                min="1"
                inputMode="numeric"
                hideLabel
            />
        ) : (
            <div className="h-8 flex items-center justify-end">
                <BodyShort>{item.beløp.toLocaleString("nb-NO")}</BodyShort>
            </div>
        )}
    </>
);

export const EditOrSaveButton = ({ erMed, index, editableRow, onEditRow, onSaveRow }) => {
    const { lesemodus } = useForskudd();

    return (
        <div className="h-8 flex items-center justify-center">
            {!lesemodus && erMed && editableRow !== index && (
                <Button
                    type="button"
                    onClick={() => onEditRow(index)}
                    icon={<PencilIcon aria-hidden />}
                    variant="tertiary"
                    size="small"
                />
            )}
            {!lesemodus && editableRow === index && (
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

export const Periode = ({
    index,
    editableRow,
    fieldName,
    field,
    label,
    item,
}: {
    index: number;
    editableRow: number;
    fieldName:
        | "småbarnstillegg"
        | "utvidetBarnetrygd"
        | `årsinntekter.${string}`
        | `barnetillegg.${string}`
        | `kontantstøtte.${string}`;
    label: string;
    field: "datoFom" | "datoTom";
    item: InntektFormPeriode;
}) => {
    const virkningsdato = useVirkningsdato();
    const [fom, tom] = getFomAndTomForMonthPicker(virkningsdato);
    const { getValues, clearErrors, setError } = useFormContext<InntektFormValues>();
    const validateFomOgTom = () => {
        const periode = getValues(`${fieldName}.${index}`);
        const fomOgTomInvalid = !ObjectUtils.isEmpty(periode.datoTom) && isAfterDate(periode?.datoFom, periode.datoTom);

        if (fomOgTomInvalid) {
            setError(`${fieldName}.${index}.datoFom`, {
                type: "notValid",
                message: text.error.tomDatoKanIkkeVæreFørFomDato,
            });
        } else {
            clearErrors(`${fieldName}.${index}.datoFom`);
        }
    };

    return editableRow === index ? (
        <FormControlledMonthPicker
            name={`${fieldName}.${index}.${field}`}
            label={label}
            placeholder="DD.MM.ÅÅÅÅ"
            defaultValue={item[field]}
            required={item.taMed && field === "datoFom"}
            fromDate={fom}
            toDate={tom}
            customValidation={validateFomOgTom}
            lastDayOfMonthPicker={field === "datoTom"}
            hideLabel
        />
    ) : (
        <div className="h-8 flex items-center">
            <BodyShort>{item.taMed && item[field] && DateToDDMMYYYYString(dateOrNull(item[field]))}</BodyShort>
        </div>
    );
};

const OpplysningerTypeInntektTabelMapper = {
    [OpplysningerType.SMABARNSTILLEGG]: "småbarnstillegg",
    [OpplysningerType.UTVIDET_BARNETRYGD]: "utvidetBarnetrygd",
    [OpplysningerType.SKATTEPLIKTIGE_INNTEKTER]: "årsinntekter",
    [OpplysningerType.BARNETILLEGG]: "barnetillegg",
    [OpplysningerType.KONTANTSTOTTE]: "kontantstøtte",
};

export const InntektTabel = ({
    fieldName,
    customRowValidation,
    children,
}: {
    fieldName:
        | "småbarnstillegg"
        | "utvidetBarnetrygd"
        | `årsinntekter.${string}`
        | `barnetillegg.${string}`
        | `kontantstøtte.${string}`;
    customRowValidation?: (fieldName: string) => void;
    children: React.FunctionComponent;
}) => {
    const { setErrorMessage, setErrorModalOpen, lesemodus } = useForskudd();
    const { ikkeAktiverteEndringerIGrunnlagsdata } = useGetBehandlingV2();
    const virkningsdato = useVirkningsdato();
    const [editableRow, setEditableRow] = useState<number>(undefined);
    const [{ overlappingPeriodsSummary, overlappingPeriodIndexes, gapsInPeriods, runningPeriod }, setTableErros] =
        useState<{
            overlappingPeriodIndexes: number[];
            gapsInPeriods: { datoFom: string; datoTom: string }[];
            overlappingPeriodsSummary: { datoFom: string; datoTom: string }[];
            runningPeriod: boolean;
        }>({
            overlappingPeriodsSummary: [],
            gapsInPeriods: [],
            overlappingPeriodIndexes: [],
            runningPeriod: true,
        });
    const saveInntekt = useOnSaveInntekt();
    const { control, getFieldState, getValues, clearErrors, setError, setValue } = useFormContext<InntektFormValues>();
    const fieldArray = useFieldArray({
        control,
        name: fieldName,
    });
    const watchFieldArray = useWatch({ control, name: fieldName });

    useEffect(() => {
        validatePeriods();
    }, []);

    const validatePeriods = () => {
        const perioder = getValues(fieldName);
        const tableErros = checkErrorsInPeriods(virkningsdato, perioder);
        setTableErros(tableErros);
    };

    const unsetEditedRow = (index: number) => {
        if (editableRow === index) {
            setEditableRow(undefined);
        }
    };

    const handleOnSelect = (value: boolean, index: number) => {
        const periode = getValues(`${fieldName}.${index}`);
        const erOffentlig = periode.kilde === Kilde.OFFENTLIG;

        if (!value && !erOffentlig) {
            handleDelete(index);
        } else {
            handleUpdate(index);
        }
    };

    const handleUpdate = (index: number) => {
        const periode = getValues(`${fieldName}.${index}`);
        const payload = createPayload(periode, virkningsdato);
        const transformFn = transformInntekt(virkningsdato);
        updatedAndSave(payload, (data: InntektDtoV2) => setValue(`${fieldName}.${index}`, transformFn(data)));
        unsetEditedRow(index);
    };

    const handleDelete = (index: number) => {
        const periode = getValues(`${fieldName}.${index}`);
        clearErrors(`${fieldName}.${index}`);
        updatedAndSave({ sletteInntekt: periode.id });
        fieldArray.remove(index);

        if (editableRow === index) {
            setEditableRow(undefined);
        } else if (editableRow) {
            setEditableRow(editableRow - 1);
        }
    };

    const addPeriod = (periode: InntektFormPeriode) => {
        if (checkIfAnotherRowIsEdited()) {
            showErrorModal();
        } else {
            const perioder = getValues(fieldName);
            fieldArray.append(periode);
            setEditableRow(perioder.length);
        }
    };
    const updatedAndSave = (updatedValues: OppdatereInntektRequest, onSaveSuccess?: (data: InntektDtoV2) => void) => {
        saveInntekt.mutate(updatedValues, {
            onSuccess: (response) => onSaveSuccess?.(response?.inntekt),
        });
        validatePeriods();
    };
    const onSaveRow = (index: number) => {
        const periode = getValues(`${fieldName}.${index}`);
        if (periode.datoFom === null) {
            setError(`${fieldName}.${index}.datoFom`, {
                type: "notValid",
                message: text.error.datoMåFyllesUt,
            });
        }

        customRowValidation?.(`${fieldName}.${index}`);

        const fieldState = getFieldState(`${fieldName}.${index}`);
        if (!fieldState.error) {
            handleUpdate(index);
        }
    };
    const checkIfAnotherRowIsEdited = (index?: number) => {
        return editableRow !== undefined && Number(editableRow) !== index;
    };
    const showErrorModal = () => {
        setErrorMessage({
            title: text.alert.fullførRedigering,
            text: text.alert.periodeUnderRedigering,
        });
        setErrorModalOpen(true);
    };
    const onEditRow = (index: number) => {
        if (checkIfAnotherRowIsEdited(index)) {
            showErrorModal();
        } else {
            setEditableRow(index);
        }
    };

    const controlledFields = fieldArray.fields.map((field, index) => {
        return {
            ...field,
            ...watchFieldArray?.[index],
        };
    });

    const [tableSection, ident] = fieldName.split(".");
    const ikkeAktiverteEndringer = ikkeAktiverteEndringerIGrunnlagsdata.find(
        (grunnlagsdataEndring) =>
            (ident === undefined || (ident && ident === grunnlagsdataEndring.nyeData.gjelder)) &&
            grunnlagsdataEndring.nyeData.grunnlagsdatatype.erBearbeidet &&
            OpplysningerTypeInntektTabelMapper[grunnlagsdataEndring.nyeData.grunnlagsdatatype.type] === tableSection
    );
    const ikkeAktivertEndringerData = ikkeAktiverteEndringer?.nyeData?.data
        ? JSON.parse(ikkeAktiverteEndringer.nyeData.data)
        : undefined;

    console.log("ikkeAktivertEndringerData", ikkeAktivertEndringerData);

    return (
        <>
            {!lesemodus && [overlappingPeriodsSummary, gapsInPeriods].some((errorsList) => errorsList.length > 0) && (
                <Alert variant="warning" className="mb-4">
                    <Heading size="small">{text.alert.feilIPeriodisering}.</Heading>
                    {overlappingPeriodsSummary.length > 0 && (
                        <>
                            {overlappingPeriodsSummary.map((period: { datoFom: string; datoTom: string }, index) => (
                                <BodyShort key={`${period.datoFom}-${period.datoTom}-${index}`} size="small">
                                    {period.datoTom &&
                                        removePlaceholder(
                                            text.alert.overlappendePerioder,
                                            DateToDDMMYYYYString(dateOrNull(period.datoFom)),
                                            DateToDDMMYYYYString(dateOrNull(period.datoTom))
                                        )}
                                    {!period.datoTom &&
                                        removePlaceholder(
                                            text.alert.overlappendeLøpendePerioder,
                                            DateToDDMMYYYYString(dateOrNull(period.datoFom))
                                        )}
                                </BodyShort>
                            ))}
                            <BodyShort size="small">{text.alert.overlappendePerioderFiks}</BodyShort>
                        </>
                    )}
                    {gapsInPeriods.length > 0 && (
                        <>
                            <BodyShort size="small">{text.error.hullIPerioderInntekt}:</BodyShort>
                            {gapsInPeriods.map((gap, index) => (
                                <BodyShort key={`${gap.datoFom}-${gap.datoTom}-${index}`} size="small">
                                    {DateToDDMMYYYYString(dateOrNull(gap.datoFom))} -{" "}
                                    {DateToDDMMYYYYString(dateOrNull(gap.datoTom))}
                                </BodyShort>
                            ))}
                            <BodyShort size="small">{text.error.hullIPerioderFiks}</BodyShort>
                        </>
                    )}
                    {!runningPeriod && <BodyShort size="small">{text.error.ingenLoependeInntektPeriode}</BodyShort>}
                </Alert>
            )}
            {children({
                controlledFields,
                editableRow,
                overlappingPeriodIndexes,
                onEditRow,
                onSaveRow,
                addPeriod,
                handleOnSelect,
                validatePeriods,
                unsetEditedRow,
            })}
        </>
    );
};
