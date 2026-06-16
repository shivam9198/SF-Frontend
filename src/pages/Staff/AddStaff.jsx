import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { rolePermissions } from '../../services/api/staffService';
import api from '../../services/api/axios';

const initialForm = {
    name: '',
    phone: '',
    email: '',
    role: 'Staff',
    password: '',
    confirmPassword: '',
};

const phonePattern = /^(\+91[\s-]?)?[6-9]\d{9}$/;

const cleanPhoneInput = (value) => value.replace(/[^\d+\s-]/g, '');

function AddStaffPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState(null);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const updateField = (field, value) => {
        setFormData((current) => ({ ...current, [field]: value }));
        setError('');
    };

    const updatePhone = (value) => {
        updateField('phone', cleanPhoneInput(value));
    };

    const validate = () => {
        if (!formData.name.trim()) return 'Full Name is required';
        if (!formData.phone.trim()) return 'Phone Number is required';
        if (!phonePattern.test(formData.phone.replace(/\s|-/g, ''))) return 'Enter a valid 10 digit phone number';
        if (!formData.email.trim()) return 'Email is required';
        if (!formData.password) return 'Password is required';
        if (formData.password.length < 6) return 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) return 'Password and Confirm Password must match';
        return '';
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                password: formData.password,
                role: formData.role.toLowerCase()
            };
            await api.post('/auth/register-staff', payload);
            setFormData(initialForm);
            setError('');
            showToast('success', 'Staff registered successfully');
            setTimeout(() => navigate('/staff'), 1500);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to add staff';
            showToast('error', errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <Header title="Add Staff" subtitle="Create staff login for EMI collection work." onBack={() => navigate('/staff')} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="rounded-2xl lg:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && <Alert message={error} />}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Input label="Full Name" value={formData.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Enter full name" />
                            <Input
                                label="Phone Number"
                                type="tel"
                                inputMode="numeric"
                                value={formData.phone}
                                onChange={(event) => updatePhone(event.target.value)}
                                placeholder="+91 98765 43210"
                            />
                            <Input label="Email" type="email" value={formData.email} onChange={(event) => updateField('email', event.target.value)} placeholder="name@example.com" />
                            <Select
                                label="Role"
                                value={formData.role}
                                onChange={(event) => updateField('role', event.target.value)}
                                options={[
                                    { value: 'Admin', label: 'Admin' },
                                    { value: 'Staff', label: 'Staff' },
                                ]}
                            />
                            <Input label="Password" type="password" value={formData.password} onChange={(event) => updateField('password', event.target.value)} placeholder="Enter password" />
                            <Input label="Confirm Password" type="password" value={formData.confirmPassword} onChange={(event) => updateField('confirmPassword', event.target.value)} placeholder="Confirm password" />
                        </div>
                        <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
                            <Button type="button" variant="secondary" onClick={() => navigate('/staff')}>Cancel</Button>
                            <Button type="submit" className="gap-2" disabled={isSubmitting}>
                                <FiSave /> {isSubmitting ? 'Saving...' : 'Save Staff'}
                            </Button>
                        </div>
                    </form>
                </Card>

                <PermissionCard role={formData.role} />
            </div>

            {/* Toasts */}
            {toast && (
                <div className={`fixed right-4 top-4 z-50 flex animate-slideIn items-center gap-3 rounded-2xl px-4 py-3 shadow-lg ${
                    toast.type === 'success' 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                    {toast.type === 'success' ? <FiCheckCircle size={20} /> : <FiXCircle size={20} />}
                    <p className="text-sm font-medium">{toast.message}</p>
                </div>
            )}
        </div>
    );
}

function Header({ title, subtitle, onBack }) {
    return (
        <div className="flex items-center gap-4">
            <button type="button" onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
                <FiArrowLeft />
            </button>
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>
                <p className="mt-1 text-base text-slate-600 dark:text-slate-300">{subtitle}</p>
            </div>
        </div>
    );
}

function PermissionCard({ role }) {
    return (
        <Card className="rounded-2xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Role Permissions</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{role} can access:</p>
            <div className="mt-4 space-y-2">
                {rolePermissions[role].map((permission) => (
                    <div key={permission} className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                        {permission}
                    </div>
                ))}
            </div>
            {role === 'Staff' && (
                <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                    Staff cannot delete records, manage staff, view reports or access settings.
                </p>
            )}
        </Card>
    );
}

function Alert({ message }) {
    return (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
            {message}
        </div>
    );
}

export default AddStaffPage;
