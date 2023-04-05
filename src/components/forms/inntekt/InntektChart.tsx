import { TopLevelFormatterParams } from "echarts/types/src/component/tooltip/TooltipModel";
import React from "react";

import { roundDown, roundUp } from "../../../utils/number-utils";
import { EChartsOption, ReactECharts } from "../../e-charts/ReactECharts";

const chartOptions: EChartsOption = {
    legend: {
        show: false,
    },
    tooltip: {
        trigger: "axis",
        showContent: true,
        formatter: (params: TopLevelFormatterParams) => {
            if (Array.isArray(params)) {
                return params
                    .map((param) => `<p><strong>${param.seriesName}</strong>: ${param.data.toLocaleString()}</p>`)
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
            data: [47352, 48121, 43271, 45522, 45731, 72321, 50112, 48103, 42335, 44753, 58121, 45733],
            type: "line",
            smooth: true,
        },
    ],
};

export const InntektChart = () => <ReactECharts option={chartOptions} />;
