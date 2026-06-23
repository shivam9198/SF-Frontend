import api from './axios';

export const getDashboardData = async () => {
    // 1. Fetch Customers
    const customersRes = await api.get('/customers').catch(() => ({ data: [] }));
    const customers = customersRes.data?.customers || customersRes.data || [];
    const totalCustomers = customers.length;

    // 2. Fetch Loans
    const loansRes = await api.get('/loans').catch(() => ({ data: [] }));
    const loans = loansRes.data?.loans || loansRes.data?.data || loansRes.data || [];
    const totalLoans = loans.length;
    
    // 3. Fetch Staff
    let staffCount = 0;
    const staffMap = {};
    try {
        const staffRes = await api.get('/staff');
        const staffList = staffRes.data?.staff || staffRes.data || [];
        staffCount = staffList.length;
        staffList.forEach(staff => {
            const staffId = staff._id || staff.id;
            if (staffId) {
                staffMap[staffId.toString()] = staff.name || staff.fullName || 'Unknown Staff';
            }
        });
    } catch (err) {
        console.error('Failed to fetch staff count', err);
    }

    // 4. Fetch Installments for each loan
    let totalOutstandingAmount = 0;
    let pendingInstallments = 0;
    let paidInstallments = 0;
    let overdueInstallments = 0;
    
    let todayCollection = 0;
    let monthCollection = 0;
    
    // Convert current local date to YYYY-MM-DD
    const todayObj = new Date();
    // Use local timezone format for comparison since paymentDate might be in ISO with different timezone, 
    // but the safest check is using the date object.
    const today = todayObj.getFullYear() + '-' + String(todayObj.getMonth() + 1).padStart(2, '0') + '-' + String(todayObj.getDate()).padStart(2, '0');
    const currentMonth = todayObj.getMonth();
    const currentYear = todayObj.getFullYear();

    const installPromises = loans.map(async (loan) => {
        try {
            const id = loan._id || loan.id;
            const res = await api.get(`/loans/${id}/installments`);
            const insts = res.data?.data || res.data || [];
            const installments = Array.isArray(insts) ? insts : (insts.installments || []);
            
            // Enrich with customer & loan info for recent payments table
            let customerObj = loan.customer;
            if (!customerObj && loan.customerId && typeof loan.customerId === 'object') {
                customerObj = loan.customerId;
            }
            let cName = customerObj?.fullName || customerObj?.name || loan.customerName;
            let cDisplayId = customerObj?.customerId || customerObj?.id;

            if ((!cName || !cDisplayId) && loan.customerId) {
                const cId = typeof loan.customerId === 'string' ? loan.customerId : (loan.customerId._id || loan.customerId.id);
                const foundCustomer = customers.find(c => c._id === cId || c.id === cId);
                if (foundCustomer) {
                    cName = cName || foundCustomer.fullName || foundCustomer.name;
                    cDisplayId = cDisplayId || foundCustomer.customerId || foundCustomer.id || cId;
                }
            }

            if (!cDisplayId && loan.customerId) {
                 cDisplayId = typeof loan.customerId === 'string' ? loan.customerId : (loan.customerId.customerId || loan.customerId.id || loan.customerId._id);
            }

            const displayLoanId = loan.loanId || (loan._id ? `LOAN-${String(loan._id).slice(-6).toUpperCase()}` : (loan.id || id));

            return installments.map(inst => ({
                ...inst,
                loanId: displayLoanId,
                rawLoanId: id,
                customerName: cName,
                customerDisplayId: cDisplayId,
            }));
        } catch (err) {
            console.error(`Failed to fetch installments for loan ${loan._id || loan.id}`, err);
            return [];
        }
    });

    const results = await Promise.all(installPromises);
    const allInstallments = results.flat();

    const recentPaymentsList = [];
    const activeLoanIds = new Set();

    allInstallments.forEach(inst => {
        const amt = Number(inst.amount || 0);
        if (inst.status === 'Paid') {
            paidInstallments++;
            const pDateStr = inst.paidOn || '';
            let pDateObj = new Date();
            if (pDateStr) {
                pDateObj = new Date(pDateStr);
                const pDateFormatted = pDateObj.getFullYear() + '-' + String(pDateObj.getMonth() + 1).padStart(2, '0') + '-' + String(pDateObj.getDate()).padStart(2, '0');
                if (pDateFormatted === today || pDateStr.startsWith(today)) {
                    todayCollection += amt;
                }
                if (pDateObj.getMonth() === currentMonth && pDateObj.getFullYear() === currentYear) {
                    monthCollection += amt;
                }
            }
            
            let resolvedCollectedBy = 'System';
            if (inst.collectedBy) {
                if (typeof inst.collectedBy === 'object') {
                    resolvedCollectedBy = inst.collectedBy.name || inst.collectedBy.fullName || 'Unknown Staff';
                } else if (typeof inst.collectedBy === 'string') {
                    // It could be a name or an object ID. Check if it's an object ID in our map.
                    resolvedCollectedBy = staffMap[inst.collectedBy] || inst.collectedBy;
                }
            }

            recentPaymentsList.push({
                id: inst._id || inst.id || Math.random().toString(),
                customer: inst.customerName,
                customerDisplayId: inst.customerDisplayId,
                loanId: inst.loanId,
                rawLoanId: inst.rawLoanId,
                emiNumber: inst.emiNumber || inst.installmentNumber || 1,
                amount: amt,
                date: pDateStr,
                paidOn: pDateStr,
                method: inst.paymentMode || inst.method || 'Cash',
                status: 'Paid',
                collectedBy: resolvedCollectedBy
            });
        } else if (inst.status === 'Pending') {
            pendingInstallments++;
            totalOutstandingAmount += amt;
            activeLoanIds.add(inst.rawLoanId);
        } else if (inst.status === 'Overdue') {
            overdueInstallments++;
            totalOutstandingAmount += amt;
            activeLoanIds.add(inst.rawLoanId);
        }
    });

    const activeLoans = activeLoanIds.size;

    // Sort recent payments
    recentPaymentsList.sort((a, b) => new Date(b.date) - new Date(a.date));

    const metrics = [
        { id: 5, key: 'collection', label: 'Today\'s Collection', value: todayCollection, trend: 'up', change: 0 },
        { id: 6, key: 'month_collection', label: 'This Month Collection', value: monthCollection, trend: 'up', change: 0 },
        { id: 4, key: 'outstanding', label: 'Outstanding Amount', value: totalOutstandingAmount, trend: 'up', change: 0 },
        { id: 9, key: 'overdue', label: 'Overdue Installments', value: overdueInstallments, trend: 'down', change: 0 },
        { id: 3, key: 'active_loans', label: 'Active Loans', value: activeLoans, trend: 'up', change: 0 },
        { id: 1, key: 'customers', label: 'Total Customers', value: totalCustomers, trend: 'up', change: 0 },
    ];

    const quickActions = [
        { id: 1, title: 'Add Customer', description: 'Register new customer profile', path: '/customers/new', icon: 'MdPersonAdd', color: 'blue' },
        { id: 2, title: 'New Loan', description: 'Create a new loan application', path: '/loans/new', icon: 'MdPostAdd', color: 'indigo' },
        { id: 3, title: 'Record Payment', description: 'Register a received EMI', path: '/payments/new', icon: 'MdPayment', color: 'emerald' },
        { id: 4, title: 'View Overdue', description: 'Check pending collections', path: '/overdue', icon: 'MdWarning', color: 'rose' }
    ];

    return {
        metrics,
        recentPayments: recentPaymentsList.slice(0, 5), // Only show top 5
        allPayments: recentPaymentsList, // Provide all for detailed audit
        quickActions
    };
};
