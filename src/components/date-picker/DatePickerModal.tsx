import { Modal, UNSAFE_DatePicker, UNSAFE_useDatepicker } from "@navikt/ds-react";
import { useEffect, useState } from "react";

interface DatePickerModalProps {
    button: (props: { onClick: () => void }) => JSX.Element;
}

export const DatePickerModal = ({ button }: DatePickerModalProps) => {
    const [open, setOpen] = useState(false);

    const { datepickerProps, inputProps, selectedDay } = UNSAFE_useDatepicker({
        fromDate: new Date("Aug 23 2019"),
        onDateChange: console.log,
    });

    useEffect(() => {
        Modal.setAppElement("#root");
    }, []);

    return (
        <>
            {button({ onClick: () => setOpen(true) })}

            <Modal
                open={open}
                aria-label="Inntekt periode"
                onClose={() => setOpen((x) => !x)}
                shouldCloseOnEsc={!datepickerProps.open}
                aria-labelledby="modal-heading"
            >
                <Modal.Content className="min-w-96 max-w-full">
                    <div className="min-h-96">
                        <UNSAFE_DatePicker {...datepickerProps} strategy="fixed">
                            <UNSAFE_DatePicker.Input {...inputProps} label="Velg dato" />
                        </UNSAFE_DatePicker>
                        <div className="pt-4">{selectedDay && selectedDay.toDateString()}</div>
                    </div>
                </Modal.Content>
            </Modal>
        </>
    );
};
