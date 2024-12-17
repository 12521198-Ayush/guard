"use client";
import dynamic from 'next/dynamic';

const BarChart = dynamic(() => import('@/components/Charts/BarChart'), { ssr: false });
const DonutChart = dynamic(() => import('@/components/Charts/DonutChart'), { ssr: false });
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import Groups2Icon from '@mui/icons-material/Groups2';

interface SubCategory {
    brand: string;
    total: number;
    inside: number;
    exit: number;
}

interface CategoryByStatus {
    name: string;
    total: number;
    inside: number;
    exit: number;
    breakup: SubCategory[];
}

interface VisitorStats {
    total: number;
    inside: number;
    exit: number;
    category: CategoryByStatus[];
}

interface TimeseriesVisitorStats {
    data: {date: string, series:{name: string, count: number}[]}[];
}


interface FormattedData {
    statusChart: {labels: string[], values: number[]};   
    visitorTypeStatusChart: {labels: string[], values: {name:string, data:number[]}[]};
    deliveryVendorStatusChart: {labels: string[], values: number[]}; 
    cabVendorsStatusChart: {labels: string[], values: number[]}; 
    guestTypeStatusChart: {labels: string[], values: number[]}; 
    timeseriesVisitorChart: {labels: string[], values: {name:string, data:number[]}[]};
}

function transformTicketStats(data: VisitorStats, timeseriesData: TimeseriesVisitorStats) {

    let lsExitData:number[] = [0, 0, 0];
    let lsInsideData:number[] = [0, 0, 0];    
    let lsCabVendorName:string[] = [];
    let lsCabVendorCount:number[] = [];
    let lsGuestTypeName:string[] = [];
    let lsGuestTypeCount:number[] = [];
    let lsDeliveryVendorName:string[] = [];
    let lsDeliveryVendorCount:number[] = [];

    for (let index = 0; index < data.category.length; index++) {
        const element = data.category[index];
        if(element.name.toLowerCase() == "cabs"){
            lsInsideData[0] = element.inside;
            lsExitData[0] = element.exit;
            
            for (let i = 0; i < element.breakup.length; i++) {
                const breakup = element.breakup[i];
                lsCabVendorName.push(breakup.brand);
                lsCabVendorCount.push(breakup.inside);
            }
        }
        else if(element.name.toLowerCase() == "delivery"){
            lsInsideData[1] = element.inside;
            lsExitData[1] = element.exit;

            for (let i = 0; i < element.breakup.length; i++) {
                const breakup = element.breakup[i];
                lsDeliveryVendorName.push(breakup.brand);
                lsDeliveryVendorCount.push(breakup.inside);
            }

        }
        else if(element.name.toLowerCase() == "guest"){
            lsInsideData[2] = element.inside;
            lsExitData[2] = element.exit;

            for (let i = 0; i < element.breakup.length; i++) {
                const breakup = element.breakup[i];
                lsGuestTypeName.push(breakup.brand);
                lsGuestTypeCount.push(breakup.inside);
            }
        }
    }

    let lsVisitorTypeStatusData = [
        { name: "Inside", data: lsInsideData} ,
        { name: "Exit", data: lsExitData}
    ];

    
    // Trasforming timeseries data
    let lsTSLabels:string[] = [];
    let lsTSCabsCount:number[] = [];
    let lsTSGuestsCount:number[] = [];
    let lsTSDeliveryCount:number[] = [];

    for (let index = 0; index < timeseriesData.data.length; index++) {
        const element = timeseriesData.data[index];
        lsTSLabels.push(element.date);

        for (let i = 0; i < element.series.length; i++) {
            const breakup = element.series[i];

            if(breakup.name.toLowerCase() == "cabs"){
                lsTSCabsCount.push(breakup.count);
            }
            else if(breakup.name.toLowerCase() == "delivery"){
                lsTSDeliveryCount.push(breakup.count);
            }
            else if(breakup.name.toLowerCase() == "guest"){
                lsTSGuestsCount.push(breakup.count);
            }
        }
    }

    let lsTSVisitorData = [
        { name: "Cabs", data: lsTSCabsCount} ,
        { name: "Delivery", data: lsTSDeliveryCount},
        { name: "Guests", data: lsTSGuestsCount}
    ];

    // Final data
    let _data: FormattedData = {
        statusChart: {labels: ["Inside", "Exit"], values: [data.inside, data.exit]},
        visitorTypeStatusChart: {labels: ["Cabs", "Delivery", "Guests"], values: lsVisitorTypeStatusData},
        deliveryVendorStatusChart:{labels: lsDeliveryVendorName, values: lsDeliveryVendorCount },
        cabVendorsStatusChart: {labels: lsCabVendorName, values: lsCabVendorCount}, 
        guestTypeStatusChart: {labels: lsGuestTypeName, values: lsGuestTypeCount},
        timeseriesVisitorChart: {labels: lsTSLabels, values: lsTSVisitorData}
    }

    return _data;
}

export default async function Visitors() {

    const [premiseId, setPremiseId] = useState("");
    const { data: session } = useSession();
    let accessToken = session?.user?.accessToken || undefined;

    const [visitorStats, setVisitorStats] = useState<FormattedData>();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (session?.user?.primary_premise_id) {
            setPremiseId(session.user.primary_premise_id);
        }
    }, [session?.user?.primary_premise_id]);

    useEffect(() => {
        if (premiseId) {
            loadData();
        }
    }, [premiseId,]);

    const loadData = async () => {
        setLoading(true);
        try {
            //await new Promise(resolve => setTimeout(resolve, 3000));
            const response = await axios.post(
                "http://139.84.166.124:8060/user-service/admin/dashboard/visitors/todays_breakup",
                {
                    premise_id: premiseId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            const { data } = response.data;
            
            const _response = await axios.post(
                "http://139.84.166.124:8060/user-service/admin/dashboard/visitors/weekly_breakup",
                {
                    premise_id: premiseId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            const _data = _response.data;
            console.log("TS --", _data);
            setVisitorStats(transformTicketStats(data, _data));

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    //await new Promise(resolve => setTimeout(resolve, 3000));

    return (
        <>
        <div className="my-6 rounded-lg border-2 grid grid-cols-1 md:grid-cols-1 xl:grid-cols-1 gap-0">
            <div className="p-3 w-full rounded-t-md border-b-2 bg-[#112040] flex gap-2 items-left text-bodydark1 ">
                
                <Groups2Icon fontSize="medium" />
                
                <p className="text-left text-title font-bold dark:text-white">
                    Visitors
                </p>
            </div>

            <div className="m-3 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
                <div className="col-span-12 p-3 sm:p-3 shadow-default xl:col-span-4 bg-white rounded-sm border border-stroke">
                    <DonutChart 
                        title='By Status' 
                        height={250}
                        series={visitorStats?.statusChart? visitorStats.statusChart.values: []}
                        lables={visitorStats?.statusChart? visitorStats.statusChart.labels: []}
                        color={["#FFCC66", "#99FF66"]}
                    />
                </div>
                <div className="col-span-12 p-3 sm:p-3 shadow-default xl:col-span-8 bg-white rounded-sm border border-stroke">
                    <BarChart 
                        title='Status By Visitor Type' 
                        height={220}
                        width={600}
                        stacked={true}
                        isHorizontal={true}
                        series={visitorStats?.visitorTypeStatusChart? visitorStats.visitorTypeStatusChart.values: []}
                        lables={visitorStats?.visitorTypeStatusChart? visitorStats.visitorTypeStatusChart.labels: []}
                        color={["#FFCC66", "#99FF66"]}
                    />
                </div>
                <div className="col-span-12 p-3 sm:p-3 shadow-default xl:col-span-4 bg-white rounded-sm border border-stroke">
                    <DonutChart 
                        title='Delivery Vendors Inside' 
                        height={250}
                        series={visitorStats?.deliveryVendorStatusChart? visitorStats.deliveryVendorStatusChart.values: []}
                        lables={visitorStats?.deliveryVendorStatusChart? visitorStats.deliveryVendorStatusChart.labels: []}
                        color={["#33CCFF", "#FFCC66", "#99FF66", "#ffb3ff", "#ffb3b3"]}
                    />
                </div>
                <div className="col-span-12 p-3 sm:p-3 shadow-default xl:col-span-4 bg-white rounded-sm border border-stroke">
                    <DonutChart 
                        title='Cabs Inside' 
                        height={250}
                        series={visitorStats?.cabVendorsStatusChart? visitorStats.cabVendorsStatusChart.values: []}
                        lables={visitorStats?.cabVendorsStatusChart? visitorStats.cabVendorsStatusChart.labels: []}
                        color={["#33CCFF", "#FFCC66", "#99FF66", "#ffb3ff", "#ffb3b3"]}
                    />
                </div>
                <div className="col-span-12 p-3 sm:p-3 shadow-default xl:col-span-4 bg-white rounded-sm border border-stroke">
                    <DonutChart 
                        title='Guests Inside' 
                        height={250}
                        series={visitorStats?.guestTypeStatusChart? visitorStats.guestTypeStatusChart.values: []}
                        lables={visitorStats?.guestTypeStatusChart? visitorStats.guestTypeStatusChart.labels: []}
                        color={["#33CCFF", "#FFCC66", "#99FF66"]}
                    />
                </div>

                <div className="col-span-12 p-3 sm:p-3 shadow-default xl:col-span-12 bg-white rounded-sm border border-stroke">
                    <BarChart 
                        title='Visitors Trend' 
                        height={220}
                        width={500}
                        stacked={true}
                        isHorizontal={false}
                        series={visitorStats?.timeseriesVisitorChart? visitorStats.timeseriesVisitorChart.values: []}
                        lables={visitorStats?.timeseriesVisitorChart? visitorStats.timeseriesVisitorChart.labels: []}
                        color={["#33CCFF", "#FFCC66", "#99FF66"]}
                    />
                </div>
            </div>
      </div>
      </>
    )

}

// color={["#FFCC66", "#33CCFF"]}