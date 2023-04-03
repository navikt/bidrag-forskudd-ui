import { Button, Select } from "@navikt/ds-react";
import React, { useState } from "react";
import { UseMutationResult } from "react-query";

import { BehandlingDto, SoknadFraType, SoknadType } from "../api/BidragBehandlingApi";
import { SOKNAD_LABELS } from "../constants/soknadFraLabels";
import { DDMMYYYYStringToDate, toDateString } from "../utils/date-utils";
import { DatePickerInput } from "./date-picker/DatePickerInput";
import { FlexRow } from "./layout/grid/FlexRow";

export const UpdateForskudd = ({
    behandling,
    mutation,
    close,
}: {
    behandling: BehandlingDto;
    mutation: UseMutationResult;
    close: any;
}) => {
    const [localBehandling, setLocalBehandling] = useState(Object.assign({}, behandling));

    return (
        <form onSubmit={() => {}}>
            <div className="grid gap-y-4 mt-4">
                <FlexRow className="gap-x-8">
                    <Select
                        label={"Søknad type"}
                        className={`w-52 `}
                        size="small"
                        onChange={(e) => {
                            localBehandling.soknadType = SoknadType[e.target.value];
                        }}
                    >
                        {[{ value: "", text: "Velg søknadstype" }]
                            .concat(
                                Object.entries(SoknadType).map((entry) => ({
                                    value: entry[0],
                                    text: entry[1],
                                }))
                            )
                            .map((option) => (
                                <option
                                    key={option.text}
                                    value={option.value}
                                    selected={localBehandling.soknadType == option.value}
                                >
                                    {option.text}
                                </option>
                            ))}
                    </Select>
                </FlexRow>
                <FlexRow className="gap-x-8">
                    <Select
                        label={"Søknad fra"}
                        className={`w-52 `}
                        size="small"
                        onChange={(e) => {
                            localBehandling.soknadFraType = SoknadFraType[e.target.value];
                        }}
                    >
                        {[{ value: "", text: "Velg hvem som søker" }]
                            .concat(
                                Object.entries(SoknadFraType).map((entry) => ({
                                    value: entry[0],
                                    text: SOKNAD_LABELS[entry[1]],
                                }))
                            )
                            .map((option) => (
                                <option
                                    key={option.text}
                                    value={option.value}
                                    selected={localBehandling.soknadFraType == option.value}
                                >
                                    {option.text}
                                </option>
                            ))}
                    </Select>
                </FlexRow>
                <FlexRow className="gap-x-8">
                    <DatePickerInput
                        label={"Mottat dato"}
                        placeholder={"Mottat dato"}
                        onChange={(value) => {
                            localBehandling.mottatDato = toDateString(value);
                        }}
                        defaultValue={DDMMYYYYStringToDate(localBehandling.mottatDato)}
                        className={"className"}
                        strategy="fixed"
                    />
                </FlexRow>
                <FlexRow className="gap-x-8">
                    <DatePickerInput
                        label={"Søkt fra dato"}
                        placeholder={"Søkt fra dato"}
                        onChange={(value) => {
                            localBehandling.datoFom = toDateString(value);
                        }}
                        defaultValue={DDMMYYYYStringToDate(localBehandling.datoFom)}
                        className={"className"}
                        strategy="fixed"
                    />
                </FlexRow>

                <FlexRow className="items-center">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={async () => {
                            await mutation.mutateAsync(localBehandling).finally(close);
                        }}
                        className="w-max"
                        size="small"
                    >
                        Lagre
                    </Button>
                    <Button
                        loading={false}
                        onClick={() => {
                            setLocalBehandling(Object.assign({}, behandling));
                        }}
                        variant="primary"
                        className="w-max"
                        size="small"
                    >
                        Nullstill
                    </Button>
                </FlexRow>
            </div>
        </form>
    );
};
