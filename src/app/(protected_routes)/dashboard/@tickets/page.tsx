"use client";
import dynamic from 'next/dynamic';

const BarChart = dynamic(() => import('@/components/Charts/BarChart'), { ssr: false });
const DonutChart = dynamic(() => import('@/components/Charts/DonutChart'), { ssr: false });
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import Groups2Icon from '@mui/icons-material/Groups2';


interface SkillPreview {
    skill: string;
    total: number;
    normal: number;
    emergency: number;
}

interface TicketStatus {
    name: string;
    total: number;
    normal: number;
    emergency: number;
    breakup: SkillPreview[];
}

interface TicketStats {
    total: number;
    normal: number;
    emergency: number;
    state: TicketStatus[];
}

interface FormattedData {
    statusChart: {labels: string[], values: number[]};   
    criticalityChart: {labels: string[], values: number[]};
    criticalityStatusChart: {labels: string[], values: {name:string, data:number[]}[]};
    skillStatusChart: {labels: string[], values: {name:string, data:number[]}[]};
}

function transformTicketStats(data: TicketStats) {

    let inProgCount:number = 0;
    let parkedCount:number = 0;
    let pendingCount:number = 0;
    let lsNormalData:number[] = [0, 0, 0];
    let lsEmergencyData:number[] = [0, 0, 0];
    let lsSkillsLabel:string[] = [];
    let lsInProgSkillData:number[] = [];
    let lsParkedSkillData:number[] = [];
    let lsPendingSkillData:number[] = [];

    for (let index = 0; index < data.state.length; index++) {
        const element = data.state[index];
        if(element.name.toLowerCase() == "in_progress"){
            inProgCount = element.total;
            lsNormalData[0] = element.normal;
            lsEmergencyData[0] = element.emergency;

            for (let i = 0; i < element.breakup.length; i++) {
                const breakup = element.breakup[i];
                lsInProgSkillData.push(breakup.total);

                if(!lsSkillsLabel.includes(breakup.skill)){
                    lsSkillsLabel.push(breakup.skill);
                }
                else{
                    let idx = lsSkillsLabel.indexOf(breakup.skill);
                    if(i != idx){
                        console.log("Mismatch");
                    }
                }
            }
        }
        else if(element.name.toLowerCase() == "parked"){
            parkedCount = element.total;
            lsNormalData[1] = element.normal;
            lsEmergencyData[1] = element.emergency;

            for (let i = 0; i < element.breakup.length; i++) {
                const breakup = element.breakup[i];
                lsParkedSkillData.push(breakup.total);

                if(!lsSkillsLabel.includes(breakup.skill)){
                    lsSkillsLabel.push(breakup.skill);
                }
                else{
                    let idx = lsSkillsLabel.indexOf(breakup.skill);
                    if(i != idx){
                        console.log("Mismatch");
                    }
                }
            }
        }
        else if(element.name.toLowerCase() == "pending"){
            pendingCount = element.total;
            lsNormalData[2] = element.normal;
            lsEmergencyData[2] = element.emergency;

            for (let i = 0; i < element.breakup.length; i++) {
                const breakup = element.breakup[i];
                lsPendingSkillData.push(breakup.total);

                if(!lsSkillsLabel.includes(breakup.skill)){
                    lsSkillsLabel.push(breakup.skill);
                }
                else{
                    let idx = lsSkillsLabel.indexOf(breakup.skill);
                    if(i != idx){
                        console.log("Mismatch");
                    }
                }
            }
        }
    }

    let lsCriticalityStatusData = [
        { name: "Normal", data: lsNormalData} ,
        { name: "Emergency", data: lsEmergencyData}
    ];

    let lsSkillStatusData = [
        { name: "In Progress", data: lsInProgSkillData} ,
        { name: "Parked", data: lsParkedSkillData} ,
        { name: "Pending", data: lsPendingSkillData}
    ]

    let _data: FormattedData = {
        statusChart: {labels: ["In Progres", "Parked", "Pending"], values: [inProgCount, parkedCount, pendingCount]},
        criticalityChart: {labels: ["Emergency", "Normal"], values: [data.emergency, data.normal]},
        criticalityStatusChart: {labels: ["In Progres", "Parked", "Pending"], values: lsCriticalityStatusData},
        skillStatusChart: {labels: lsSkillsLabel, values: lsSkillStatusData},
    }

    return _data;
}


export default function Tickets() {

    const [premiseId, setPremiseId] = useState("");
    const { data: session } = useSession();
    let accessToken = session?.user?.accessToken || undefined;

    const [ticketStats, setTicketStats] = useState<FormattedData>();
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
            //await new Promise(resolve => setTimeout(resolve, 5000));
            const response = await axios.post(
                "http://139.84.166.124:8060/user-service/admin/dashboard/open_tickets",
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
            console.log("Ticket -->", data);
            setTicketStats(transformTicketStats(data));
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="my-6 rounded-lg border-2 grid grid-cols-1 md:grid-cols-1 xl:grid-cols-1 gap-0">
            <div className="p-3 w-full rounded-t-md border-b-2 bg-[#112040] flex gap-2 items-left text-bodydark1 ">                
                <Groups2Icon fontSize="medium" />
                <p className="text-left text-title font-bold dark:text-white">
                    Open Tickets
                </p>
            </div>

            <div className="m-3 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
                <div className="col-span-12 p-3 sm:p-3 shadow-default xl:col-span-4 bg-white rounded-sm border border-stroke">
                    <DonutChart 
                        title='By Status' 
                        height={250}
                        series={ticketStats?.statusChart? ticketStats.statusChart.values: []}
                        lables={ticketStats?.statusChart? ticketStats.statusChart.labels: []}
                        color={["#99FF66", "#33CCFF", "#FFCC66"]}
                    />
                </div>
                <div className="col-span-12 p-3 sm:p-3 shadow-default xl:col-span-4 bg-white rounded-sm border border-stroke">
                    <DonutChart 
                        title='By Criticality' 
                        height={250}
                        series={ticketStats?.criticalityChart? ticketStats.criticalityChart.values: []}
                        lables={ticketStats?.criticalityChart? ticketStats.criticalityChart.labels: []}
                        color={["#FFCC66", "#33CCFF"]}
                    />
                </div>
                <div className="col-span-12 p-3 sm:p-3 shadow-default xl:col-span-4 bg-white rounded-sm border border-stroke">
                    <BarChart 
                        title='Criticality By Status' 
                        height={220}
                        width="100%"
                        stacked={true}
                        isHorizontal={false}
                        series={ticketStats?.criticalityStatusChart? ticketStats.criticalityStatusChart.values: []}
                        lables={ticketStats?.criticalityStatusChart? ticketStats.criticalityStatusChart.labels: []}
                        color={["#33CCFF", "#FFCC66"]}
                    />
                </div>
                <div className="col-span-12 p-3 sm:p-3 shadow-default xl:col-span-12 bg-white rounded-sm border border-stroke">
                    <BarChart 
                        title='Skill Wsie Status' 
                        height={220}
                        width={600}
                        stacked={true}
                        isHorizontal={false}
                        series={ticketStats?.skillStatusChart? ticketStats.skillStatusChart.values: []}
                        lables={ticketStats?.skillStatusChart? ticketStats.skillStatusChart.labels: []}
                        color={["#99FF66", "#33CCFF", "#FFCC66"]}
                    />
                </div>
            </div>
      </div>
    )

}
