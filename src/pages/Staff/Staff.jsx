import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiEye, FiPlus, FiSearch, FiToggleLeft, FiToggleRight, FiUsers, FiUserCheck, FiShield, FiUser } from 'react-icons/fi';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import { staffService } from '../../services/api/staffService';
import StaffSkeleton from './components/StaffSkeleton';

function StaffPage() {
    const navigate = useNavigate();
    const [staff, setStaff] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');

    const fetchStaff = async () => {
        try {
            setIsLoading(true);
            const data = await staffService.getStaff();
            setStaff(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to load staff');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const summary = useMemo(() => ({
        total: staff.length,
        active: staff.filter((member) => member.status === 'Active').length,
        admins: staff.filter((member) => member.role === 'Admin').length,
        members: staff.filter((member) => member.role === 'Staff').length,
    }), [staff]);

    const filteredStaff = useMemo(() => {
        return staff.filter((member) => {
            const search = searchTerm.trim().toLowerCase();
            const matchesSearch = !search ||
                member.name.toLowerCase().includes(search) ||
                member.phone.includes(searchTerm.trim());

            const matchesFilter = filter === 'All' || member.role === filter || member.status === filter;
            return matchesSearch && matchesFilter;
        });
    }, [staff, searchTerm, filter]);

    const handleToggleStatus = async (id) => {
        try {
            const updated = await staffService.toggleStaffStatus(id);
            setStaff((current) => current.map((member) => member.id === id ? updated : member));
        } catch (err) {
            setError(err.message || 'Failed to update staff status');
        }
    };

    const columns = [
        { key: 'id', label: 'Staff ID', render: (row) => <span className="font-semibold text-sky-600 dark:text-sky-400">{row.id}</span> },
        { key: 'name', label: 'Name', render: (row) => <span className="font-semibold text-slate-900 dark:text-white">{row.name}</span> },
        { key: 'phone', label: 'Phone Number' },
        { key: 'role', label: 'Role', render: (row) => <RoleBadge role={row.role} /> },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        { key: 'joiningDate', label: 'Joining Date', render: (row) => new Date(row.joiningDate).toLocaleDateString('en-IN') },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
                <div className="flex flex-wrap items-center gap-2">
                    <IconAction title="View" onClick={() => navigate(`/staff/${row.id}`)} icon={<FiEye />} />
                    <IconAction title="Edit" onClick={() => navigate(`/staff/${row.id}/edit`)} icon={<FiEdit2 />} />
                    <IconAction
                        title={row.status === 'Active' ? 'Deactivate' : 'Activate'}
                        onClick={() => handleToggleStatus(row.id)}
                        icon={row.status === 'Active' ? <FiToggleLeft /> : <FiToggleRight />}
                        tone={row.status === 'Active' ? 'amber' : 'emerald'}
                    />
                </div>
            ),
        },
    ];

    if (isLoading) return <StaffSkeleton />;
    if (error) return <ErrorState message={error} onRetry={fetchStaff} />;

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Staff Management</h1>
                    <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                        Manage staff access for customers, loans and EMI collection.
                    </p>
                </div>
                <Button onClick={() => navigate('/staff/new')} className="gap-2">
                    <FiPlus /> Add Staff
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard title="Total Staff" value={summary.total} icon={<FiUsers />} tone="sky" />
                <SummaryCard title="Active Staff" value={summary.active} icon={<FiUserCheck />} tone="emerald" />
                <SummaryCard title="Admins" value={summary.admins} icon={<FiShield />} tone="amber" />
                <SummaryCard title="Staff Members" value={summary.members} icon={<FiUser />} tone="slate" />
            </div>

            <Card className="rounded-2xl">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
                    <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                            <FiSearch />
                        </div>
                        <input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search by name or phone"
                            className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-base text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                    </div>
                    <div className="w-full md:w-56">
                        <Select
                            label="Filter"
                            value={filter}
                            onChange={(event) => setFilter(event.target.value)}
                            options={[
                                { value: 'All', label: 'All' },
                                { value: 'Admin', label: 'Admin' },
                                { value: 'Staff', label: 'Staff' },
                                { value: 'Active', label: 'Active' },
                                { value: 'Inactive', label: 'Inactive' },
                            ]}
                        />
                    </div>
                </div>

                {filteredStaff.length === 0 ? (
                    <EmptyState
                        title="No Staff Found"
                        description="Try another name, phone number or filter."
                        action={<Button variant="secondary" onClick={() => { setSearchTerm(''); setFilter('All'); }}>Clear Search</Button>}
                    />
                ) : (
                    <>
                        <div className="hidden md:block">
                            <Table columns={columns} data={filteredStaff} className="rounded-2xl" />
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:hidden">
                            {filteredStaff.map((member) => (
                                <StaffMobileCard key={member.id} member={member} onView={() => navigate(`/staff/${member.id}`)} onEdit={() => navigate(`/staff/${member.id}/edit`)} onToggle={() => handleToggleStatus(member.id)} />
                            ))}
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
}

function SummaryCard({ title, value, icon, tone }) {
    const tones = {
        sky: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
        slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    };

    return (
        <Card className="rounded-2xl p-5">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${tones[tone]}`}>
                    {icon}
                </div>
            </div>
        </Card>
    );
}

function RoleBadge({ role }) {
    return <Badge variant={role === 'Admin' ? 'primary' : 'success'}>{role}</Badge>;
}

function StatusBadge({ status }) {
    return <Badge variant={status === 'Active' ? 'success' : 'warning'}>{status}</Badge>;
}

function IconAction({ title, icon, onClick, tone = 'sky' }) {
    const tones = {
        sky: 'text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-900/30',
        amber: 'text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-900/30',
        emerald: 'text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-900/30',
    };

    return (
        <button type="button" onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${tones[tone]}`} title={title}>
            {icon}
            <span>{title}</span>
        </button>
    );
}

function StaffMobileCard({ member, onView, onEdit, onToggle }) {
    return (
        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{member.name}</p>
                    <p className="text-sm font-semibold text-sky-600 dark:text-sky-400">{member.id}</p>
                </div>
                <StatusBadge status={member.status} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Info label="Phone" value={member.phone} />
                <Info label="Role" value={member.role} />
                <Info label="Joining Date" value={new Date(member.joiningDate).toLocaleDateString('en-IN')} />
                <Info label="Password" value="---" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <Button variant="secondary" className="px-3 py-2 text-xs" onClick={onView}>View</Button>
                <Button variant="secondary" className="px-3 py-2 text-xs" onClick={onEdit}>Edit</Button>
                <Button variant="secondary" className="px-3 py-2 text-xs" onClick={onToggle}>
                    {member.status === 'Active' ? 'Deactivate' : 'Activate'}
                </Button>
            </div>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-1 break-words font-semibold text-slate-900 dark:text-white">{value}</p>
        </div>
    );
}

export default StaffPage;
