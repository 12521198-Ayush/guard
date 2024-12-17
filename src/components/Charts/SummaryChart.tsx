
import React, { ReactNode } from "react";
import { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";

interface SummaryChartProps {
  title: string;
  total: number;
  series: number[];
  lables: string[];
  color: string[];
  children: ReactNode;
};

const SummaryChart: React.FC<SummaryChartProps> = ({
  title,
  total,
  series,
  lables,
  color,
  children,
}) => {

  const seriesTotal = total;
  //console.log("Series total:", seriesTotal);

  let options: ApexOptions = {
    chart: {
      type: 'radialBar',
      background:'white',
    },
    plotOptions: {
      radialBar: {
        offsetY: -20,
        startAngle: -90,
        endAngle: 90,

        hollow: {
          margin: 0,
          size: '30%',
          background: 'transparent',
          image: undefined,
          imageOffsetX: 0,
          imageOffsetY: 0, 
          position: 'front',
          dropShadow: {
            enabled: true,
            top: 5,
            left: 0,
            blur: 4,
            opacity: 0.9,
          },
        },

        track: {
          show: true,
          background: '#40475D',
          strokeWidth: '6%',
          opacity: 0.75,
          margin: 3, // margin is in pixels
          dropShadow: {
            enabled: true,
            top: 0,
            left: 0,
            blur: 3,
            color: '#000',
            opacity: 0.3,
          },
        },

        dataLabels: {
          show: true,
          name: {
            show: true,
            offsetY: -10,
            color: '#fff',
            fontSize: '10px',
          },
          value: {
            show: true,
            offsetY: -10, 
            color: '#dadada',
            fontSize: '10px',
            formatter: function (value) {
              return value +'%';
            },
          },
          total: {
                    show: false,
                    label: 'Total',
                    color: '#373d3f',
                    fontSize: '16px',
                    fontFamily: undefined,
                    fontWeight: 600,
                    formatter: function (w) {
                      //console.log(w);
                      return seriesTotal + "" // w.globals.seriesTotals.reduce((a, b) => {
                        //return a + b
                      //}, 0) / w.globals.series.length + '%'
                    }
                }
        },
        barLabels: {
          enabled: false,
          useSeriesColors: true,
          fontSize: '12px',
          formatter: function(seriesName, opts) {
            console.log(opts);
            return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex]
          },
        },
      }
    },
    colors: color,
    stroke: {
      lineCap: "butt",
    },
    labels: lables,
    /*
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0.3,
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100]
      }
    },
    */

    legend: {
      show: false,
      offsetY:0,
      fontSize: '12px',
      position: "bottom",
      horizontalAlign: "left",
      //offsetX: 0,
      //offsetY: 0,
      formatter: function (val, opts) {
        //console.log("Formatter:", total, seriesTotal);
        return val + " - " + opts.w.globals.series[opts.seriesIndex] + '%'
      }
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 150,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 200,
          },
        },
      },
    ],
  }

 /* 
<div className="rounded-sm border border-stroke dark:border-strokedark dark:bg-boxdark ">
            <section className=" border-2 rounded-lg p-4 ">
                <h2 className="txt-xl">Tickets</h2>
            </section>
        </div>
*/
  return (

    <div className="grid grid-cols-12 rounded-lg border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      
      <div className="col-span-12 m-1 items-center shadow-default bg-meta-2 dark:bg-boxdark sm:px-2 xl:col-span-4">   
        <div className="mt-3 flex flex-wrap items-center justify-center">
          <div className="flex items-center justify-center rounded-full ">
            {children}
          </div>

          <div className="py-3 w-full text-center ">
            <p className="text-title font-bold text-[#546e7a] dark:text-white">
              {title}
            </p>

            <span className="text-sm  font-medium">{total}</span>
          </div>
        </div>
      </div>

      <div className="col-span-12 p-1 shadow-default dark:bg-boxdark xl:col-span-8">
        <div className="flex flex-wrap h-full w-full items-top justify-center  dark:bg-meta-4">
          <ReactApexChart 
            width={"100%"}
            height={200} 
            options={options} 
            series={series} 
            type="radialBar" 
          />

          <div className="mx-0 w-full flex flex-wrap gap-y-1">
            <div className="w-full px-1">
              <div className="flex w-full items-left">
                <span className="mt-1 mr-2 block h-3 w-full max-w-3 rounded-full bg-[#39ff33]"></span>
                <p className="flex w-full justify-between text-xs font-medium dark:text-white">
                  <span> {lables[0]} </span>
                  <span> {Math.round((total * series[0]) / 100)} </span>
                </p>
              </div>
            </div>
            <div className="w-full px-1">
              <div className="flex w-full items-left">
                <span className="mt-1 mr-2 block h-3 w-full max-w-3 rounded-full bg-[#ff4f33]"></span>
                <p className="flex w-full justify-between text-xs font-medium dark:text-white">
                  <span> {lables[1]} </span>
                  <span> {Math.round((total * series[1]) / 100)} </span>
                </p>
              </div>
            </div>
          </div>
        </div> 
      </div>
    </div>
  );
};

export default SummaryChart;
