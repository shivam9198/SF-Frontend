export const dashboardMetrics = [
  {
    id: "totalCustomers",
    label: "Total Customers",
    value: 284,
    change: 8.4,
    trend: "up",
    tooltip: "Customers with active EMI accounts",
    key: "customers",
  },
  {
    id: "activeLoans",
    label: "Active Loans",
    value: 152,
    change: 3.1,
    trend: "up",
    tooltip: "Loans currently in repayment",
    key: "loans",
  },
  {
    id: "todayCollection",
    label: "EMI Collected Today",
    value: 184500,
    change: 12.7,
    trend: "up",
    tooltip: "Total EMI amount collected today",
    key: "collection",
  },
  {
    id: "pendingEmis",
    label: "Pending EMIs",
    value: 21,
    change: -4.2,
    trend: "down",
    tooltip: "Future EMIs that are scheduled but not yet paid",
    key: "pending",
  },
  {
    id: "overdueEmis",
    label: "Overdue EMIs",
    value: 9,
    change: 18.5,
    trend: "up",
    tooltip: "EMIs past the payment due date",
    key: "overdue",
  },
  {
    id: "collectionRate",
    label: "Collection Rate",
    value: 93.6,
    change: 1.9,
    trend: "up",
    tooltip: "Percentage of EMIs collected on time",
    key: "rate",
  },
];

export const collectionTrend = [
  { month: "Oct", current: 138000, previous: 124000 },
  { month: "Nov", current: 152000, previous: 136000 },
  { month: "Dec", current: 166000, previous: 148000 },
  { month: "Jan", current: 172500, previous: 160000 },
  { month: "Feb", current: 184500, previous: 172000 },
  { month: "Mar", current: 198000, previous: 183500 },
];

export const statusDistribution = [
  { name: "Paid", value: 68, color: "#0ea5e9" },
  { name: "Pending", value: 22, color: "#f59e0b" },
  { name: "Overdue", value: 10, color: "#ef4444" },
];

export const recentPayments = [
  {
    id: "P-001",
    customer: "Riya Shah",
    amount: 5200,
    date: "2026-05-30",
    method: "UPI",
    status: "Received",
  },
  {
    id: "P-002",
    customer: "Amit Patel",
    amount: 3100,
    date: "2026-05-30",
    method: "Cash",
    status: "Pending",
  },
  {
    id: "P-003",
    customer: "Sneha Kapoor",
    amount: 4300,
    date: "2026-05-29",
    method: "Card",
    status: "Received",
  },
  {
    id: "P-004",
    customer: "Rohit Verma",
    amount: 2700,
    date: "2026-05-29",
    method: "UPI",
    status: "Received",
  },
  {
    id: "P-005",
    customer: "Priya Singh",
    amount: 3600,
    date: "2026-05-28",
    method: "Cash",
    status: "Failed",
  },
  {
    id: "P-006",
    customer: "Karan Mehta",
    amount: 4100,
    date: "2026-05-28",
    method: "Card",
    status: "Pending",
  },
];

export const upcomingDues = [
  {
    id: "D-001",
    customer: "Amit Patel",
    dueDate: "2026-06-05",
    amount: 3100,
    daysLeft: 2,
  },
  {
    id: "D-002",
    customer: "Sneha Kapoor",
    dueDate: "2026-06-07",
    amount: 4300,
    daysLeft: 4,
  },
  {
    id: "D-003",
    customer: "Rohit Verma",
    dueDate: "2026-06-09",
    amount: 2700,
    daysLeft: 6,
  },
];

export const overdueAlerts = [
  {
    id: "O-001",
    customer: "Priya Singh",
    overdueAmount: 15200,
    daysOverdue: 8,
  },
  {
    id: "O-002",
    customer: "Manish Gupta",
    overdueAmount: 8400,
    daysOverdue: 5,
  },
  { id: "O-003", customer: "Neha Reddy", overdueAmount: 10800, daysOverdue: 3 },
];

export const quickActions = [
  {
    id: "A-001",
    title: "Add Customer",
    description: "Register a new borrower quickly.",
    action: "Add",
    path: "/customers/new",
  },
  {
    id: "A-002",
    title: "Create Loan",
    description: "Set up a new EMI loan plan.",
    action: "Create",
    path: "/loans/new",
  },
  {
    id: "A-003",
    title: "Record Payment",
    description: "Log a received payment in seconds.",
    action: "Record",
    path: "/payments/new",
  },
  {
    id: "A-004",
    title: "View Analytics",
    description: "Open the latest financial reports.",
    action: "View",
    path: "/reports",
    adminOnly: true,
  },
  {
    id: "A-005",
    title: "View Overdue",
    description: "Find customers with pending EMI.",
    action: "Overdue",
    path: "/overdue",
  },
  {
    id: "A-006",
    title: "View Customers",
    description: "Open customer list.",
    action: "Customers",
    path: "/customers",
  },
];
