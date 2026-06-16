import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ErrorState from '../../components/common/ErrorState';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { rolePermissions, staffService } from '../../services/api/staffService';
import ProfileSkeleton from './components/ProfileSkeleton';

const phonePattern = /^(\+91[\s-]?)?[6-9]\d{9}$/;
const cleanPhoneInput = (value) => value.replace(/[^\d+\s-]/g, '');

function EditStaffPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState(null);
    const [originalStatus, setOriginalStatus] = useState(null);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchStaff = async () => {
        try {
            setIsLoading(true);
            const staff = await staffService.getStaffById(id);
            const roleCap = staff.role === 'admin' ? 'Admin' : 'Staff';
            const stat = staff.isActive ? 'Active' : 'Inactive';
            setFormData({
                name: staff.name,
                phone: staff.phone,
                role: roleCap,
                status: stat,
            });
            setOriginalStatus(stat);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to load staff');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, [id]);

    const updateField = (field, value) => {
        setFormData((current) => ({ ...current, [field]: value }));
        setError('');
    };

    const updatePhone = (value) => {
        updateField('phone', cleanPhoneInput(value));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!formData.name.trim() || !formData.phone.trim()) {
            setError('Name and Phone are required');
            return;
        }
        if (!phonePattern.test(formData.phone.replace(/\s|-/g, ''))) {
            setError('Enter a valid 10 digit phone number');
            return;
        }

        try {
            setIsSubmitting(true);
            await staffService.updateStaff(id, {
                name: formData.name,
                phone: formData.phone,
                role: formData.role.toLowerCase()
            });

            if (formData.status !== originalStatus) {
                await staffService.toggleStaffStatus(id, formData.status.toLowerCase());
            }

            showToast('success', 'Staff updated successfully');
            setTimeout(() => navigate(`/staff`), 1500);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update staff';
            showToast('error', errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <ProfileSkeleton />;
    if (!formData) return <ErrorState message={error || 'Staff member not found'} onRetry={fetchStaff} />;

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <button type="button" onClick={() => navigate(`/staff`)} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
                    <FiArrowLeft />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Edit Staff</h1>
                    <p className="mt-1 text-base text-slate-600 dark:text-slate-300">Update role and active status.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="rounded-2xl lg:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">{error}</div>}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Input label="Name" value={formData.name} onChange={(event) => updateField('name', event.target.value)} />
                            <Input
                                label="Phone"
                                type="tel"
                                inputMode="numeric"
                                value={formData.phone}
                                onChange={(event) => updatePhone(event.target.value)}
                            />
                            <Select
                                label="Role"
                                value={formData.role}
                                onChange={(event) => updateField('role', event.target.value)}
                                options={[
                                    { value: 'Admin', label: 'Admin' },
                                    { value: 'Staff', label: 'Staff' },
                                ]}
                            />
                            <Select
                                label="Status"
                                value={formData.status}
                                onChange={(event) => updateField('status', event.target.value)}
                                options={[
                                    { value: 'Active', label: 'Active' },
                                    { value: 'Inactive', label: 'Inactive' },
                                ]}
                            />
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Password</p>
                            <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">---</p>
                        </div>
                        <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
                            <Button type="button" variant="secondary" onClick={() => navigate(`/staff`)}>Cancel</Button>
                            <Button type="submit" className="gap-2" disabled={isSubmitting}>
                                <FiSave /> {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </Card>

                <Card className="rounded-2xl">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Role Permissions</h2>
                    <div className="mt-4 space-y-2">
                        {rolePermissions[formData.role]?.map((permission) => (
                            <div key={permission} className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                                {permission}
                            </div>
                        ))}
                    </div>
                </Card>
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

export default EditStaffPage;
