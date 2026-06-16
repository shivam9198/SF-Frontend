import {
  MdDashboard,
  MdPeople,
  MdBusinessCenter,
  MdSchedule,
  MdPayments,
  MdWarning,
  MdBarChart,
  MdGroups,
} from "react-icons/md";

export const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: MdDashboard },
  { label: "Customers", path: "/customers", icon: MdPeople },
  { label: "Loans", path: "/loans", icon: MdBusinessCenter },
  { label: "EMI Schedule", path: "/emi-schedule", icon: MdSchedule },
  { label: "Payments", path: "/payments", icon: MdPayments },
  { label: "Overdue Tracker", path: "/overdue", icon: MdWarning },
  { label: "Reports", path: "/reports", icon: MdBarChart, adminOnly: true },
  { label: "Staff", path: "/staff", icon: MdGroups, adminOnly: true },
];
