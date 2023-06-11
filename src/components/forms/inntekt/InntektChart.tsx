import { TopLevelFormatterParams } from "echarts/types/src/component/tooltip/TooltipModel";
import React, { memo } from "react";

import { AinntektDto } from "../../../api/BidragGrunnlagApi";
import { InntektType } from "../../../enum/InntektBeskrivelse";
import { roundDown, roundUp } from "../../../utils/number-utils";
import { EChartsOption, ReactECharts } from "../../e-charts/ReactECharts";

const getTotalPerPeriode = (inntekt: AinntektDto[]) =>
    inntekt.map((periode) => periode.ainntektspostListe.reduce((acc, curr) => acc + curr.belop, 0));

const monthAbbreviations = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"];
const getPeriodeMonth = (inntekt: AinntektDto[]) =>
    inntekt.map((periode) => monthAbbreviations[Number(periode.periodeFra.split("-")[1]) - 1]);

const buildChartOptions = (inntekt: AinntektDto[]): EChartsOption => ({
    legend: {
        show: false,
    },
    tooltip: {
        trigger: "axis",
        showContent: true,
        formatter: (params: TopLevelFormatterParams) =>
            inntekt[params[0].dataIndex].ainntektspostListe
                .map(
                    (inntekt) =>
                        `<p><strong>${InntektType[inntekt.inntektType]}</strong>: ${Number(
                            inntekt.belop
                        ).toLocaleString()}</p>`
                )
                .join(""),
        backgroundColor: "rgb(230,240,255)",
        borderColor: "rgb(230,240,255)",
    },
    xAxis: {
        type: "category",
        data: getPeriodeMonth(inntekt),
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
});

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
