import { TopLevelFormatterParams } from "echarts/types/src/component/tooltip/TooltipModel";
import React from "react";

import { Inntekt } from "../../../__mocks__/testdata/inntektTestData";
import { roundDown, roundUp } from "../../../utils/number-utils";
import { EChartsOption, ReactECharts } from "../../e-charts/ReactECharts";

const mockChartData = (inntekt: Inntekt[]) => {
    const data = [];
    const average = Number(inntekt.find((i) => i.tekniskNavn === "gjennomsnittInntektSisteTolvMaaneder").totalt) / 12;

    for (let i = 0; i < 12; i++) {
        if (i === 7) {
            data.push(average + 20000);
        } else if (i === 10) {
            data.push(average + 10000);
        } else {
            data.push(average + Math.round(100 + Math.random() * (4500 - 100)));
        }
    }
    return data;
};

const buildChartOptions = (inntekt: Inntekt[]): EChartsOption => ({
    legend: {
        show: false,
    },
    tooltip: {
        trigger: "axis",
        showContent: true,
        formatter: (params: TopLevelFormatterParams) => {
            if (Array.isArray(params)) {
                return params
                    .map(
                        (param) =>
                            `<p><strong>${param.seriesName}</strong>: ${Math.round(
                                Number(param.data) * 0.95
                            ).toLocaleString()}</p><p><strong>Bonus</strong>: ${Math.round(
                                Number(param.data) * 0.05
                            ).toLocaleString()}</p>`
                    )
                    .join("");
            }
            return `<p><strong>Lønn</strong>: ${params.data.toLocaleString()}</p>`;
        },
        backgroundColor: "rgb(230,240,255)",
        borderColor: "rgb(230,240,255)",
    },
    xAxis: {
        type: "category",
        data: ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"],
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
            data: mockChartData(inntekt),
            type: "line",
            smooth: true,
        },
    ],
});

export const InntektChart = ({ inntekt }: { inntekt: Inntekt[] }) => (
    <ReactECharts option={buildChartOptions(inntekt)} />
);
