import api from "./axios";

const calculateDaysOverdue = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = Math.abs(today - due);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getRiskLevel = (days) => {
  if (days >= 60) return "Critical";
  if (days >= 31) return "High Risk";
  if (days >= 8) return "Medium Risk";
  return "Low Risk";
};

// Memory fallback for mock Notes/FollowUps
const memoryNotes = {};
const memoryFollowUps = {};

export const overdueService = {
  getOverdueAccounts: async () => {
    const loansRes = await api.get("/loans");
    const loansData =
      loansRes.data?.loans || loansRes.data?.data || loansRes.data;
    const loans = Array.isArray(loansData) ? loansData : [];

    const overdueAccounts = [];

    const promises = loans.map(async (loan) => {
      try {
        const id = loan._id || loan.id;
        const res = await api.get(`/loans/${id}/installments`);
        const data = res.data?.data || res.data;
        const insts = Array.isArray(data) ? data : data?.installments || [];

        const overdueEmis = insts.filter((inst) => inst.status === "Overdue");

        let customerObj = loan.customer;
        if (
          !customerObj &&
          loan.customerId &&
          typeof loan.customerId === "object"
        ) {
          customerObj = loan.customerId;
        }
        const cName =
          customerObj?.fullName ||
          customerObj?.name ||
          loan.customerName ||
          "Unknown";
        const cPhone = customerObj?.phone || loan.phone || "N/A";
        const cId =
          customerObj?._id || customerObj?.id || loan.customerId || "Unknown";
        const displayLoanId = `LOAN-${String(id).slice(-6).toUpperCase()}`;

        for (const emi of overdueEmis) {
          const daysOverdue = calculateDaysOverdue(emi.dueDate);
          const riskLevel = getRiskLevel(daysOverdue);
          const outstandingAmount = loan.outstandingBalance || emi.amount;

          overdueAccounts.push({
            id: `${id}-${emi.emiNumber}`,
            loanId: displayLoanId,
            rawLoanId: id,
            customerName: cName,
            customerId: cId,
            phone: cPhone,
            emiNumber: emi.emiNumber,
            dueDate: emi.dueDate,
            daysOverdue,
            amount: emi.amount,
            outstandingAmount,
            riskLevel,
            assignedStaff: "Unassigned",
            lastContactDate: null,
          });
        }
      } catch (e) {
        console.error(
          `Failed to fetch installments for loan ${loan._id || loan.id}`,
          e,
        );
      }
    });

    await Promise.all(promises);
    return overdueAccounts;
  },

  getOverdueDetails: async (loanId) => {
    const loansRes = await api.get("/loans");
    const loansData =
      loansRes.data?.loans || loansRes.data?.data || loansRes.data;
    const loans = Array.isArray(loansData) ? loansData : [];

    const loan = loans.find((l) => {
      const idStr = String(l._id || l.id);
      return (
        idStr === loanId || `LOAN-${idStr.slice(-6).toUpperCase()}` === loanId
      );
    });

    if (!loan) throw new Error("Loan not found");
    const id = loan._id || loan.id;

    const res = await api.get(`/loans/${id}/installments`);
    const data = res.data?.data || res.data;
    const schedule = Array.isArray(data) ? data : data?.installments || [];

    const overdueEmis = schedule.filter((s) => s.status === "Overdue");
    const totalOverdueAmount = overdueEmis.reduce(
      (sum, e) => sum + e.amount,
      0,
    );
    const daysOverdue =
      overdueEmis.length > 0 ? calculateDaysOverdue(overdueEmis[0].dueDate) : 0;
    const riskLevel = getRiskLevel(daysOverdue);

    let customerObj = loan.customer;
    if (
      !customerObj &&
      loan.customerId &&
      typeof loan.customerId === "object"
    ) {
      customerObj = loan.customerId;
    }

    const normalizedLoan = {
      ...loan,
      customerName:
        customerObj?.fullName ||
        customerObj?.name ||
        loan.customerName ||
        "Unknown",
      phone: customerObj?.phone || loan.phone || "N/A",
      customerId:
        customerObj?._id || customerObj?.id || loan.customerId || "Unknown",
      productName: loan.productName || "Personal Loan",
      monthlyEmi:
        overdueEmis.length > 0 ? overdueEmis[0].amount : loan.emiAmount || 0,
      months: loan.totalInstallments || loan.months || schedule.length,
    };

    return {
      loan: normalizedLoan,
      overdueEmis,
      totalOverdueAmount,
      daysOverdue,
      riskLevel,
      notes: memoryNotes[id] || [],
      followUps: memoryFollowUps[id] || [],
      recentPayments: schedule.filter((s) => s.status === "Paid").slice(-3),
    };
  },

  addRecoveryNote: async (loanId, noteText) => {
    if (!memoryNotes[loanId]) memoryNotes[loanId] = [];
    const note = {
      id: Date.now().toString(),
      text: noteText,
      date: new Date().toISOString(),
      staff: "Current Agent",
    };
    memoryNotes[loanId].unshift(note);
    return note;
  },

  createFollowUp: async (loanId, followUpData) => {
    if (!memoryFollowUps[loanId]) memoryFollowUps[loanId] = [];
    const followUp = {
      id: Date.now().toString(),
      ...followUpData,
      createdAt: new Date().toISOString(),
      staff: "Current Agent",
    };
    memoryFollowUps[loanId].unshift(followUp);
    return followUp;
  },

  getRecoveryAnalytics: async () => {
    const accounts = await overdueService.getOverdueAccounts();

    const riskDistribution = {
      "Low Risk": 0,
      "Medium Risk": 0,
      "High Risk": 0,
      Critical: 0,
    };

    let totalOverdueAmount = 0;

    accounts.forEach((acc) => {
      riskDistribution[acc.riskLevel]++;
      totalOverdueAmount += acc.amount;
    });

    return {
      totalAccounts: accounts.length,
      totalOverdueAmount,
      criticalAccounts: riskDistribution["Critical"],
      averageDaysOverdue: accounts.length
        ? Math.round(
            accounts.reduce((sum, acc) => sum + acc.daysOverdue, 0) /
              accounts.length,
          )
        : 0,
      recoveryRate: 65, // Computed frontend mock since no history backend exists
      collectedThisWeek: 0, // Computed frontend mock since no history backend exists
      riskDistribution,
    };
  },
};
