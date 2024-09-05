import { InntektDtoV2 } from "@api/BidragBehandlingApiV1";
import { ReactECharts, ReactEChartsProps } from "@common/components/e-charts/ReactECharts";
import { BodyShort, Box, Label } from "@navikt/ds-react";
import { datesAreFromSameMonthAndYear, deductMonths, getAListOfMonthsFromDate } from "@utils/date-utils";
import { roundDown, roundUp } from "@utils/number-utils";
import { capitalize } from "@utils/string-utils";
import React, { memo, useState } from "react";

import text from "../../constants/texts";

const getMonths = (dates: Date[]) => dates.map((date) => capitalize(date.toLocaleString("nb-NO", { month: "short" })));

const buildChartProps = (inntekt: InntektDtoV2[], onHighlight: (inntekt: InntektDtoV2) => void): ReactEChartsProps => {
    const today = new Date();
    const past12Months = getAListOfMonthsFromDate(deductMonths(today, today.getDate() > 6 ? 12 : 13), 12);
    const past12Incomes = (inntekt: InntektDtoV2[]) =>
        past12Months.map((date) => {
            const incomeForThatMonth = inntekt.find((periode) =>
                datesAreFromSameMonthAndYear(new Date(periode.datoFom), date)
            );
            return incomeForThatMonth ?? null;
        });

    const getTotalPerPeriode = (inntekt: InntektDtoV2[]) =>
        past12Incomes(inntekt).map((incomeForThatMonth) => (incomeForThatMonth ? incomeForThatMonth.beløp : 0));

    return {
        option: {
            legend: {
                show: false,
            },
            tooltip: {
                trigger: "axis",
                showContent: false,
                backgroundColor: "rgb(230,240,255)",
                borderColor: "rgb(230,240,255)",
            },
            xAxis: {
                type: "category",
                data: getMonths(past12Months),
            },
            grid: { bottom: "0px", top: "16px", left: "8px", right: "0px", containLabel: true },
            yAxis: {
                type: "value",
                min: (value) => roundDown(value.min),
                max: (value) => roundUp(value.max),
            },
            series: [
                {
                    name: "Lønn",
                    data: getTotalPerPeriode(inntekt),
                    type: "line",
                    smooth: true,
                },
            ],
        },
        onHighlight: (dataIndex: number) => onHighlight(past12Incomes(inntekt)[dataIndex]),
    };
};

const arePropsEqual = (oldProps: { inntekt: InntektDtoV2[] }, newProps: { inntekt: InntektDtoV2[] }) => {
    return (
        oldProps.inntekt.length === newProps.inntekt.length &&
        oldProps.inntekt.every((oldInntekt, index) => {
            const newInntekt = newProps.inntekt[index];
            return (
                oldInntekt.beløp === newInntekt.beløp &&
                oldInntekt.ident === newInntekt.ident &&
                oldInntekt.gjelderBarn === newInntekt.gjelderBarn &&
                oldInntekt.rapporteringstype === newInntekt.rapporteringstype &&
                oldInntekt.inntektsposter?.length === newInntekt.inntektsposter?.length
            );
        })
    );
};

export const InntektChart = memo(
    ({ inntekt, onHighlight }: { inntekt: InntektDtoV2[]; onHighlight: (inntekt: InntektDtoV2) => void }) => (
        <ReactECharts {...buildChartProps(inntekt, onHighlight)} />
    ),
    arePropsEqual
);

export const InntektChartWithInfoBoard = ({ inntekt }: { inntekt: InntektDtoV2[] }) => {
    const [highlightedMonth, setHighlightedMonth] = useState<InntektDtoV2>(null);
    const onHighlight = (inntekt: InntektDtoV2) => setHighlightedMonth(inntekt);

    return (
        <div className="grid grid-cols-[568px,1fr] gap-6">
            <InntektChart inntekt={inntekt} onHighlight={onHighlight} />
            <Box padding="4" background="surface-info-subtle" className="h-max">
                {!highlightedMonth && (
                    <Label size="small" className="text-nowrap">
                        {text.label.fastlønn}:
                    </Label>
                )}
                {highlightedMonth &&
                    highlightedMonth.inntektsposter.map((inntekt) => (
                        <div className="flex gap-x-2">
                            <Label size="small" className="text-nowrap">
                                {inntekt.visningsnavn}:
                            </Label>
                            <BodyShort size="small">
                                {inntekt.beløp.toLocaleString("nb-NO", {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 2,
                                })}
                            </BodyShort>
                        </div>
                    ))}
            </Box>
        </div>
    );
};
