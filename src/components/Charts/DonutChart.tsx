"use client";
import React from 'react';
import { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";

interface ChartProps {
    title: string;
    height: number|string;
    series: number[];
    lables: string[];
    color: string[];
};

const DonutChart: React.FC<ChartProps> = ({
    title,
    height,
    series,
    lables,
    color,
  }) => {

    let options: ApexOptions = {
        chart: {
            fontFamily: "Satoshi, sans-serif",
            type: "donut",
            //height: "90%"
        },
        colors: color,
        labels: lables,
        legend: {
            show: true,
            offsetY:0,
            fontSize: '12px',
            fontWeight: 500,
            position: "bottom",
            horizontalAlign: "center",
        },
        plotOptions: {
            pie: {
                startAngle: 0,
                endAngle: 360,
                expandOnClick: true,
                offsetX: 0,
                offsetY: 10,
                customScale: 1,
                donut: {
                    size: "45%",
                    background: "transparent",
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '15px',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            fontWeight: 600,
                            color: undefined,
                            offsetY: -3,
                            formatter: function (val) {
                                return val
                            }
                        },
                        value: {
                            show: true,
                            fontSize: '12px',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            fontWeight: 400,
                            color: undefined,
                            offsetY: 1,
                            formatter: function (val) {
                                return val
                            }
                        },
                        total: {
                            show: true,
                            showAlways: false,
                            label: 'Total',
                            fontSize: '15px',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            fontWeight: 600,
                            color: '#373d3f',
                            formatter: function (w) {
                                return w.globals.seriesTotals.reduce((a:number, b:number) => {
                                    return a + b
                                }, 0)
                            }
                        }
                    }
                },
            },
        },
        dataLabels: {
            enabled: true,
            textAnchor: 'middle',
            distributed: false,
            offsetX: 0,
            offsetY: 0,
            style: {
                fontSize: '12px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 400,
                colors: undefined
            },
            dropShadow: {
                enabled: false,
                top: 5,
                left: 0,
                blur: 4,
                opacity: 0.9,
            },
        },
        title: {
            text: title,
            align: 'center',
            margin: 5,
            offsetX: 0,
            offsetY: 0,
            floating: false,
            style: {
              fontSize: '21px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 500,
              color: '#546e7a',

            },
        },        
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 200
                }
            }
        }]
    };

    return (
            
                <div className=" flex justify-center">
                    <ReactApexChart
                        options={options}
                        series={series}
                        type="donut"
                        height={height}
                        width={"100%"}
                    />
                </div>
            
    );
};

export default DonutChart;