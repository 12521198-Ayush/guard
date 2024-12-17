"use client"
import React from 'react';
import { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";

interface BarSeries {
    name: string; 
    data: number[]; 
}

interface ChartProps {
    title: string;
    height: number| string,
    width: number | string,
    series: BarSeries[];
    stacked: boolean;
    lables: string[];
    color: string[];
    isHorizontal: boolean;
    
};

const BarChart: React.FC<ChartProps> = ({
    title,
    height,
    width,
    series,
    stacked,
    lables,
    color,
    isHorizontal
  }) => {

    let options: ApexOptions = {
        colors: color,
        chart: {
            fontFamily: "Satoshi, sans-serif",
            type: "bar",
            width: "100%",
            //height: 335,
            stacked: stacked,
            toolbar: {
                show: false,
            },
            zoom: {
                enabled: false,
            },
        },
        xaxis: {
            categories: lables,
        },
        legend: {
            show: true,
            offsetY:5,
            position: "bottom",
            fontSize: '12px',
            fontWeight: 500,
            fontFamily: "Satoshi",
            horizontalAlign: "left",
            markers: {
                radius: 99,
            },
        },
        plotOptions: {
            bar: {
                horizontal: isHorizontal,
                borderRadius: 0,
                columnWidth: "25%",
                borderRadiusApplication: "end",
                borderRadiusWhenStacked: "last",
            },
        },
        dataLabels: {
            enabled: false,
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
            breakpoint: 1536,
            options: {
                plotOptions: {
                    bar: {
                        borderRadius: 6,
                        columnWidth: "60%",
                    },
                },
            },
        }],
        fill: {
            opacity: 1,
        },
    };

    return (
            
            <div className=" flex justify-center">
                <ReactApexChart
                    options={options}
                    series={series}
                    type="bar"
                    height={height}
                    width={width}    
                />
            </div>
            
    );
};

export default BarChart;