import type { LineSeriesOption } from "echarts/charts";
import { LineChart } from "echarts/charts";
import type { GridComponentOption, TitleComponentOption } from "echarts/components";
import {
    DataZoomComponent,
    GridComponent,
    LegendComponent,
    TitleComponent,
    ToolboxComponent,
    TooltipComponent,
} from "echarts/components";
import type { ComposeOption, ECharts, SetOptionOpts } from "echarts/core";
import { getInstanceByDom, init, use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { CSSProperties, useEffect, useRef, useState } from "react";

use([
    LegendComponent,
    LineChart,
    GridComponent,
    TooltipComponent,
    TitleComponent,
    ToolboxComponent,
    DataZoomComponent,
    CanvasRenderer,
]);

export type EChartsOption = ComposeOption<LineSeriesOption | TitleComponentOption | GridComponentOption>;

export interface ReactEChartsProps {
    option: EChartsOption;
    style?: CSSProperties;
    settings?: SetOptionOpts;
}

export function ReactECharts({ option, style, settings }: ReactEChartsProps): JSX.Element {
    const chartRef = useRef<HTMLDivElement>(null);
    const [chartInitialized, setChartInitialized] = useState(false);

    useEffect(() => {
        let chart: ECharts | undefined;
        if (chartRef.current !== null) {
            chart = init(chartRef.current);
            setChartInitialized(true);
        }

        function resizeChart() {
            chart?.resize();
        }
        window.addEventListener("resize", resizeChart);

        return () => {
            chart?.dispose();
            window.removeEventListener("resize", resizeChart);
        };
    }, []);

    useEffect(() => {
        const canvas = chartRef.current.querySelector("canvas");

        if (canvas) {
            const chart = getInstanceByDom(chartRef.current);
            canvas.setAttribute("tabindex", "0");
            const handleKeydown = (e) => {
                chart.dispatchAction({
                    type: "showTip",
                    seriesIndex: 1,
                });
            };
            canvas.addEventListener("focusin", () => {
                window.addEventListener("keydown", handleKeydown);
            });
            canvas.addEventListener("focusout", () => {
                window.removeEventListener("keydown", handleKeydown);
            });
        }
    }, [chartInitialized]);

    useEffect(() => {
        if (chartRef.current !== null) {
            const chart = getInstanceByDom(chartRef.current);
            chart?.setOption(option, settings);
        }
    }, [option, settings]);

    return <div ref={chartRef} style={{ width: "100%", height: "300px", ...style }} />;
}
