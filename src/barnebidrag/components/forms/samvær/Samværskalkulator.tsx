import { CalculatorIcon } from "@navikt/aksel-icons";
import { BodyShort, Button, Heading, HStack, Modal, Table, VStack } from "@navikt/ds-react";
import { useEffect, useRef } from "react";
import React from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { SamvaerskalkulatorNetterFrekvens } from "../../../../api/BidragBehandlingApiV1";
import { FormControlledSelectField } from "../../../../common/components/formFields/FormControlledSelectField";
import { FormControlledTextField } from "../../../../common/components/formFields/FormControlledTextField";
import { ResultatTable } from "../../../../common/components/vedtak/ResultatTable";
import {
    createSamværskalkulatorDefaultvalues,
    mapToSamværskalkulatoDetaljer,
} from "../../../../common/helpers/samværFormHelpers";
import { useBeregnSamværsklasse } from "../../../../common/hooks/useApiData";
import { useDebounce } from "../../../../common/hooks/useDebounce";
import { hentVisningsnavn } from "../../../../common/hooks/useVisningsnavn";
import { SamværBarnformvalues } from "../../../../common/types/samværFormValues";

interface SamværskalkulatorProps {
    fieldname: `${string}.perioder.${number}`;
}
export const SamværskalkulatorForm = ({ fieldname }: SamværskalkulatorProps) => {
    const { control, watch, setValue } = useFormContext<SamværBarnformvalues>();

    const beregnSamværsklasseFn = useBeregnSamværsklasse();
    const beregning = useWatch({ control, name: `${fieldname}.beregning` });
    const ferier = useWatch({ control, name: `${fieldname}.beregning.ferier` });
    const samværsklasse = useWatch({ control, name: `${fieldname}.beregning.samværsklasse` });
    const sumGjennomsnittligSamværPerMåned = useWatch({
        control,
        name: `${fieldname}.beregning.sumGjennomsnittligSamværPerMåned`,
    });

    function beregnSamværsklasse() {
        beregnSamværsklasseFn.mutate(mapToSamværskalkulatoDetaljer({ ...beregning, isSaved: true }), {
            onSuccess: (data) => {
                setValue(`${fieldname}.samværsklasse`, data.samværsklasse);
                setValue(`${fieldname}.beregning.samværsklasse`, data.samværsklasse);
                setValue(
                    `${fieldname}.beregning.sumGjennomsnittligSamværPerMåned`,
                    data.sumGjennomsnittligSamværPerMåned
                );
            },
        });
    }
    const debouncedOnSave = useDebounce(beregnSamværsklasse);

    useEffect(() => {
        const subscription = watch((_, { name, type }) => {
            if (name.includes("beregning") && type === "change") {
                debouncedOnSave();
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    if (ferier === undefined) return null;
    return (
        <VStack gap={"4"}>
            <BodyShort size="small">
                <Heading size="xsmall">Regelmessig samvær</Heading>
                <HStack gap="1">
                    <FormControlledTextField
                        name={`${fieldname}.beregning.regelmessigSamværNetter`}
                        label={"Antall netter"}
                        type="number"
                        min={0}
                    />
                    <BodyShort size="small" className="self-end">
                        {" "}
                        /14 dager
                    </BodyShort>
                </HStack>
            </BodyShort>

            <div>
                <Heading size="xsmall">Ferie</Heading>
                <Table size="small" className="table-fixed table bg-white w-full">
                    <Table.Header>
                        <Table.Row className="align-baseline">
                            <Table.HeaderCell textSize="small" scope="col" align="left" className="w-[134px]">
                                {"Ferie"}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" align="left" className="w-[100px]">
                                {"Bidragsmottaker"}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" align="left" className="w-[100px]">
                                {"Bidragspliktig"}
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col" className="w-[180px]">
                                {"Når"}
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {Object.entries(ferier).map(([ferietype, _item], index) => (
                            <Table.Row key={ferietype + "_" + index} className="align-top">
                                <Table.DataCell textSize="small">{hentVisningsnavn(ferietype)}</Table.DataCell>
                                <Table.DataCell textSize="small">
                                    <FormControlledTextField
                                        name={`${fieldname}.beregning.ferier.${ferietype}.bidragspliktigNetter`}
                                        label={""}
                                        hideLabel
                                        type="number"
                                        min={0}
                                    />
                                </Table.DataCell>
                                <Table.DataCell textSize="small">
                                    <FormControlledTextField
                                        name={`${fieldname}.beregning.ferier.${ferietype}.bidragsmottakerNetter`}
                                        label={""}
                                        hideLabel
                                        type="number"
                                        min={0}
                                    />
                                </Table.DataCell>
                                <Table.DataCell textSize="small">
                                    <FerieFrekvens
                                        fieldName={`${fieldname}.beregning.ferier.${ferietype}`}
                                        editableRow={true}
                                        item={_item?.frekvens}
                                    />
                                </Table.DataCell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </div>
            {samværsklasse && (
                <ResultatTable
                    data={[
                        {
                            label: "Beregning",
                            textRight: false,
                            value: `Samværsklasse ${hentVisningsnavn(samværsklasse)} (samvær per måned: ${sumGjennomsnittligSamværPerMåned})`,
                        },
                    ].filter((d) => d)}
                />
            )}
        </VStack>
    );
};

export const SamværskalkulatorView = ({ fieldname }: SamværskalkulatorProps) => {
    const { control } = useFormContext<SamværBarnformvalues>();

    const regelmessigSamværNetter = useWatch({ control, name: `${fieldname}.beregning.regelmessigSamværNetter` });
    const ferier = useWatch({ control, name: `${fieldname}.beregning.ferier` });
    const samværsklasse = useWatch({ control, name: `${fieldname}.samværsklasse` });
    const sumGjennomsnittligSamværPerMåned = useWatch({
        control,
        name: `${fieldname}.beregning.sumGjennomsnittligSamværPerMåned`,
    });

    if (ferier === undefined) return null;
    return (
        <VStack gap={"4"} className="w-[400px]">
            <BodyShort size="small">
                <Heading size="xsmall">Regelmessig samvær</Heading>
                <BodyShort size="small" className="self-end">
                    <HStack gap="2">
                        <strong>Antall netter: </strong>
                        {regelmessigSamværNetter}
                        /14 dager
                    </HStack>
                </BodyShort>
            </BodyShort>
            <div>
                <Heading size="xsmall">Ferie</Heading>
                <Table size="small" className="table-fixed table bg-white w-full">
                    <Table.Header>
                        <Table.Row className="align-baseline">
                            <Table.HeaderCell textSize="small" scope="col" align="left" className="w-[134px]">
                                {"Ferie"}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" align="left" className="w-[134px]">
                                {"Bidragsmottaker"}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" align="left" className="w-[134px]">
                                {"Bidragspliktig"}
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col" className="w-[180px]">
                                {"Når"}
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {Object.entries(ferier).map(([ferietype, _item], index) => (
                            <Table.Row key={ferietype + "_" + index} className="align-top">
                                <Table.DataCell textSize="small">{hentVisningsnavn(ferietype)}</Table.DataCell>
                                <Table.DataCell textSize="small">
                                    <BodyShort>{_item.bidragspliktigNetter}</BodyShort>
                                </Table.DataCell>
                                <Table.DataCell textSize="small">
                                    <BodyShort>{_item.bidragsmottakerNetter}</BodyShort>
                                </Table.DataCell>
                                <Table.DataCell textSize="small">
                                    <BodyShort>{hentVisningsnavn(_item.frekvens)}</BodyShort>
                                </Table.DataCell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </div>
            {samværsklasse && (
                <ResultatTable
                    className="w-max"
                    data={[
                        {
                            label: "Beregning",
                            textRight: false,
                            value: `Samværsklasse ${hentVisningsnavn(samværsklasse)} (samvær per måned: ${sumGjennomsnittligSamværPerMåned})`,
                        },
                    ].filter((d) => d)}
                />
            )}
        </VStack>
    );
};
const FerieFrekvens = ({
    editableRow,
    fieldName,
    item,
}: {
    editableRow: boolean;
    fieldName: `${string}.perioder.${number}.beregning.ferier.${string}`;
    item: SamvaerskalkulatorNetterFrekvens;
}) => {
    const { clearErrors } = useFormContext<SamværBarnformvalues>();

    const options = Object.values(SamvaerskalkulatorNetterFrekvens);

    return editableRow ? (
        <FormControlledSelectField
            name={`${fieldName}.frekvens`}
            className="w-fit"
            label={""}
            options={options.map((value) => ({
                value,
                text: hentVisningsnavn(value),
            }))}
            hideLabel
            onSelect={() => clearErrors(`${fieldName}.frekvens`)}
        />
    ) : (
        <div className="h-8 flex items-center">{hentVisningsnavn(item)}</div>
    );
};

interface SamværskalkulatorButtonProps {
    editableRow: boolean;
    fieldname: `${string}.perioder.${number}`;
}
export const SamværskalkulatorButton = ({ fieldname, editableRow }: SamværskalkulatorButtonProps) => {
    const ref = useRef<HTMLDialogElement>(null);
    const { control, getValues, setValue } = useFormContext<SamværBarnformvalues>();
    const previousBeregning = useRef(getValues(`${fieldname}.beregning`));
    const beregning = useWatch({ control, name: `${fieldname}.beregning` });
    const onSave = () => {
        ref.current?.close();
        setValue(`${fieldname}.beregning.isSaved`, true);
    };

    const closeAndCancel = () => {
        setValue(`${fieldname}.beregning`, previousBeregning.current);
        ref.current?.close();
    };

    if (!editableRow) return null;
    return (
        <>
            <Button
                variant="tertiary"
                size="xsmall"
                onClick={() => {
                    ref.current?.showModal();
                    previousBeregning.current = beregning;
                }}
                icon={<CalculatorIcon />}
            ></Button>
            <Modal ref={ref} header={{ heading: "Samværskalkulator" }} className="text-left">
                <Modal.Body>
                    <SamværskalkulatorForm fieldname={fieldname} />
                </Modal.Body>
                <Modal.Footer>
                    <Button size="xsmall" variant="primary" onClick={onSave}>
                        Lagre beregning
                    </Button>
                    <Button size="xsmall" variant="secondary" onClick={closeAndCancel}>
                        Avbryt
                    </Button>
                    <Button
                        size="xsmall"
                        variant="tertiary"
                        onClick={() => {
                            setValue(`${fieldname}.beregning`, createSamværskalkulatorDefaultvalues());
                        }}
                    >
                        Nullstill
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
