import React, { useLayoutEffect, useRef } from "react";
import { useClient } from "./FhirClientContext";

async function loadData(client) {
    const q = new URLSearchParams();
    q.set("code", "http://loinc.org|55284-4");
    q.set("subject", client.patient.id);
    
    const bp = await client.request(`Observation?${q}`, {
        pageLimit: 0,
        flat: true
    });

    /** @type any */
    const bpMap = {
        systolic: [],
        diastolic: []
    };

    bp.forEach(o => {
        o.component.forEach(c => {
            const code = client.getPath(c, "code.coding.0.code");
            if (code === "8480-6") {
                bpMap.systolic.push({
                    x: new Date(o.effectiveDateTime).toLocaleDateString(),
                    y: c.valueQuantity.value
                });
            } else if (code === "8462-4") {
                bpMap.diastolic.push({
                    x: new Date(o.effectiveDateTime).toLocaleDateString(),
                    y: c.valueQuantity.value
                });
            }
        });
    });

    bpMap.systolic.sort((a, b) => a.x - b.x);
    bpMap.diastolic.sort((a, b) => a.x - b.x);

    return bpMap;
}

function renderChart(id, { systolic, diastolic }) {
    return new Chart(id, {
        type: "line",
        data: {
            datasets: [
                {
                    label: "Systolic",
                    data: systolic,
                    borderWidth: 2,
                    borderColor: "rgba(200, 0, 127, 1)",
                    fill: false,
                    cubicInterpolationMode: "monotone",
                    yAxisID: 'yAxis'
                },
                {
                    label: "Diastolic",
                    data: diastolic,
                    borderWidth: 2,
                    borderColor: "rgba(0, 127, 255, 1)",
                    fill: false,
                    cubicInterpolationMode: "monotone",
                    yAxisID: 'yAxis'
                }
            ]
        },

        options: {
            responsive: false,
            scales: {
                yAxis: {
                    offset: true,
                    ticks: {
                        beginAtZero: true,
                        min: 0,
                        max: 200,
                        stepSize: 20
                    }
                }
            },
            title: {
                text: "Blood Pressure",
                display: true,
                fontSize: 20
            }
        }
    });
}

export default function ChartWrapper() {
    const { client }   = useClient()
    const containerRef = useRef(null);
    const chartRef     = useRef(null);

    useLayoutEffect(() => {
        if (client) {
            loadData(client).then(options => {
                if (containerRef.current) {
                    try {
                        if (chartRef.current) {
                            chartRef.current.destroy()
                        }
                        chartRef.current = renderChart(containerRef.current, options);
                    } catch (ex) {
                        console.error(ex)
                    }
                }
            })
        }
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, [client])

    return <canvas id="myChart" width="600" height="400" ref={ containerRef } />
}
