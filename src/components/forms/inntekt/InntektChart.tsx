import { TopLevelFormatterParams } from "echarts/types/src/component/tooltip/TooltipModel";
import React, { memo } from "react";

import { AinntektDto } from "../../../api/BidragGrunnlagApi";
import { GrunnlagInntektType } from "../../../enum/InntektBeskrivelse";
import { datesAreFromSameMonthAndYear, deductMonths, getAListOfMonthsFromDate } from "../../../utils/date-utils";
import { roundDown, roundUp } from "../../../utils/number-utils";
import { capitalize } from "../../../utils/string-utils";
import { EChartsOption, ReactECharts } from "../../e-charts/ReactECharts";

const getMonths = (dates: Date[]) => dates.map((date) => capitalize(date.toLocaleString("nb-NO", { month: "short" })));

const buildChartOptions = (inntekt: AinntektDto[]): EChartsOption => {
    const today = new Date();
    const past12Months = getAListOfMonthsFromDate(deductMonths(today, today.getDate() > 6 ? 11 : 12), 12);
    const past12Incomes = (inntekt: AinntektDto[]) =>
        past12Months.map((date) => {
            const incomeForThatMonth = inntekt.find((periode) =>
                datesAreFromSameMonthAndYear(new Date(periode.periodeFra), date)
            );
            return incomeForThatMonth ?? null;
        });

    const getTotalPerPeriode = (inntekt: AinntektDto[]) =>
        past12Incomes(inntekt).map((incomeForThatMonth) =>
            incomeForThatMonth ? incomeForThatMonth.ainntektspostListe.reduce((acc, curr) => acc + curr.belop, 0) : 0
        );

    return {
        legend: {
            show: false,
        },
        tooltip: {
            trigger: "axis",
            showContent: true,
            formatter: (params: TopLevelFormatterParams) => {
                const ainntektspostListe = past12Incomes(inntekt)[params[0].dataIndex]?.ainntektspostListe;
                return ainntektspostListe
                    ? ainntektspostListe
                          .map(
                              (inntekt) =>
                                  `<p><strong>${GrunnlagInntektType[inntekt.inntektType]}</strong>: ${Number(
                                      inntekt.belop
                                  ).toLocaleString()}</p>`
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

const arePropsEqual = (oldProps, newProps) => {
    return (
        oldProps.inntekt.length === newProps.inntekt.length &&
        oldProps.inntekt.every((oldInntekt, index) => {
            const newInntekt = newProps.inntekt[index];
            return (
                oldInntekt.periodeFra === newInntekt.periodeFra &&
                oldInntekt.periodeTil === newInntekt.periodeTil &&
                oldInntekt.beskrivelse === newInntekt.beskrivelse &&
                oldInntekt.ainntektspostListe.length === newInntekt.ainntektspostListe.length
            );
        })
    );
};

export const InntektChart = memo(
    ({ inntekt }: { inntekt: AinntektDto[] }) => <ReactECharts option={buildChartOptions(inntekt)} />,
    arePropsEqual
);
