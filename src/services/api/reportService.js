import { customerService } from './customerService';
import { loanService } from './loanService';
import { paymentService } from './paymentService';
import { staffService } from './staffService';

const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();

const isThisWeek = (d) => {
    const today = new Date();
    const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
    const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    firstDay.setHours(0, 0, 0, 0);
    lastDay.setHours(23, 59, 59, 999);
    return d >= firstDay && d <= lastDay;
};

const isThisMonth = (d) => {
    const today = new Date();
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
};

export const reportService = {
    getCollectionReport: async () => {
        const payments = await paymentService.getPayments();
        
        let today = 0, thisWeek = 0, thisMonth = 0, total = 0;
        const now = new Date();
        
        payments.forEach(p => {
            if (p.status !== 'Completed') return;
            const d = new Date(p.paymentDate);
            total += p.amount;
            if (isSameDay(d, now)) today += p.amount;
            if (isThisWeek(d)) thisWeek += p.amount;
            if (isThisMonth(d)) thisMonth += p.amount;
        });

        return { today, thisWeek, thisMonth, total };
    },

    getLoanReport: async () => {
        const loans = await loanService.getAllLoans();
        
        const totalLoans = loans.length;
        const activeLoans = loans.filter(l => l.outstandingBalance > 0).length;
        const closedLoans = loans.filter(l => l.outstandingBalance === 0).length;
        const totalLoanAmount = loans.reduce((sum, l) => sum + l.loanAmount, 0);
        const outstandingAmount = loans.reduce((sum, l) => sum + l.outstandingBalance, 0);

        return { totalLoans, activeLoans, closedLoans, totalLoanAmount, outstandingAmount };
    },

    getEmiReport: async () => {
        const schedules = await loanService.getAllSchedules();
        
        const totalEmis = schedules.length;
        const paidEmis = schedules.filter(s => s.status === 'Paid').length;
        const pendingEmis = schedules.filter(s => s.status === 'Pending').length;
        const overdueEmis = schedules.filter(s => s.status === 'Overdue').length;

        return { totalEmis, paidEmis, pendingEmis, overdueEmis };
    },

    getCustomerReport: async () => {
        const customers = await customerService.getCustomers();
        const loans = await loanService.getAllLoans();
        const schedules = await loanService.getAllSchedules();

        const totalCustomers = customers.length;
        
        const activeCustomerIds = new Set(loans.filter(l => l.outstandingBalance > 0).map(l => l.customerId));
        const customersWithActiveLoans = activeCustomerIds.size;

        const overdueLoanIds = new Set(schedules.filter(s => s.status === 'Overdue').map(s => s.loanId));
        const overdueCustomerIds = new Set(loans.filter(l => overdueLoanIds.has(l.id)).map(l => l.customerId));
        const customersWithOverdueEmis = overdueCustomerIds.size;

        return { totalCustomers, customersWithActiveLoans, customersWithOverdueEmis };
    },

    getStaffReport: async () => {
        const staffList = await staffService.getStaff();
        const payments = await paymentService.getPayments();

        const totalStaff = staffList.length;
        
        const staffStats = staffList.map(staff => {
            const staffPayments = payments.filter(p => {
                // matching by name or by an explicit collectedBy ID if it ever changes
                return p.collectedBy === staff.name || p.collectedBy === `Agent ${staff.name.split(' ')[0]}`;
            });
            const collectedEmis = staffPayments.length;
            const collectionAmount = staffPayments.reduce((sum, p) => sum + p.amount, 0);
            return {
                id: staff.id,
                name: staff.name,
                collectedEmis,
                collectionAmount
            };
        });

        // also include a category for "System" or "Unknown" to be accurate if needed, 
        // but user specifically requested: "Total Staff, EMIs Collected By Staff, Collection Amount By Staff"
        return { totalStaff, staffStats };
    },

    getCollectionAnalytics: async () => {
        const payments = await paymentService.getPayments();
        const monthlyData = {};
        
        payments.forEach(p => {
            if (p.status !== 'Completed') return;
            const d = new Date(p.paymentDate);
            const monthYear = d.toLocaleString('default', { month: 'short' }); 
            if (!monthlyData[monthYear]) {
                monthlyData[monthYear] = { name: monthYear, current: 0 };
            }
            monthlyData[monthYear].current += p.amount;
        });
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const result = months.map(m => monthlyData[m] || { name: m, current: 0 }).filter(m => m.current > 0);
        return result;
    },

    getPaymentAnalytics: async () => {
        const payments = await paymentService.getPayments();
        const methodCounts = payments.reduce((acc, p) => {
            if (p.status !== 'Completed') return acc;
            acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + 1;
            return acc;
        }, {});

        return Object.keys(methodCounts).map(key => ({
            name: key,
            value: methodCounts[key]
        }));
    }
};
