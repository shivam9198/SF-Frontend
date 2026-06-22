import api from './axios';

const readList = (payload, keys = []) => {
    for (const key of keys) {
        if (Array.isArray(payload?.[key])) return payload[key];
    }
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    return [];
};

const getId = (item) => item?._id || item?.id;

const getCustomerId = (loan) => {
    if (loan?.customer?._id || loan?.customer?.id) return loan.customer._id || loan.customer.id;
    if (loan?.customerId && typeof loan.customerId === 'object') return loan.customerId._id || loan.customerId.id;
    return loan?.customerId;
};

const toNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

const normalizeStatus = (status) => String(status || '').trim().toLowerCase();

const isPaid = (item) => ['paid', 'completed', 'success'].includes(normalizeStatus(item?.status));
const isPending = (item) => normalizeStatus(item?.status) === 'pending';
const isOverdue = (item) => normalizeStatus(item?.status) === 'overdue';

const parseDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const getPaymentDate = (payment) => (
    payment?.paidOn ||
    payment?.paymentDate ||
    payment?.paidDate ||
    payment?.date
);

const getPaymentAmount = (payment) => toNumber(payment?.amountPaid ?? payment?.amount ?? payment?.emiAmount);

const getPaymentMethod = (payment) => payment?.paymentMethod || payment?.paymentMode || payment?.method || 'Unspecified';

const getCollectorId = (item) => {
    const collector = item?.collectedBy || item?.collector || item?.staff || item?.user;
    if (!collector) return null;
    if (typeof collector === 'object') return collector._id || collector.id || collector.name || collector.fullName || collector.username || null;
    return collector;
};

const getCollectorName = (item) => {
    const collector = item?.collectedBy || item?.collector || item?.staff || item?.user;
    if (!collector) return '';
    if (typeof collector === 'object') return collector.name || collector.fullName || collector.username || collector._id || collector.id || '';
    return collector;
};

const startOfDay = (date) => {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
};

const isSameDay = (date, comparison) => startOfDay(date).getTime() === startOfDay(comparison).getTime();

const isThisWeek = (date, comparison = new Date()) => {
    const firstDay = startOfDay(comparison);
    firstDay.setDate(firstDay.getDate() - firstDay.getDay());
    const lastDay = new Date(firstDay);
    lastDay.setDate(firstDay.getDate() + 6);
    lastDay.setHours(23, 59, 59, 999);
    return date >= firstDay && date <= lastDay;
};

const isThisMonth = (date, comparison = new Date()) => (
    date.getMonth() === comparison.getMonth() &&
    date.getFullYear() === comparison.getFullYear()
);

const getLoanAmount = (loan) => {
    const explicitAmount = loan?.loanAmount ?? loan?.principalAmount ?? loan?.totalAmount;
    if (explicitAmount !== undefined && explicitAmount !== null) return toNumber(explicitAmount);
    return Math.max(0, toNumber(loan?.productPrice ?? loan?.price) + toNumber(loan?.loginCharge) - toNumber(loan?.downPayment));
};

const fetchCustomers = async () => {
    const response = await api.get('/customers');
    return readList(response.data, ['customers']);
};

const fetchLoans = async () => {
    const response = await api.get('/loans');
    return readList(response.data, ['loans']);
};

const fetchStaff = async () => {
    const response = await api.get('/staff');
    return readList(response.data, ['staff', 'users']);
};

const fetchPayments = async () => {
    try {
        const response = await api.get('/payments');
        return readList(response.data, ['payments']);
    } catch (error) {
        if (error.response?.status === 404) return [];
        throw error;
    }
};

const fetchInstallmentsForLoan = async (loan) => {
    const loanId = getId(loan);
    if (!loanId) return [];
    const response = await api.get(`/loans/${loanId}/installments`);
    const data = response.data?.data || response.data;
    const installments = readList(data, ['installments']);
    return installments.map((installment) => ({
        ...installment,
        loanId,
        customerId: getCustomerId(loan),
    }));
};

const fetchInstallments = async (loans) => {
    const results = await Promise.all(loans.map(fetchInstallmentsForLoan));
    return results.flat();
};

const buildPaymentsFromInstallments = (installments) => (
    installments
        .filter(isPaid)
        .map((installment) => ({
            ...installment,
            status: 'Completed',
            paymentDate: getPaymentDate(installment),
            paymentMethod: getPaymentMethod(installment),
            amount: getPaymentAmount(installment),
        }))
);

const fetchReportContext = async () => {
    const [customers, loans, staffList, apiPayments] = await Promise.all([
        fetchCustomers(),
        fetchLoans(),
        fetchStaff(),
        fetchPayments(),
    ]);
    const installments = await fetchInstallments(loans);
    const installmentPayments = buildPaymentsFromInstallments(installments);
    const payments = apiPayments.length > 0 ? apiPayments : installmentPayments;

    return { customers, loans, staffList, installments, payments };
};

const getOutstandingAmount = (loan, installments) => {
    const loanInstallments = installments.filter((installment) => installment.loanId === getId(loan));
    if (loanInstallments.length > 0) {
        return loanInstallments
            .filter((installment) => !isPaid(installment))
            .reduce((sum, installment) => sum + getPaymentAmount(installment), 0);
    }
    return toNumber(loan?.outstandingBalance ?? loan?.remainingBalance ?? loan?.balance);
};

const calculateCollectionReport = (payments) => {
    let today = 0;
    let thisWeek = 0;
    let thisMonth = 0;
    let total = 0;
    const now = new Date();

    payments.filter(isPaid).forEach((payment) => {
        const amount = getPaymentAmount(payment);
        const date = parseDate(getPaymentDate(payment));
        total += amount;
        if (!date) return;
        if (isSameDay(date, now)) today += amount;
        if (isThisWeek(date, now)) thisWeek += amount;
        if (isThisMonth(date, now)) thisMonth += amount;
    });

    return { today, thisWeek, thisMonth, total };
};

const calculateLoanReport = (loans, installments) => {
    const loanSummaries = loans.map((loan) => {
        const outstandingAmount = getOutstandingAmount(loan, installments);
        return {
            totalLoanAmount: getLoanAmount(loan),
            outstandingAmount,
            isClosed: outstandingAmount <= 0 || ['closed', 'completed'].includes(normalizeStatus(loan?.status)),
        };
    });

    return {
        totalLoans: loans.length,
        activeLoans: loanSummaries.filter((loan) => !loan.isClosed).length,
        closedLoans: loanSummaries.filter((loan) => loan.isClosed).length,
        totalLoanAmount: loanSummaries.reduce((sum, loan) => sum + loan.totalLoanAmount, 0),
        outstandingAmount: loanSummaries.reduce((sum, loan) => sum + loan.outstandingAmount, 0),
    };
};

const calculateEmiReport = (installments) => ({
    totalEmis: installments.length,
    paidEmis: installments.filter(isPaid).length,
    pendingEmis: installments.filter(isPending).length,
    overdueEmis: installments.filter(isOverdue).length,
});

const calculateCustomerReport = (customers, loans, installments) => {
    const activeCustomerIds = new Set(
        loans
            .filter((loan) => getOutstandingAmount(loan, installments) > 0)
            .map(getCustomerId)
            .filter(Boolean)
    );
    const overdueLoanIds = new Set(installments.filter(isOverdue).map((installment) => installment.loanId));
    const overdueCustomerIds = new Set(
        loans
            .filter((loan) => overdueLoanIds.has(getId(loan)))
            .map(getCustomerId)
            .filter(Boolean)
    );

    return {
        totalCustomers: customers.length,
        customersWithActiveLoans: activeCustomerIds.size,
        customersWithOverdueEmis: overdueCustomerIds.size,
    };
};

const calculateStaffReport = (staffList, payments) => {
    const staffStats = staffList.map((staff) => {
        const staffId = getId(staff);
        const staffName = staff.name || staff.fullName || staff.username || 'Unknown Staff';
        const staffPayments = payments.filter((payment) => {
            const collectorId = getCollectorId(payment);
            const collectorName = getCollectorName(payment);
            return collectorId === staffId || collectorName === staffName;
        });

        return {
            id: staffId,
            name: staffName,
            collectedEmis: staffPayments.filter(isPaid).length,
            collectionAmount: staffPayments.filter(isPaid).reduce((sum, payment) => sum + getPaymentAmount(payment), 0),
        };
    });

    return { totalStaff: staffList.length, staffStats };
};

const calculateCollectionAnalytics = (payments) => {
    const monthlyData = new Map();

    payments.filter(isPaid).forEach((payment) => {
        const date = parseDate(getPaymentDate(payment));
        if (!date) return;
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const current = monthlyData.get(key)?.current || 0;
        monthlyData.set(key, {
            name: date.toLocaleString('default', { month: 'short', year: '2-digit' }),
            current: current + getPaymentAmount(payment),
            sortDate: new Date(date.getFullYear(), date.getMonth(), 1).getTime(),
        });
    });

    return Array.from(monthlyData.values())
        .sort((a, b) => a.sortDate - b.sortDate)
        .map(({ name, current }) => ({ name, current }));
};

const calculatePaymentAnalytics = (payments) => {
    const methodCounts = payments.filter(isPaid).reduce((acc, payment) => {
        const method = getPaymentMethod(payment);
        acc[method] = (acc[method] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(methodCounts).map(([name, value]) => ({ name, value }));
};

export const reportService = {
    getReports: async () => {
        const { customers, loans, staffList, installments, payments } = await fetchReportContext();

        return {
            collection: calculateCollectionReport(payments),
            loan: calculateLoanReport(loans, installments),
            emi: calculateEmiReport(installments),
            customer: calculateCustomerReport(customers, loans, installments),
            staff: calculateStaffReport(staffList, payments),
            collectionAnalytics: calculateCollectionAnalytics(payments),
            paymentAnalytics: calculatePaymentAnalytics(payments),
        };
    },

    getCollectionReport: async () => {
        const { payments } = await fetchReportContext();
        return calculateCollectionReport(payments);
    },

    getLoanReport: async () => {
        const { loans, installments } = await fetchReportContext();
        return calculateLoanReport(loans, installments);
    },

    getEmiReport: async () => {
        const { installments } = await fetchReportContext();
        return calculateEmiReport(installments);
    },

    getCustomerReport: async () => {
        const { customers, loans, installments } = await fetchReportContext();
        return calculateCustomerReport(customers, loans, installments);
    },

    getStaffReport: async () => {
        const { staffList, payments } = await fetchReportContext();
        return calculateStaffReport(staffList, payments);
    },

    getCollectionAnalytics: async () => {
        const { payments } = await fetchReportContext();
        return calculateCollectionAnalytics(payments);
    },

    getPaymentAnalytics: async () => {
        const { payments } = await fetchReportContext();
        return calculatePaymentAnalytics(payments);
    },
};
