import { InntektDtoV2 } from "@api/BidragBehandlingApiV1";
import { EChartsOption, ReactECharts } from "@common/components/e-charts/ReactECharts";
import { datesAreFromSameMonthAndYear, deductMonths, getAListOfMonthsFromDate } from "@utils/date-utils";
import { roundDown, roundUp } from "@utils/number-utils";
import { capitalize } from "@utils/string-utils";
import { TopLevelFormatterParams } from "echarts/types/src/component/tooltip/TooltipModel";
import React, { memo } from "react";

const getMonths = (dates: Date[]) => dates.map((date) => capitalize(date.toLocaleString("nb-NO", { month: "short" })));

const buildChartOptions = (inntekt: InntektDtoV2[]): EChartsOption => {
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
        legend: {
            show: false,
        },
        tooltip: {
            trigger: "axis",
            showContent: true,
            formatter: (params: TopLevelFormatterParams) => {
                const ainntektspostListe = past12Incomes(inntekt)[params[0].dataIndex]?.inntektsposter;
                return ainntektspostListe
                    ? ainntektspostListe
                          .map(
                              (inntekt) =>
                                  `<p><strong>${inntekt.visningsnavn}</strong>: ${inntekt.beløp.toLocaleString(
                                      "nb-NO",
                                      { minimumFractionDigits: 0, maximumFractionDigits: 2 }
                                  )}</p>`
                          )
                          .join("")
                    : "Ingen inntekt funnet";
            },
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
    };
};

const arePropsEqual = (oldProps: { inntekt: InntektDtoV2[] }, newProps: { inntekt: InntektDtoV2[] }) => {
    return (
        oldProps.inntekt.length === newProps.inntekt.length &&
        oldProps.inntekt.every((oldInntekt, index) => {
            const newInntekt = newProps.inntekt[index];
            return (
                oldInntekt.beløp === newInntekt.beløp &&
                oldInntekt.rapporteringstype === newInntekt.rapporteringstype &&
                oldInntekt.inntektsposter?.length === newInntekt.inntektsposter?.length
            );
        })
    );
};

export const InntektChart = memo(
    ({ inntekt }: { inntekt: InntektDtoV2[] }) => <ReactECharts option={buildChartOptions(inntekt)} />,
    arePropsEqual
);
