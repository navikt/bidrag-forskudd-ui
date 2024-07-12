import { ConfirmationModal } from "@common/components/modal/ConfirmationModal";
import text from "@common/constants/texts";
import { TrashIcon } from "@navikt/aksel-icons";
import { Button, Heading } from "@navikt/ds-react";
import React, { useRef } from "react";

export const RemoveButton = ({ index, onRemoveBarn }: { index: number; onRemoveBarn: (index: number) => void }) => {
    const ref = useRef<HTMLDialogElement>(null);
    const onConfirm = () => {
        ref.current?.close();
        onRemoveBarn(index);
    };

    return (
        <>
            <div className="flex items-center justify-end">
                <Button
                    type="button"
                    onClick={() => ref.current?.showModal()}
                    icon={<TrashIcon aria-hidden />}
                    variant="tertiary"
                    size="small"
                />
            </div>
            <ConfirmationModal
                ref={ref}
                closeable
                description={text.varsel.ønskerDuÅSletteBarnet}
                heading={<Heading size="small">{text.varsel.ønskerDuÅSlette}</Heading>}
                footer={
                    <>
                        <Button type="button" onClick={onConfirm} size="small">
                            {text.label.jaSlett}
                        </Button>
                        <Button type="button" variant="secondary" size="small" onClick={() => ref.current?.close()}>
                            {text.label.avbryt}
                        </Button>
                    </>
                }
            />
        </>
    );
};
