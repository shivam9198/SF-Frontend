import api from './axios';

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
        const response = await api.get('/staff');
        return response.data;
    },

    getStaffById: async (id) => {
        const response = await api.get(`/staff/${id}`);
        return response.data;
    },

    createStaff: async (staffData) => {
        // Handled directly via api.post('/auth/register-staff') or here. 
        // We will just expose a method for consistency, though AddStaff uses api directly.
        const response = await api.post('/auth/register-staff', staffData);
        return response.data;
    },

    updateStaff: async (id, staffData) => {
        const response = await api.put(`/staff/${id}`, staffData);
        return response.data;
    },

    toggleStaffStatus: async (id, status) => {
        const response = await api.patch(`/staff/${id}/status`, { status });
        return response.data;
    },
};
