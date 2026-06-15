const mockStaff = [
    {
        id: 'STF-001',
        name: 'Amit Kumar',
        phone: '+91 98765 43210',
        email: 'amit@sfurti.local',
        role: 'Admin',
        status: 'Active',
        joiningDate: '2023-10-12',
        paymentsCollected: 48,
        loansManaged: 22,
        recentActivity: [
            { id: 'ACT-001', action: 'Recorded Payment', date: '2026-06-08', detail: 'Collected EMI from Rahul Sharma' },
            { id: 'ACT-002', action: 'Created Loan', date: '2026-06-06', detail: 'Created mobile loan for Priya Patel' },
            { id: 'ACT-003', action: 'Created Customer', date: '2026-06-04', detail: 'Added Shivam Gupta' },
        ],
    },
    {
        id: 'STF-002',
        name: 'Priya Singh',
        phone: '+91 87654 32109',
        email: 'priya@sfurti.local',
        role: 'Staff',
        status: 'Active',
        joiningDate: '2024-01-18',
        paymentsCollected: 35,
        loansManaged: 14,
        recentActivity: [
            { id: 'ACT-004', action: 'Recorded Payment', date: '2026-06-07', detail: 'Collected cash EMI' },
            { id: 'ACT-005', action: 'Created Customer', date: '2026-06-02', detail: 'Added new customer from Deoria' },
        ],
    },
    {
        id: 'STF-003',
        name: 'Ravi Verma',
        phone: '+91 76543 21098',
        email: 'ravi@sfurti.local',
        role: 'Staff',
        status: 'Inactive',
        joiningDate: '2024-03-05',
        paymentsCollected: 19,
        loansManaged: 8,
        recentActivity: [
            { id: 'ACT-006', action: 'Recorded Payment', date: '2026-05-28', detail: 'Collected UPI EMI' },
        ],
    },
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withoutPassword = (staff) => ({
    ...staff,
    password: '---',
});

export const rolePermissions = {
    Admin: [
        'View Dashboard',
        'Manage Customers',
        'Create Loans',
        'View EMI Schedule',
        'Record Payments',
        'View Reports',
        'Manage Staff',
        'Access Settings',
        'Delete Records',
    ],
    Staff: [
        'View Dashboard',
        'View Customers',
        'View Loans',
        'View EMI Schedule',
        'Record Payments',
    ],
};

export const staffService = {
    getStaff: async () => {
        await delay(500);
        return mockStaff.map(withoutPassword);
    },

    getStaffById: async (id) => {
        await delay(400);
        const staff = mockStaff.find((member) => member.id === id);
        if (!staff) throw new Error('Staff member not found');
        return withoutPassword(staff);
    },

    createStaff: async (staffData) => {
        await delay(600);
        const newStaff = {
            id: `STF-${String(mockStaff.length + 1).padStart(3, '0')}`,
            name: staffData.name,
            phone: staffData.phone,
            email: staffData.email,
            role: staffData.role,
            status: 'Active',
            joiningDate: new Date().toISOString().split('T')[0],
            paymentsCollected: 0,
            loansManaged: 0,
            recentActivity: [
                {
                    id: `ACT-${Date.now()}`,
                    action: 'Created Customer',
                    date: new Date().toISOString().split('T')[0],
                    detail: 'Staff account created',
                },
            ],
        };

        mockStaff.unshift(newStaff);
        return withoutPassword(newStaff);
    },

    updateStaff: async (id, staffData) => {
        await delay(500);
        const index = mockStaff.findIndex((member) => member.id === id);
        if (index === -1) throw new Error('Staff member not found');

        mockStaff[index] = {
            ...mockStaff[index],
            name: staffData.name,
            phone: staffData.phone,
            role: staffData.role,
            status: staffData.status,
        };

        return withoutPassword(mockStaff[index]);
    },

    toggleStaffStatus: async (id) => {
        await delay(400);
        const staff = mockStaff.find((member) => member.id === id);
        if (!staff) throw new Error('Staff member not found');
        staff.status = staff.status === 'Active' ? 'Inactive' : 'Active';
        return withoutPassword(staff);
    },
};
