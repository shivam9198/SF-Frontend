import { loanService } from './loanService';

const mockNotes = {};
const mockFollowUps = {};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const calculateDaysOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = Math.abs(today - due);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getRiskLevel = (days) => {
    if (days >= 60) return 'Critical';
    if (days >= 31) return 'High Risk';
    if (days >= 8) return 'Medium Risk';
    return 'Low Risk';
};

export const overdueService = {
    getOverdueAccounts: async () => {
        await delay(500);
        const allSchedules = await loanService.getAllSchedules();
        const overdueSchedules = allSchedules.filter(s => s.status === 'Overdue');
        
        const loans = await loanService.getAllLoans();
        
        return overdueSchedules.map(emi => {
            const loan = loans.find(l => l.id === emi.loanId);
            const daysOverdue = calculateDaysOverdue(emi.dueDate);
            const riskLevel = getRiskLevel(daysOverdue);
            const outstandingAmount = loan?.outstandingBalance || emi.amount;
            
            return {
                id: `${emi.loanId}-${emi.emiNumber}`,
                loanId: emi.loanId,
                customerName: loan?.customerName,
                customerId: loan?.customerId,
                phone: loan?.phone,
                emiNumber: emi.emiNumber,
                dueDate: emi.dueDate,
                daysOverdue,
                amount: emi.amount,
                outstandingAmount,
                riskLevel,
                assignedStaff: 'Unassigned',
                lastContactDate: null
            };
        });
    },

    getOverdueDetails: async (loanId) => {
        await delay(500);
        const loans = await loanService.getAllLoans();
        const loan = loans.find(l => l.id === loanId);
        if (!loan) throw new Error('Loan not found');
        
        const schedule = await loanService.getEmiSchedule(loanId);
        const overdueEmis = schedule.filter(s => s.status === 'Overdue');
        
        const totalOverdueAmount = overdueEmis.reduce((sum, e) => sum + e.amount, 0);
        const daysOverdue = overdueEmis.length > 0 ? calculateDaysOverdue(overdueEmis[0].dueDate) : 0;
        const riskLevel = getRiskLevel(daysOverdue);

        return {
            loan,
            overdueEmis,
            totalOverdueAmount,
            daysOverdue,
            riskLevel,
            notes: mockNotes[loanId] || [],
            followUps: mockFollowUps[loanId] || [],
            recentPayments: schedule.filter(s => s.status === 'Paid').slice(-3) // last 3 payments
        };
    },

    addRecoveryNote: async (loanId, noteText) => {
        await delay(300);
        if (!mockNotes[loanId]) mockNotes[loanId] = [];
        const note = {
            id: Date.now().toString(),
            text: noteText,
            date: new Date().toISOString(),
            staff: 'Current Agent'
        };
        mockNotes[loanId].unshift(note);
        return note;
    },

    createFollowUp: async (loanId, followUpData) => {
        await delay(300);
        if (!mockFollowUps[loanId]) mockFollowUps[loanId] = [];
        const followUp = {
            id: Date.now().toString(),
            ...followUpData,
            createdAt: new Date().toISOString(),
            staff: 'Current Agent'
        };
        mockFollowUps[loanId].unshift(followUp);
        return followUp;
    },

    getRecoveryAnalytics: async () => {
        await delay(400);
        const accounts = await overdueService.getOverdueAccounts();
        
        const riskDistribution = {
            'Low Risk': 0,
            'Medium Risk': 0,
            'High Risk': 0,
            'Critical': 0
        };
        
        let totalOverdueAmount = 0;
        
        accounts.forEach(acc => {
            riskDistribution[acc.riskLevel]++;
            totalOverdueAmount += acc.amount;
        });

        return {
            totalAccounts: accounts.length,
            totalOverdueAmount,
            criticalAccounts: riskDistribution['Critical'],
            averageDaysOverdue: accounts.length ? Math.round(accounts.reduce((sum, acc) => sum + acc.daysOverdue, 0) / accounts.length) : 0,
            recoveryRate: 65, // mock %
            collectedThisWeek: 125000, // mock amt
            riskDistribution
        };
    }
};
