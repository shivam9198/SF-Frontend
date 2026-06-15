export const customers = [
  {
    id: "C-001",
    name: "Riya Shah",
    phone: "987 654 3210",
    status: "Active",
    outstanding: 12500,
  },
  {
    id: "C-002",
    name: "Amit Patel",
    phone: "981 234 5678",
    status: "Overdue",
    outstanding: 8200,
  },
  {
    id: "C-003",
    name: "Sneha Kapoor",
    phone: "984 321 0987",
    status: "Active",
    outstanding: 15400,
  },
];

export const loans = [
  {
    id: "L-101",
    borrower: "Riya Shah",
    amount: 50000,
    tenure: "24 months",
    status: "Approved",
  },
  {
    id: "L-102",
    borrower: "Amit Patel",
    amount: 26000,
    tenure: "12 months",
    status: "Pending",
  },
];

export const payments = [
  {
    id: "P-901",
    customer: "Riya Shah",
    amount: 3200,
    date: "2026-05-10",
    status: "Received",
  },
  {
    id: "P-902",
    customer: "Amit Patel",
    amount: 1800,
    date: "2026-05-08",
    status: "Pending",
  },
];

export const dashboardSummary = {
  totalCustomers: 86,
  activeLoans: 52,
  overdueAccounts: 6,
  monthlyCollection: 321400,
};
