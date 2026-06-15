const mockCustomers = [
    {
        id: 'CUST-001',
        name: 'Rahul Sharma',
        phone: '+91 98765 43210',
        altPhone: '+91 98765 43211',
        address: '123, MG Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400001',
        aadhaar: 'XXXX-XXXX-1234',
        docType: 'Aadhaar',
        loans: 2,
        totalOutstanding: 45000,
        status: 'Active',
        createdAt: '2023-10-12',
    },
    {
        id: 'CUST-002',
        name: 'Priya Patel',
        phone: '+91 87654 32109',
        altPhone: '',
        address: '45, Navrangpura',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pinCode: '380009',
        aadhaar: 'XXXX-XXXX-5678',
        docType: 'Aadhaar',
        loans: 1,
        totalOutstanding: 12500,
        status: 'Overdue',
        createdAt: '2023-11-05',
    },
    {
        id: 'CUST-003',
        name: 'Amit Kumar',
        phone: '+91 76543 21098',
        altPhone: '+91 76543 21099',
        address: 'Sector 15',
        city: 'Chandigarh',
        state: 'Punjab',
        pinCode: '160015',
        aadhaar: 'XXXX-XXXX-9012',
        docType: 'PAN',
        loans: 3,
        totalOutstanding: 0,
        status: 'Completed',
        createdAt: '2023-08-22',
    },
    {
        id: 'CUST-004',
        name: 'Sneha Reddy',
        phone: '+91 65432 10987',
        altPhone: '',
        address: 'Banjara Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        pinCode: '500034',
        aadhaar: 'XXXX-XXXX-3456',
        docType: 'Aadhaar',
        loans: 1,
        totalOutstanding: 80000,
        status: 'Active',
        createdAt: '2024-01-15',
    },
    {
        id: 'CUST-005',
        name: 'Vikram Singh',
        phone: '+91 99887 76655',
        altPhone: '',
        address: 'Civil Lines',
        city: 'Jaipur',
        state: 'Rajasthan',
        pinCode: '302006',
        aadhaar: 'XXXX-XXXX-7890',
        docType: 'Voter ID',
        loans: 1,
        totalOutstanding: 5000,
        status: 'New',
        createdAt: '2024-02-10',
    },
    {
        id: 'CUST-006',
        name: 'Shivam Gupta',
        phone: '+91 99999 88888',
        altPhone: '',
        address: 'MG Road',
        city: 'Delhi',
        state: 'Delhi',
        pinCode: '110001',
        aadhaar: 'XXXX-XXXX-9999',
        docType: 'Aadhaar',
        loans: 1,
        totalOutstanding: 15000,
        status: 'Active',
        createdAt: '2024-06-08',
    }
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const customerService = {
    getCustomers: async () => {
        await delay(500);
        return [...mockCustomers];
    },
    
    getCustomerById: async (id) => {
        await delay(500);
        const customer = mockCustomers.find(c => c.id === id);
        if (!customer) throw new Error('Customer not found');
        return { ...customer };
    },

    createCustomer: async (customerData) => {
        await delay(800);
        const newCustomer = {
            id: `CUST-00${mockCustomers.length + 1}`,
            ...customerData,
            status: 'New',
            loans: 0,
            totalOutstanding: 0,
            createdAt: new Date().toISOString().split('T')[0]
        };
        mockCustomers.unshift(newCustomer);
        return { ...newCustomer };
    },

    updateCustomer: async (id, customerData) => {
        await delay(600);
        const index = mockCustomers.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Customer not found');
        mockCustomers[index] = { ...mockCustomers[index], ...customerData };
        return { ...mockCustomers[index] };
    },

    deleteCustomer: async (id) => {
        await delay(600);
        const index = mockCustomers.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Customer not found');
        mockCustomers.splice(index, 1);
        return true;
    }
};