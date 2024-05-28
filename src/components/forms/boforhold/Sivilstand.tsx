import "./Opplysninger.css";

import { FloppydiskIcon, PencilIcon, TrashIcon } from "@navikt/aksel-icons";
import { capitalize, ObjectUtils } from "@navikt/bidrag-ui-common";
import { Box, Button, Heading, ReadMore, Table } from "@navikt/ds-react";
import React, { useEffect, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import {
    Kilde,
    SivilstandBeregnetStatusEnum,
    SivilstandDto,
    Sivilstandskode,
} from "../../../api/BidragBehandlingApiV1";
import { boforholdPeriodiseringErros } from "../../../constants/error";
import text from "../../../constants/texts";
import { useForskudd } from "../../../context/ForskuddContext";
import {
    useGetBehandlingV2,
    useGetOpplysningerSivilstand,
    useOppdaterBehandlingV2,
    useSivilstandOpplysningerProssesert,
} from "../../../hooks/useApiData";
import { useVirkningsdato } from "../../../hooks/useVirkningsdato";
import { hentVisningsnavn } from "../../../hooks/useVisningsnavn";
import { BoforholdFormValues } from "../../../types/boforholdFormValues";
import { addMonths, dateOrNull, DateToDDMMYYYYString, isAfterDate, toDateString } from "../../../utils/date-utils";
import { removePlaceholder } from "../../../utils/string-utils";
import { FormControlledMonthPicker } from "../../formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import { ForskuddAlert } from "../../ForskuddAlert";
import { OverlayLoader } from "../../OverlayLoader";
import {
    calculateFraDato,
    checkPeriodizationErrors,
    editPeriods,
    mapSivilstandProsessert,
    removeAndEditPeriods,
    sivilstandForskuddOptions,
} from "../helpers/boforholdFormHelpers";
import { getFomAndTomForMonthPicker } from "../helpers/virkningstidspunktHelpers";
import { KildeIcon } from "../inntekt/InntektTable";

const DeleteButton = ({ onRemovePeriode, index }: { onRemovePeriode: (index) => void; index: number }) => {
    const { lesemodus } = useForskudd();

    return index && !lesemodus ? (
        <Button
            type="button"
            onClick={() => onRemovePeriode(index)}
            icon={<TrashIcon aria-hidden />}
            variant="tertiary"
            size="small"
        />
    ) : (
        <div className="min-w-[40px]"></div>
    );
};
const EditOrSaveButton = ({
    index,
    editableRow,
    onSaveRow,
    onEditRow,
}: {
    index: number;
    editableRow: boolean;
    onSaveRow: (index: number) => void;
    onEditRow: (index: number) => void;
}) => {
    const { lesemodus } = useForskudd();

    if (lesemodus) return null;

    return editableRow ? (
        <Button
            type="button"
            onClick={() => onSaveRow(index)}
            icon={<FloppydiskIcon aria-hidden />}
            variant="tertiary"
            size="small"
        />
    ) : (
        <Button
            type="button"
            onClick={() => onEditRow(index)}
            icon={<PencilIcon aria-hidden />}
            variant="tertiary"
            size="small"
        />
    );
};

const Status = ({
    editableRow,
    fieldName,
    item,
}: {
    editableRow: boolean;
    fieldName: `sivilstand.${number}.sivilstand`;
    item: SivilstandDto;
}) => {
    return editableRow ? (
        <FormControlledSelectField
            name={fieldName}
            label="Sivilstand"
            className="w-52"
            options={sivilstandForskuddOptions.map((value) => ({
                value,
                text: hentVisningsnavn(value.toString()),
            }))}
            hideLabel
        />
    ) : (
        <div className="h-8 flex items-center">{hentVisningsnavn(item.sivilstand)}</div>
    );
};

const Periode = ({
    editableRow,
    item,
    field,
    fieldName,
    label,
}: {
    editableRow: boolean;
    item: SivilstandDto;
    fieldName: `sivilstand.${number}`;
    field: "datoFom" | "datoTom";
    label: string;
}) => {
    const virkningsOrSoktFraDato = useVirkningsdato();
    const { getValues, clearErrors, setError } = useFormContext<BoforholdFormValues>();
    const [fom, tom] = getFomAndTomForMonthPicker(virkningsOrSoktFraDato);
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

    return editableRow ? (
        <FormControlledMonthPicker
            name={`${fieldName}.${field}`}
            label={label}
            placeholder="DD.MM.ÅÅÅÅ"
            defaultValue={item[field]}
            customValidation={validateFomOgTom}
            fromDate={fom}
            toDate={fieldIsDatoTom ? tom : addMonths(tom, 1)}
            lastDayOfMonthPicker={fieldIsDatoTom}
            required={!fieldIsDatoTom}
            hideLabel
        />
    ) : (
        <div className="h-8 flex items-center">{item[field] && DateToDDMMYYYYString(dateOrNull(item[field]))}</div>
    );
};
export const Sivilstand = () => {
    const datoFom = useVirkningsdato();
    return (
        <div className="mt-8">
            <Heading level="2" size="small" id="sivilstand">
                {text.label.sivilstand}
            </Heading>
            <SivilistandPerioder virkningstidspunkt={datoFom} />
        </div>
    );
};

const SivilistandPerioder = ({ virkningstidspunkt }: { virkningstidspunkt: Date }) => {
    const { setErrorMessage, setErrorModalOpen, lesemodus } = useForskudd();
    const sivilstandProssesert = useSivilstandOpplysningerProssesert();
    const [showResetButton, setShowResetButton] = useState(false);
    const behandling = useGetBehandlingV2();

    const saveBoforhold = useOppdaterBehandlingV2();
    const [editableRow, setEditableRow] = useState<number>(undefined);
    const sivilstandOpplysninger = useGetOpplysningerSivilstand();
    const {
        control,
        getValues,
        getFieldState,
        clearErrors,
        setError,
        setValue,
        formState: { errors },
    } = useFormContext<BoforholdFormValues>();
    const sivilstandPerioder = useFieldArray({
        control,
        name: `sivilstand`,
    });

    const watchFieldArray = useWatch({ control, name: `sivilstand` });
    const controlledFields = sivilstandPerioder.fields.map((field, index) => ({
        ...field,
        ...watchFieldArray[index],
    }));
    const sivilistand = getValues(`sivilstand`);

    useEffect(() => {
        if (
            behandling.boforhold.sivilstand.length == 0 &&
            sivilstandProssesert.status == SivilstandBeregnetStatusEnum.OK
        ) {
            updatedAndSave(mapSivilstandProsessert(sivilstandProssesert.sivilstandListe));
        }
    }, []);
    useEffect(() => {
        validatePeriods(sivilistand);
    }, [sivilistand]);

    const validatePeriods = (perioderValues: SivilstandDto[]) => {
        const errorTypes = checkPeriodizationErrors(perioderValues, virkningstidspunkt);

        if (sivilstandProssesert.status != SivilstandBeregnetStatusEnum.OK && controlledFields.length == 0) {
            errorTypes.push("kunneIkkeBeregneSivilstandPerioder");
        }
        if (errorTypes.length) {
            setError(`root.sivilstand`, {
                types: errorTypes.reduce(
                    (acc, errorType) => ({
                        ...acc,
                        [errorType]:
                            errorType === "hullIPerioder"
                                ? removePlaceholder(
                                      boforholdPeriodiseringErros[errorType],
                                      toDateString(virkningstidspunkt),
                                      toDateString(new Date(perioderValues[0].datoFom))
                                  )
                                : boforholdPeriodiseringErros[errorType],
                    }),
                    {}
                ),
            });
        } else {
            clearErrors(`root.sivilstand`);
        }
    };

    const onSaveRow = (index: number) => {
        const perioderValues = getValues(`sivilstand`);
        if (perioderValues[index].datoFom === null) {
            setError(`sivilstand.${index}.datoFom`, {
                type: "notValid",
                message: text.error.datoMåFyllesUt,
            });
        }

        const fieldState = getFieldState(`sivilstand.${index}`);
        if (!fieldState.error) {
            updatedAndSave(editPeriods(perioderValues, index));
        }
    };

    const updatedAndSave = (sivilstand: SivilstandDto[]) => {
        setValue("sivilstand", sivilstand);
        saveBoforhold.mutation.mutate({
            boforhold: {
                sivilstand: sivilstand,
            },
        });
        setShowResetButton(true);

        setEditableRow(undefined);
    };

    const addPeriode = () => {
        if (checkIfAnotherRowIsEdited()) {
            showErrorModal();
        } else {
            const sivilstandPerioderValues = getValues("sivilstand");
            sivilstandPerioder.append({
                datoFom: calculateFraDato(sivilstandPerioderValues, virkningstidspunkt),
                datoTom: null,
                sivilstand: Sivilstandskode.BOR_ALENE_MED_BARN,
                kilde: Kilde.MANUELL,
            });
            setEditableRow(sivilstandPerioderValues.length);
        }
    };

    const onRemovePeriode = (index: number) => {
        if (checkIfAnotherRowIsEdited(index)) {
            showErrorModal();
        } else {
            const perioderValues = getValues(`sivilstand`) as SivilstandDto[];
            const updatedPeriods = removeAndEditPeriods(perioderValues, index);
            updatedAndSave(updatedPeriods);
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

    const resetTilDataFraFreg = () => {
        updatedAndSave(mapSivilstandProsessert(sivilstandProssesert.sivilstandListe));
        setShowResetButton(false);
    };

    return (
        <div>
            <Box padding="4" background="surface-subtle" className="overflow-hidden">
                {(errors?.root?.sivilstand as { types: string[] })?.types && (
                    <div className="mb-4">
                        <ForskuddAlert variant="warning">
                            <Heading spacing size="xsmall" level="3">
                                {text.alert.feilIPeriodisering}
                            </Heading>
                            {Object.values((errors.root.sivilstand as { types: string[] }).types).map(
                                (type: string) => (
                                    <p key={type}>{type}</p>
                                )
                            )}
                        </ForskuddAlert>
                    </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                    <Opplysninger />
                    {sivilstandOpplysninger != null && showResetButton && (
                        <div className="flex justify-end mb-4">
                            <Button
                                variant="tertiary"
                                type="button"
                                size="small"
                                className="w-fit h-fit"
                                onClick={resetTilDataFraFreg}
                            >
                                {text.resetTilOpplysninger}
                            </Button>
                        </div>
                    )}
                </div>
                {controlledFields.length > 0 && (
                    <div
                        className={`${
                            saveBoforhold.mutation.isPending ? "relative" : "inherit"
                        } block overflow-x-auto whitespace-nowrap`}
                    >
                        <OverlayLoader loading={saveBoforhold.mutation.isPending} />
                        <Table size="small" className="table-fixed table bg-white w-full">
                            <Table.Header>
                                <Table.Row className="align-baseline">
                                    <Table.HeaderCell textSize="small" scope="col" align="left" className="w-[134px]">
                                        {text.label.fraOgMed}
                                    </Table.HeaderCell>
                                    <Table.HeaderCell textSize="small" scope="col" align="left" className="w-[134px]">
                                        {text.label.tilOgMed}
                                    </Table.HeaderCell>
                                    <Table.HeaderCell textSize="small" scope="col" align="left">
                                        {text.label.sivilstand}
                                    </Table.HeaderCell>
                                    <Table.HeaderCell textSize="small" scope="col" align="left" className="w-[54px]">
                                        {text.label.kilde}
                                    </Table.HeaderCell>
                                    <Table.HeaderCell scope="col" className="w-[56px]"></Table.HeaderCell>
                                    <Table.HeaderCell scope="col" className="w-[56px]"></Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {controlledFields.map((item, index) => (
                                    <Table.Row key={item?.id} className="align-top">
                                        <Table.DataCell textSize="small">
                                            <Periode
                                                editableRow={editableRow === index}
                                                label={text.label.fraOgMed}
                                                fieldName={`sivilstand.${index}`}
                                                field="datoFom"
                                                item={item}
                                            />
                                        </Table.DataCell>
                                        <Table.DataCell textSize="small">
                                            <Periode
                                                editableRow={editableRow === index}
                                                label={text.label.tilOgMed}
                                                fieldName={`sivilstand.${index}`}
                                                field="datoTom"
                                                item={item}
                                            />
                                        </Table.DataCell>
                                        <Table.DataCell textSize="small">
                                            <Status
                                                item={item}
                                                editableRow={editableRow === index}
                                                fieldName={`sivilstand.${index}.sivilstand`}
                                            />
                                        </Table.DataCell>
                                        <Table.DataCell>
                                            <KildeIcon kilde={item.kilde} />
                                        </Table.DataCell>
                                        <Table.DataCell>
                                            <EditOrSaveButton
                                                index={index}
                                                editableRow={editableRow === index}
                                                onEditRow={onEditRow}
                                                onSaveRow={onSaveRow}
                                            />
                                        </Table.DataCell>
                                        <Table.DataCell>
                                            <DeleteButton index={index} onRemovePeriode={onRemovePeriode} />
                                        </Table.DataCell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    </div>
                )}
                {!lesemodus && (
                    <Button variant="tertiary" type="button" size="small" className="w-fit mt-4" onClick={addPeriode}>
                        {text.label.leggTilPeriode}
                    </Button>
                )}
            </Box>
        </div>
    );
};

const Opplysninger = () => {
    const sivilstandProssesert = useSivilstandOpplysningerProssesert();
    const sivilstandOpplysninger = useGetOpplysningerSivilstand();

    const behandling = useGetBehandlingV2();
    if (!sivilstandOpplysninger) {
        return null;
    }

    const virkingstidspunkt = dateOrNull(behandling.virkningstidspunkt.virkningstidspunkt);

    const sivilstandsOpplysningerFiltrert = () => {
        const opplysningerSortert = sivilstandOpplysninger.grunnlag.sort((a, b) => {
            if (a.gyldigFom == null) return -1;
            if (b.gyldigFom == null) return 1;
            return dateOrNull(a.gyldigFom) > dateOrNull(b.gyldigFom) ? 1 : -1;
        });
        if (sivilstandProssesert.status !== SivilstandBeregnetStatusEnum.OK) {
            return opplysningerSortert;
        }

        const opplysningerFiltrert = opplysningerSortert.filter((sivilstand, i) => {
            const nesteSivilstand = opplysningerSortert[i + 1];
            return (
                virkingstidspunkt == null ||
                dateOrNull(sivilstand.gyldigFom) >= virkingstidspunkt ||
                (nesteSivilstand != null && dateOrNull(nesteSivilstand.gyldigFom) > virkingstidspunkt)
            );
        });

        if (opplysningerFiltrert.length === 0 && opplysningerSortert.length > 0) {
            return [opplysningerSortert[opplysningerSortert.length - 1]];
        }
        return opplysningerFiltrert;
    };
    return (
        <ReadMore header={text.title.opplysningerFraFolkeregistret} size="small" className="pb-4">
            <Table className="w-[300px] opplysninger" size="small">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>{text.label.fraDato}</Table.HeaderCell>
                        <Table.HeaderCell>{text.label.status}</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {sivilstandsOpplysningerFiltrert().map((periode, index) => (
                        <Table.Row key={`${periode.type}-${index}`}>
                            <Table.DataCell className="flex justify-start gap-2">
                                <>{periode.gyldigFom ? DateToDDMMYYYYString(new Date(periode.gyldigFom)) : "\u00A0"}</>
                            </Table.DataCell>
                            <Table.DataCell>{capitalize(periode.type)?.replaceAll("_", " ")}</Table.DataCell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        </ReadMore>
    );
};
