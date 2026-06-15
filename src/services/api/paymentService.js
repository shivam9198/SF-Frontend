import { loanService } from './loanService';

const mockPayments = [
    {
        id: 'PAY-1001',
        customerName: 'Rahul Sharma',
        loanId: 'L-1001',
        emiNumber: 1,
        amount: 6333,
        paymentDate: '2023-11-14',
        paymentMethod: 'UPI',
        referenceNumber: 'UPI987654321',
        collectedBy: 'Agent Amit',
        notes: 'First EMI paid via GPay',
        status: 'Completed'
    },
    {
        id: 'PAY-1002',
        customerName: 'Rahul Sharma',
        loanId: 'L-1001',
        emiNumber: 2,
        amount: 6333,
        paymentDate: '2023-12-15',
        paymentMethod: 'Cash',
        referenceNumber: '',
        collectedBy: 'Agent Amit',
        notes: 'Collected at shop',
        status: 'Completed'
    },
    {
        id: 'PAY-1003',
        customerName: 'Rahul Sharma',
        loanId: 'L-1001',
        emiNumber: 3,
        amount: 6333,
        paymentDate: '2024-01-14',
        paymentMethod: 'Bank Transfer',
        referenceNumber: 'NEFT000123456',
        collectedBy: 'System',
        notes: 'Auto-debit setup',
        status: 'Completed'
    },
    {
        id: 'PAY-1004',
        customerName: 'Priya Patel',
        loanId: 'L-1002',
        emiNumber: 1,
        amount: 5083,
        paymentDate: '2024-02-10',
        paymentMethod: 'Cash',
        referenceNumber: '',
        collectedBy: 'Agent Priya',
        notes: 'Paid full in cash',
        status: 'Completed'
    }
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const paymentService = {
    getPayments: async () => {
        await delay(600);
        return [...mockPayments].reverse(); // return newest first
    },

    getPaymentById: async (paymentId) => {
        await delay(400);
        const payment = mockPayments.find(p => p.id === paymentId);
        if (!payment) throw new Error('Payment not found');
        return payment;
    },

    createPayment: async (paymentData) => {
        await delay(800);
        
        // Validation simulate
        if (!paymentData.loanId || !paymentData.emiNumber || !paymentData.amount) {
            throw new Error('Missing required payment fields');
        }

        const newPayment = {
            id: `PAY-${1000 + mockPayments.length + 1}`,
            paymentDate: new Date().toISOString().split('T')[0], // Use current date if not provided
            ...paymentData,
            status: 'Completed',
            // if no collection agent specified, assume current user
            collectedBy: paymentData.collectedBy || 'Current Staff' 
        };

        // Important: Update the loan's EMI schedule
        loanService.markEmiAsPaid(
            newPayment.loanId, 
            newPayment.emiNumber, 
            newPayment.paymentDate, 
            newPayment.collectedBy
        );

        mockPayments.push(newPayment);
        return { ...newPayment };
    }
};
