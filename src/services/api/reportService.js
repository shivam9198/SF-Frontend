import { customerService } from './customerService';
import { loanService } from './loanService';
import { paymentService } from './paymentService';

// Helper to check if a date is within a range
const isWithinRange = (dateString, filter) => {
    if (filter === 'All Time' || !filter) return true;
    
    const d = new Date(dateString);
    const today = new Date();
    
    if (filter === 'Today') {
        return d.toDateString() === today.toDateString();
    }
    if (filter === 'This Month') {
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }
    if (filter === 'This Year') {
        return d.getFullYear() === today.getFullYear();
    }
    return true; // Simplified for this demo
};

export const reportService = {
    getAnalyticsOverview: async (dateFilter = 'All Time') => {
        const [loans, payments] = await Promise.all([
            loanService.getAllLoans(),
            paymentService.getPayments()
        ]);

        const filteredPayments = payments.filter(p => isWithinRange(p.paymentDate, dateFilter));
        const filteredLoans = loans.filter(l => isWithinRange(l.purchaseDate, dateFilter));

        const totalCollection = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
        const loansCreated = filteredLoans.length;
        const activeLoans = loans.filter(l => l.outstandingBalance > 0).length; // Active at current time regardless of filter
        const activeCustomers = new Set(loans.filter(l => l.outstandingBalance > 0).map(l => l.customerId)).size;
        
        const totalLoanAmountIssued = filteredLoans.reduce((sum, l) => sum + l.loanAmount, 0);
        const outstandingAmount = loans.reduce((sum, l) => sum + l.outstandingBalance, 0);

        // Simple mock calculations for growth (compare vs static mock previous period)
        return {
            totalCollection,
            totalCollectionGrowth: 14.5,
            loansCreated,
            loansCreatedGrowth: 8.2,
            activeLoans,
            activeLoansGrowth: 2.1,
            activeCustomers,
            outstandingAmount,
            outstandingAmountGrowth: -3.4,
            collectionRate: totalLoanAmountIssued ? ((totalCollection / totalLoanAmountIssued) * 100).toFixed(1) : 0,
            overdueAmount: loans.reduce((sum, l) => sum + (l.outstandingBalance > 0 ? l.monthlyEmi : 0), 0) * 0.15, // Mock 15% is overdue
        };
    },

    getCollectionAnalytics: async (dateFilter = 'All Time') => {
        const payments = await paymentService.getPayments();
        
        // Mock Monthly Trend based on real payment data if available, else fallback
        const monthlyTrend = [
            { name: 'Jan', current: 40000, previous: 35000 },
            { name: 'Feb', current: 45000, previous: 38000 },
            { name: 'Mar', current: 52000, previous: 41000 },
            { name: 'Apr', current: 48000, previous: 44000 },
            { name: 'May', current: 61000, previous: 47000 },
            { name: 'Jun', current: 65000, previous: 52000 },
        ];

        return monthlyTrend;
    },

    getLoanAnalytics: async (dateFilter = 'All Time') => {
        const loans = await loanService.getAllLoans();
        const filteredLoans = loans.filter(l => isWithinRange(l.purchaseDate, dateFilter));
        
        const active = filteredLoans.filter(l => l.outstandingBalance > 0).length;
        const closed = filteredLoans.filter(l => l.outstandingBalance === 0).length;
        const overdue = Math.floor(active * 0.2); // mock 20% overdue

        return {
            statusDistribution: [
                { name: 'Active', value: active - overdue },
                { name: 'Closed', value: closed },
                { name: 'Overdue', value: overdue }
            ]
        };
    },

    getPaymentAnalytics: async (dateFilter = 'All Time') => {
        const payments = await paymentService.getPayments();
        const filteredPayments = payments.filter(p => isWithinRange(p.paymentDate, dateFilter));

        const methodCounts = filteredPayments.reduce((acc, p) => {
            acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + 1;
            return acc;
        }, {});

        // Format for donut chart
        return Object.keys(methodCounts).map(key => ({
            name: key,
            value: methodCounts[key]
        }));
    },

    getRecoveryAnalytics: async (dateFilter = 'All Time') => {
        // Mock recovery data
        return {
            recoveryRate: 85,
            daysOverdueBreakdown: [
                { name: '1-15 Days', value: 45 },
                { name: '16-30 Days', value: 30 },
                { name: '31-60 Days', value: 15 },
                { name: '60+ Days', value: 10 },
            ],
            riskDistribution: [
                { name: 'Low Risk', value: 60 },
                { name: 'Medium Risk', value: 25 },
                { name: 'High Risk', value: 15 },
            ]
        };
    },

    getStaffAnalytics: async (dateFilter = 'All Time') => {
        const payments = await paymentService.getPayments();
        const filteredPayments = payments.filter(p => isWithinRange(p.paymentDate, dateFilter));

        const staffMap = {};
        filteredPayments.forEach(p => {
            if (!staffMap[p.collectedBy]) {
                staffMap[p.collectedBy] = { name: p.collectedBy, amount: 0, count: 0 };
            }
            staffMap[p.collectedBy].amount += p.amount;
            staffMap[p.collectedBy].count += 1;
        });

        const leaderboard = Object.values(staffMap).sort((a, b) => b.amount - a.amount);
        
        return leaderboard;
    },
    
    getTopCustomers: async (dateFilter = 'All Time') => {
        const customers = await customerService.getCustomers();
        const loans = await loanService.getAllLoans();
        
        const customerStats = customers.map(c => {
            const cloans = loans.filter(l => l.customerId === c.id);
            const totalLoans = cloans.length;
            const outstandingAmount = cloans.reduce((sum, l) => sum + l.outstandingBalance, 0);
            const totalPaid = cloans.reduce((sum, l) => sum + (l.loanAmount - l.outstandingBalance), 0);
            
            return {
                id: c.id,
                name: c.name,
                totalLoans,
                totalPaid,
                outstandingAmount,
                collectionScore: totalLoans ? Math.round((totalPaid / (totalPaid + outstandingAmount)) * 100) : 0
            };
        }).sort((a, b) => b.totalPaid - a.totalPaid).slice(0, 5);

        return customerStats;
    },

    getRecentCollections: async (dateFilter = 'All Time') => {
        const payments = await paymentService.getPayments();
        return payments
            .filter(p => isWithinRange(p.paymentDate, dateFilter))
            .slice(0, 8);
    },

    getPendingPayments: async () => {
        const [schedules, loans] = await Promise.all([
            loanService.getAllSchedules(),
            loanService.getAllLoans()
        ]);

        return schedules
            .filter(s => s.status !== 'Paid')
            .map(schedule => {
                const loan = loans.find(l => l.id === schedule.loanId);
                return {
                    ...schedule,
                    customerId: loan?.customerId,
                    customerName: loan?.customerName || schedule.customerName,
                    phone: loan?.phone,
                    outstandingAmount: loan?.outstandingBalance || schedule.amount
                };
            })
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 8);
    }
};
