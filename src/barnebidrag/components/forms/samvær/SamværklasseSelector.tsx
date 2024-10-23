import text from "@common/constants/texts";
import { Button, Modal } from "@navikt/ds-react";
import { useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { Samvaersklasse } from "../../../../api/BidragBehandlingApiV1";
import { FormControlledSelectField } from "../../../../common/components/formFields/FormControlledSelectField";
import { useBehandlingProvider } from "../../../../common/context/BehandlingContext";
import { createSamværskalkulatorDefaultvalues } from "../../../../common/helpers/samværFormHelpers";
import { useOnDeleteSamværskalkulatorBeregning } from "../../../../common/hooks/useSaveSamvær";
import { hentVisningsnavn } from "../../../../common/hooks/useVisningsnavn";
import { SamværBarnformvalues, SamværPeriodeFormvalues } from "../../../../common/types/samværFormValues";

export const SamværsklasseSelector = ({
    editableRow,
    fieldName,
    gjelderBarn,
    item,
}: {
    editableRow: boolean;
    gjelderBarn: string;
    fieldName: `${string}.perioder.${number}`;
    item: SamværPeriodeFormvalues;
}) => {
    const { clearErrors, control, setValue, getValues } = useFormContext<SamværBarnformvalues>();
    const periode = useWatch({ control, name: fieldName });
    const ref = useRef<HTMLDialogElement>(null);
    const previousSamværsklasse = useRef<Samvaersklasse>(periode.samværsklasse);
    const deleteSamværskalkulatorBeregningFn = useOnDeleteSamværskalkulatorBeregning();
    const { setSaveErrorState } = useBehandlingProvider();

    const options = Object.keys(Samvaersklasse).map((key) => Samvaersklasse[key]);
    const onRemoveBeregning = () => {
        const periode = getValues(fieldName);
        deleteSamværskalkulatorBeregningFn.mutation.mutate(
            {
                samværsperiodeId: periode.id,
                gjelderBarn,
            },
            {
                onSuccess: (response) => {
                    setValue(`${fieldName}.beregning`, createSamværskalkulatorDefaultvalues(true));

                    deleteSamværskalkulatorBeregningFn.queryClientUpdater((currentData) => {
                        return {
                            ...currentData,
                            samvær: currentData.samvær.map((s) => {
                                if (s.gjelderBarn === gjelderBarn) {
                                    return response.oppdatertSamvær;
                                }
                                return s;
                            }),
                        };
                    });
                    previousSamværsklasse.current = periode.samværsklasse;
                    ref.current?.close();
                },
                onError: () => {
                    setSaveErrorState({
                        error: true,
                        retryFn: () => onRemoveBeregning(),
                        rollbackFn: () => null,
                    });
                },
            }
        );
    };
    function renderModal() {
        return (
            <Modal
                ref={ref}
                size="small"
                closeOnBackdropClick={false}
                header={{ heading: "Ønsker du slette beregnet samværsklasse?", size: "small", closeButton: false }}
                className="z-50"
            >
                <Modal.Body>
                    Samværsklassen er satt basert på beregningen fra samværskalkulatoren. Hvis du ønsker å endre
                    samværsklassen manuelt må du slette lagret beregning.
                </Modal.Body>
                <Modal.Footer>
                    <Button size="xsmall" variant="danger" onClick={onRemoveBeregning}>
                        Slett beregning
                    </Button>
                    <Button
                        size="xsmall"
                        variant="secondary"
                        onClick={() => {
                            ref.current?.close();
                            setValue(`${fieldName}.samværsklasse`, previousSamværsklasse.current);
                        }}
                    >
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
    return (
        <>
            {renderModal()}
            {editableRow ? (
                <>
                    <FormControlledSelectField
                        name={`${fieldName}.samværsklasse`}
                        className="w-fit"
                        label={text.label.status}
                        options={options.map((value) => ({
                            value,
                            text: hentVisningsnavn(value),
                        }))}
                        hideLabel
                        onBeforeSelect={(value) => {
                            previousSamværsklasse.current = value as Samvaersklasse;
                        }}
                        onSelect={(value) => {
                            if (periode.beregning?.isSaved === true) {
                                ref.current?.showModal();
                            } else {
                                previousSamværsklasse.current = value as Samvaersklasse;
                            }
                            clearErrors(`${fieldName}.samværsklasse`);
                        }}
                    />
                </>
            ) : (
                <div className="h-8 flex items-center">{hentVisningsnavn(item.samværsklasse)}</div>
            )}
        </>
    );
};
