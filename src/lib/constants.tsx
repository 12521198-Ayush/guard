import {
  ScanLine,
  Search,
  FileClock,
  ShieldCheck,
  Briefcase,
  IdCard,
  UploadCloud,
  Settings,
  UserCircle,
  PhoneCall,
  CarFront,
  ScrollText,
  Clock3,
  CheckCircle2,
  XCircle,
  LogOut,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  Timer,
  CircleX,
} from 'lucide-react'

export const menuItems = [
  { icon: ScanLine, label: 'Pub Sub Scan', color: 'text-blue-700', path: '/pub-sub-scan' },
  { icon: Search, label: 'Search Vehicle', color: 'text-green-700', path: '/search-vehicle' },
  { icon: FileClock, label: 'Helpers Logs', color: 'text-purple-700', path: '/helpers-logs' },
  { icon: ShieldCheck, label: 'Verify Luggage', color: 'text-red-600', path: '/verify-luggage' },
  { icon: Briefcase, label: 'Helper Employment', color: 'text-yellow-600', path: '/helper-employment' },
  { icon: IdCard, label: 'IdCard Tagger', color: 'text-indigo-600', path: '/idcard-tagger' },
  { icon: UploadCloud, label: 'Sync Attendance', color: 'text-teal-600', path: '/sync-attendance' },
  { icon: Settings, label: 'More Setting', color: 'text-gray-700', path: '/settings' },
];


export const guestList = [
     {
    name: 'Rahul Verma',
    phone: '9876543210',
    purpose: 'Food Delivery',
    vehicleType: 'Bike',
    reason: 'Zomato Order #2342',
    status: 'Waiting',
  },
  {
    name: 'Amit Singh',
    phone: '9123456789',
    purpose: 'Guest Visit',
    vehicleType: 'Car',
    reason: 'Meeting resident',
    status: 'Approved',
  },
  {
    name: 'Deepa Mehta',
    phone: '9988776655',
    purpose: 'Courier',
    vehicleType: 'None',
    reason: 'Document drop-off',
    status: 'Rejected',
  },
  {
    name: 'Kunal Jain',
    phone: '8899776655',
    purpose: 'Friend Visit',
    vehicleType: 'Scooter',
    reason: 'Birthday celebration',
    status: 'Exited',
  },
  {
    name: 'Sana Shaikh',
    phone: '9012345678',
    purpose: 'Delivery',
    vehicleType: 'Bike',
    reason: 'Swiggy Package #5566',
    status: 'Waiting',
  },
  {
    name: 'Ravi Kumar',
    phone: '8800123456',
    purpose: 'Repair',
    vehicleType: 'Van',
    reason: 'AC service',
    status: 'Approved',
  },
]

export const statusTabs = ['All', 'Approved', 'Waiting', 'Rejected','Exited']

export const statusIcon: Record<string, any> = {
    Approved: CircleCheck,
    Waiting: Timer,
    Rejected: CircleX,
}

export const statusStyles: Record<string, string> = {
    Approved: 'bg-green-100 text-green-700',
    Waiting: 'bg-yellow-100 text-yellow-700',
    Rejected: 'bg-pink-100 text-pink-700',
}
