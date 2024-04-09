import { Buldings2Icon, FloppydiskIcon, PencilIcon, PersonIcon } from "@navikt/aksel-icons";
import { ObjectUtils } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Button, Heading } from "@navikt/ds-react";
import React, { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import {
    IkkeAktivInntektDtoEndringstypeEnum,
    InntektDtoV2,
    InntektValideringsfeil,
    Kilde,
    OppdatereInntektRequest,
    OpplysningerType,
} from "../../../api/BidragBehandlingApiV1";
import text from "../../../constants/texts";
import { useForskudd } from "../../../context/ForskuddContext";
import { useAktiveGrunnlagsdata, useGetBehandlingV2 } from "../../../hooks/useApiData";
import { useOnSaveInntekt } from "../../../hooks/useOnSaveInntekt";
import { useVirkningsdato } from "../../../hooks/useVirkningsdato";
import { hentVisningsnavn } from "../../../hooks/useVisningsnavn";
import { InntektFormPeriode, InntektFormValues } from "../../../types/inntektFormValues";
import { dateOrNull, DateToDDMMYYYYString, isAfterDate } from "../../../utils/date-utils";
import { removePlaceholder } from "../../../utils/string-utils";
import { FormControlledCheckbox } from "../../formFields/FormControlledCheckbox";
import { FormControlledMonthPicker } from "../../formFields/FormControlledMonthPicker";
import { FormControlledTextField } from "../../formFields/FormControlledTextField";
import { createPayload, transformInntekt } from "../helpers/inntektFormHelpers";
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

export const InntektTabel = ({
    fieldName,
    customRowValidation,
    children,
    ident,
}: {
    ident;
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
    const {
        ikkeAktiverteEndringerIGrunnlagsdata,
        inntekter: { valideringsfeil },
    } = useGetBehandlingV2();
    const aktiverGrunnlagFn = useAktiveGrunnlagsdata();
    const virkningsdato = useVirkningsdato();
    const [editableRow, setEditableRow] = useState<number>(undefined);
    const saveInntekt = useOnSaveInntekt();
    const { control, getFieldState, getValues, clearErrors, setError, setValue } = useFormContext<InntektFormValues>();
    const fieldArray = useFieldArray({
        control,
        name: fieldName,
    });
    const watchFieldArray = useWatch({ control, name: fieldName });

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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [inntektType, _] = fieldName.split(".");
    const tableValideringsfeil: InntektValideringsfeil | undefined = ["småbarnstillegg", "utvidetBarnetrygd"].includes(
        inntektType
    )
        ? valideringsfeil[inntektType]
        : valideringsfeil[inntektType]?.find((feil) => {
              if (["barnetillegg", "kontantsøtte"].includes(inntektType)) {
                  return feil.gjelderBarn === ident;
              }
              return feil.ident === ident;
          });

    function hentIkkeAktiverteEndringer() {
        switch (inntektType) {
            case "småbarnstillegg":
                return ikkeAktiverteEndringerIGrunnlagsdata.inntekter.småbarnstillegg;
            case "utvidetBarnetrygd":
                return ikkeAktiverteEndringerIGrunnlagsdata.inntekter.utvidetBarnetrygd;
            case "barnetillegg":
                return ikkeAktiverteEndringerIGrunnlagsdata.inntekter.barnetillegg;
            case "kontantstøtte":
                return ikkeAktiverteEndringerIGrunnlagsdata.inntekter.kontantstøtte;
            default:
                return ikkeAktiverteEndringerIGrunnlagsdata.inntekter.årsinntekter;
        }
    }

    function hentOpplysningerType() {
        switch (inntektType) {
            case "småbarnstillegg":
                return OpplysningerType.SMABARNSTILLEGG;
            case "utvidetBarnetrygd":
                return OpplysningerType.UTVIDET_BARNETRYGD;
            case "barnetillegg":
                return OpplysningerType.BARNETILLEGG;
            case "kontantstøtte":
                return OpplysningerType.KONTANTSTOTTE;
            default:
                return OpplysningerType.SKATTEPLIKTIGE_INNTEKTER;
        }
    }

    const ikkeAktiverteEndringer = hentIkkeAktiverteEndringer()?.filter((v) => v.ident == ident) ?? [];

    console.log("ikkeAktivertEndringerData", ikkeAktiverteEndringer);

    function renderNyeOpplysninger() {
        if (ikkeAktiverteEndringer.length === 0) return null;
        return (
            <Alert variant="warning" className="mb-4">
                <Heading size="small">{text.alert.nyOpplysninger}</Heading>
                <BodyShort>{text.alert.nyOpplysninger}</BodyShort>
                <table className="mt-2">
                    <thead>
                        <tr>
                            <th align="left">{text.label.opplysninger}</th>
                            <th align="left">{text.label.beløp}</th>
                            <th align="left">{text.label.status}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ikkeAktiverteEndringer.map(({ beløp, rapporteringstype, periode, endringstype }, i) => {
                            return (
                                <tr key={i + rapporteringstype}>
                                    <td width="250px" scope="row">
                                        {hentVisningsnavn(rapporteringstype, periode.fom, periode.til)}
                                    </td>
                                    <td width="75px">{beløp}</td>
                                    <td width="100px">
                                        {endringstype == IkkeAktivInntektDtoEndringstypeEnum.NY
                                            ? " Ny"
                                            : endringstype == IkkeAktivInntektDtoEndringstypeEnum.SLETTET
                                              ? "Fjernes"
                                              : "Endring"}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <Button
                    size="xsmall"
                    variant="secondary"
                    spacing
                    disabled={aktiverGrunnlagFn.isPending || aktiverGrunnlagFn.isSuccess}
                    loading={aktiverGrunnlagFn.isPending}
                    className="mt-2"
                    onClick={() =>
                        aktiverGrunnlagFn.mutate({
                            personident: ident,
                            type: hentOpplysningerType(),
                        })
                    }
                >
                    Oppdater opplysninger
                </Button>
            </Alert>
        );
    }
    return (
        <>
            {!lesemodus && tableValideringsfeil && (
                <Alert variant="warning" className="mb-4">
                    <Heading size="small">{text.alert.feilIPeriodisering}.</Heading>
                    {tableValideringsfeil.overlappendePerioder.length > 0 && (
                        <>
                            {tableValideringsfeil.overlappendePerioder.map(({ periode }, index) => (
                                <BodyShort key={`${periode.fom}-${periode.til}-${index}`} size="small">
                                    {periode.til &&
                                        removePlaceholder(
                                            text.alert.overlappendePerioder,
                                            DateToDDMMYYYYString(dateOrNull(periode.fom)),
                                            DateToDDMMYYYYString(dateOrNull(periode.til))
                                        )}
                                    {!periode.til &&
                                        removePlaceholder(
                                            text.alert.overlappendeLøpendePerioder,
                                            DateToDDMMYYYYString(dateOrNull(periode.fom))
                                        )}
                                </BodyShort>
                            ))}
                            <BodyShort size="small">{text.alert.overlappendePerioderFiks}</BodyShort>
                        </>
                    )}
                    {tableValideringsfeil.hullIPerioder.length > 0 && (
                        <>
                            <BodyShort size="small">{text.error.hullIPerioderInntekt}:</BodyShort>
                            {tableValideringsfeil.hullIPerioder.map((gap, index) => (
                                <BodyShort key={`${gap.fom}-${gap.til}-${index}`} size="small">
                                    {DateToDDMMYYYYString(dateOrNull(gap.fom))} -{" "}
                                    {DateToDDMMYYYYString(dateOrNull(gap.til))}
                                </BodyShort>
                            ))}
                            <BodyShort size="small">{text.error.hullIPerioderFiks}</BodyShort>
                        </>
                    )}
                    {tableValideringsfeil.ingenLøpendePeriode && (
                        <BodyShort size="small">{text.error.ingenLoependeInntektPeriode}</BodyShort>
                    )}
                    {tableValideringsfeil.manglerPerioder && (
                        <BodyShort size="small">{text.error.manglerPerioder}</BodyShort>
                    )}
                </Alert>
            )}
            {renderNyeOpplysninger()}
            {children({
                controlledFields,
                editableRow,
                onEditRow,
                onSaveRow,
                addPeriod,
                handleOnSelect,
                unsetEditedRow,
            })}
        </>
    );
};
