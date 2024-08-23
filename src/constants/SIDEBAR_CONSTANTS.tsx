import { BsHouseDoor, BsQuestionCircle, BsGear, BsEnvelope, BsListUl, BsKanban } from "react-icons/bs";
import { SideNavItemGroup } from "@/type/types";

export const SIDENAV_ITEMS: SideNavItemGroup[] = [
    {
        title: "Dashboard",
        menuList: [
            {
                title:"Dashboard",
                path:"/dashboard",
                icon:<BsHouseDoor size={20} />
            }
        ]
    },
    {
        title: "Manage",
        menuList: [
            {
                title:"Flats",
                path:"/dashboard/flats",
                icon:<BsKanban size={20} />,
                submenu:true,
                subMenuItems: [
                    {title:"All", path:"/flats"},
                    {title:"New", path:"/flats/new"},
                ]
            },
            {
                title:"Orders",
                path:"/orders",
                icon:<BsListUl size={20} />
            },
            {
                title:"Feedbacks",
                path:"/feedbacks",
                icon:<BsEnvelope size={20} />
            }
        ]
    },
    {
        title: "Others",
        menuList: [
            {
                title:"Account",
                path:"/account",
                icon:<BsGear size={20} />
            },
            {
                title:"Help",
                path:"/help",
                icon:<BsQuestionCircle size={20} />
            }
        ]
    }
]

