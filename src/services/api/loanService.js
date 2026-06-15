const mockLoans = [
    {
        id: 'L-1001',
        customerName: 'Rahul Sharma',
        customerId: 'CUST-001',
        phone: '+91 98765 43210',
        productName: 'Samsung Galaxy S23',
        imeiNumber: '354123067890123',
        purchaseDate: '2023-10-15',
        price: 75000,
        downPayment: 15000,
        loginCharge: 1000,
        months: 12
    },
    {
        id: 'L-1002',
        customerName: 'Priya Patel',
        customerId: 'CUST-002',
        phone: '+91 87654 32109',
        productName: 'iPhone 15 Pro',
        imeiNumber: '358901234567890',
        purchaseDate: '2024-01-10',
        price: 120000,
        downPayment: 30000,
        loginCharge: 1500,
        months: 18
    },
    {
        id: 'L-1003',
        customerName: 'Shivam Gupta',
        customerId: 'CUST-006',
        phone: '+91 99999 88888',
        productName: 'MacBook Pro M3',
        imeiNumber: '359999999999999',
        purchaseDate: '2024-05-01',
        price: 150000,
        downPayment: 50000,
        loginCharge: 2000,
        months: 12
    }
];

const mockEmiOverrides = {
    'L-1001': {
        1: { status: 'Paid', paidDate: '2023-11-14', collectedBy: 'Agent Amit' },
        2: { status: 'Paid', paidDate: '2023-12-15', collectedBy: 'Agent Amit' },
        3: { status: 'Paid', paidDate: '2024-01-14', collectedBy: 'System' },
        4: { status: 'Overdue', paidDate: null, collectedBy: '-' }
    },
    'L-1002': {
        1: { status: 'Paid', paidDate: '2024-02-10', collectedBy: 'Agent Priya' }
    },
    'L-1003': {
        1: { status: 'Paid', paidDate: '2024-06-01', collectedBy: 'Agent Amit' }
    }
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const loanService = {
    getAllLoans: async () => {
        await delay(500);
        return mockLoans.map(loan => {
            const loanAmount = loan.price + loan.loginCharge - loan.downPayment;
            const monthlyEmi = Math.round(loanAmount / loan.months);
            const schedule = loanService.generateEmiSchedule(loan);
            
            const totalEmis = schedule.length;
            const paidEmis = schedule.filter(e => e.status === 'Paid').length;
            const outstandingBalance = schedule.filter(e => e.status !== 'Paid').reduce((sum, e) => sum + e.amount, 0);

            return {
                ...loan,
                loanAmount,
                monthlyEmi,
                totalEmis,
                paidEmis,
                outstandingBalance
            };
        });
    },

    getLoanDetails: async (loanId) => {
        await delay(500);
        const loan = mockLoans.find(l => l.id === loanId);
        if (!loan) throw new Error('Loan not found');

        const loanAmount = loan.price + loan.loginCharge - loan.downPayment;
        const monthlyEmi = Math.round(loanAmount / loan.months);

        return {
            ...loan,
            loanAmount,
            monthlyEmi,
            totalAmount: loanAmount,
        };
    },

    generateEmiSchedule: (loan) => {
        const loanAmount = loan.price + loan.loginCharge - loan.downPayment;
        const monthlyEmi = Math.round(loanAmount / loan.months);
        const schedule = [];
        
        let purchaseDate = new Date(loan.purchaseDate);

        for (let i = 1; i <= loan.months; i++) {
            // Next month same date
            let dueDate = new Date(purchaseDate);
            dueDate.setMonth(dueDate.getMonth() + i);
            
            // Adjust if end of month overflowed
            if (dueDate.getDate() !== purchaseDate.getDate()) {
                dueDate.setDate(0); // Set to last day of previous month
            }

            let status = 'Pending';
            let paidDate = null;
            let collectedBy = '-';

            // Check if current date has passed the due date (basic simulation for Overdue)
            const today = new Date();
            if (dueDate < today) {
                status = 'Overdue';
            }

            // Apply overrides
            if (mockEmiOverrides[loan.id] && mockEmiOverrides[loan.id][i]) {
                const override = mockEmiOverrides[loan.id][i];
                status = override.status;
                paidDate = override.paidDate;
                collectedBy = override.collectedBy;
            }

            schedule.push({
                emiNumber: i,
                dueDate: dueDate.toISOString().split('T')[0],
                amount: monthlyEmi,
                status,
                paidDate,
                collectedBy
            });
        }
        return schedule;
    },

    getEmiSchedule: async (loanId) => {
        await delay(500);
        const loan = mockLoans.find(l => l.id === loanId);
        if (!loan) throw new Error('Loan not found');
        return loanService.generateEmiSchedule(loan);
    },

    getAllSchedules: async () => {
        await delay(500);
        let allSchedules = [];
        for (const loan of mockLoans) {
            const schedule = loanService.generateEmiSchedule(loan);
            const enrichedSchedule = schedule.map(s => ({
                ...s,
                loanId: loan.id,
                customerName: loan.customerName
            }));
            allSchedules = [...allSchedules, ...enrichedSchedule];
        }
        return allSchedules;
    },

    calculateEMI: async (price, loginCharge, downPayment, months) => {
        await delay(300); // Simulate calculation delay
        const loanAmount = Number(price) + Number(loginCharge) - Number(downPayment);
        if (loanAmount <= 0) return 0;
        return Math.round(loanAmount / Number(months));
    },

    createLoan: async (loanData) => {
        await delay(800);
        const newLoan = {
            id: `L-${1000 + mockLoans.length + 1}`,
            ...loanData
        };
        mockLoans.unshift(newLoan);
        return { ...newLoan };
    },

    markEmiAsPaid: (loanId, emiNumber, paymentDate, collectedBy) => {
        if (!mockEmiOverrides[loanId]) {
            mockEmiOverrides[loanId] = {};
        }
        mockEmiOverrides[loanId][emiNumber] = {
            status: 'Paid',
            paidDate: paymentDate,
            collectedBy: collectedBy
        };
    }
};