import { ExternalLink } from "@navikt/ds-icons";
import { BodyShort, Button, Heading, Label, Link, Loader, Select, Textarea, TextField } from "@navikt/ds-react";
import React, { Suspense, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { useMockApi } from "../../__mocks__/mocksForMissingEndpoints/useMockApi";
import { STEPS } from "../../constants/steps";
import { useForskudd } from "../../context/ForskuddContext";
import { ForskuddBeregningKodeAarsak } from "../../enum/ForskuddBeregningKodeAarsak";
import { ForskuddStepper } from "../../enum/ForskuddStepper";
import { DatePickerInput } from "../date-picker/DatePickerInput";
import { FlexRow } from "../layout/grid/FlexRow";

const createInitialValues = (behandling) => ({
    virkningstidspunkt: behandling.virkningstidspunkt ? new Date(behandling.virkningstidspunkt) : undefined,
    aarsak: behandling.aarsak ?? "",
    avslag: behandling.avslag ?? "",
    vedtakNotat: behandling.vedtakNotat ?? "",
    notat: behandling.notat ?? "",
});

export default () => {
    const { saksnummer } = useForskudd();
    const { api } = useMockApi();
    const { data: behandling, refetch, isRefetching } = api.getBehandlingData(saksnummer);

    return (
        <Suspense fallback={<Loader size="3xlarge" title="venter..." />}>
            <VirkningstidspunktForm behandling={behandling} refetch={refetch} isRefetching={isRefetching} />
        </Suspense>
    );
};

const VirkningstidspunktForm = ({ behandling, refetch, isRefetching }) => {
    const { virkningstidspunktFormValues, setVirkningstidspunktFormValues, setActiveStep } = useForskudd();
    const initialValues = virkningstidspunktFormValues ?? createInitialValues(behandling);

    const {
        handleSubmit,
        control,
        reset,
        getValues,
        formState: { errors },
    } = useForm({
        defaultValues: initialValues,
    });

    useEffect(() => {
        if (!virkningstidspunktFormValues) setVirkningstidspunktFormValues(initialValues);

        return () => {
            setVirkningstidspunktFormValues(getValues());
        };
    }, []);

    const onRefetch = async () => {
        const { data } = await refetch();
        const values = createInitialValues(data);
        reset(values);
        setVirkningstidspunktFormValues(values);
    };

    const onSubmit = (data) => {
        console.log(data);
        setActiveStep(STEPS[ForskuddStepper.INNTEKT]);
    };

    return (
        <div>
            <Heading level="2" size="xlarge">
                Virkningstidspunkt
            </Heading>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-y-4 mt-4">
                    <FlexRow className="gap-x-12">
                        <div className="flex gap-x-2">
                            <Label size="small">Søknadstype</Label>
                            <BodyShort size="small">{behandling.soknadType}</BodyShort>
                        </div>
                        <div className="flex gap-x-2">
                            <Label size="small">Søknad fra</Label>
                            <BodyShort size="small">{behandling.soknadFra}</BodyShort>
                        </div>
                        <div className="flex gap-x-2">
                            <Label size="small">Mottat dato</Label>
                            <BodyShort size="small">{behandling.soktFraDato}</BodyShort>
                        </div>
                        <div className="flex gap-x-2">
                            <Label size="small">Søkt fra dato</Label>
                            <BodyShort size="small">{behandling.mottatDato}</BodyShort>
                        </div>
                    </FlexRow>
                    <FlexRow className="gap-x-8">
                        <Controller
                            control={control}
                            name="virkningstidspunkt"
                            render={({ field }) => (
                                <DatePickerInput
                                    label="Virkningstidspunkt"
                                    onChange={field.onChange}
                                    defaultValue={initialValues.virkningstidspunkt}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="aarsak"
                            render={({ field }) => (
                                <Select
                                    label="Årsak"
                                    className="w-52"
                                    size="small"
                                    value={field.value}
                                    onChange={field.onChange}
                                >
                                    <option value="">Velg årsak</option>
                                    {Object.entries(ForskuddBeregningKodeAarsak).map((entry) => (
                                        <option key={entry[0]} value={entry[0]}>
                                            {entry[1]}
                                        </option>
                                    ))}
                                </Select>
                            )}
                        />
                        <Controller
                            control={control}
                            name="avslag"
                            render={({ field }) => (
                                <Select
                                    label="Avslag/opphør"
                                    className="w-52"
                                    size="small"
                                    value={field.value}
                                    onChange={field.onChange}
                                >
                                    <option value=""></option>
                                    <option value="avslag_1">Avslag 1</option>
                                    <option value="avslag_2">Avslag 2</option>
                                </Select>
                            )}
                        />
                    </FlexRow>
                    <Controller
                        control={control}
                        name="vedtakNotat"
                        render={({ field }) => (
                            <Textarea
                                label="Begrunnelse (med i vedtaket og notat)"
                                size="small"
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="notat"
                        render={({ field }) => (
                            <TextField
                                label="Begrunnelse (kun med i notat)"
                                size="small"
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    <FlexRow>
                        <Button loading={false} className="w-max" size="small">
                            Gå videre
                        </Button>
                        <Button
                            type="button"
                            loading={isRefetching}
                            variant="secondary"
                            onClick={onRefetch}
                            className="w-max"
                            size="small"
                        >
                            Oppfrisk
                        </Button>
                        <Button
                            type="button"
                            loading={false}
                            variant="secondary"
                            onClick={() => {}}
                            className="w-max"
                            size="small"
                        >
                            Lagre
                        </Button>
                        <Link href="#" onClick={() => {}} className="font-bold">
                            Vis notat <ExternalLink aria-hidden />
                        </Link>
                    </FlexRow>
                </div>
            </form>
        </div>
    );
};
