import { useContext, useEffect, useState } from 'react';
import { FiLock, FiSave, FiSettings, FiShield, FiUser } from 'react-icons/fi';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';

const defaultCompany = {
    companyName: 'Sfurti Finance',
    companyPhone: '+91 98765 43210',
    companyAddress: 'Varanasi, Uttar Pradesh',
};

const defaultAppSettings = {
    currency: 'INR',
    dateFormat: 'DD MMM YYYY',
};

function SettingsPage() {
    const { user } = useContext(AuthContext);
    const { theme, setTheme } = useContext(ThemeContext);
    const [profile, setProfile] = useState(user || {});
    const [company, setCompany] = useState(defaultCompany);
    const [appSettings, setAppSettings] = useState(defaultAppSettings);
    const [security, setSecurity] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [message, setMessage] = useState('');

    useEffect(() => {
        try {
            setCompany(JSON.parse(localStorage.getItem('sf_company_settings')) || defaultCompany);
            setAppSettings(JSON.parse(localStorage.getItem('sf_app_settings')) || defaultAppSettings);
        } catch {
            setCompany(defaultCompany);
            setAppSettings(defaultAppSettings);
        }
    }, []);

    const saveProfile = () => {
        // Normally this would call a backend API to update the profile
        setMessage('Profile settings saving is not implemented in backend yet');
    };

    const saveCompany = () => {
        localStorage.setItem('sf_company_settings', JSON.stringify(company));
        setMessage('Company settings saved');
    };

    const saveApplication = () => {
        localStorage.setItem('sf_app_settings', JSON.stringify(appSettings));
        setMessage('Application settings saved');
    };

    const saveSecurity = () => {
        if (security.newPassword && security.newPassword !== security.confirmPassword) {
            setMessage('New password and confirm password must match');
            return;
        }
        setMessage('Security settings saving is not implemented in backend yet');
        setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    return (
        <div className="space-y-6 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
                <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                    Manage profile, company and application preferences.
                </p>
            </div>

            {message && (
                <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800 dark:border-sky-900/40 dark:bg-sky-900/20 dark:text-sky-200">
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <SettingsSection icon={<FiUser />} title="Profile Settings" onSave={saveProfile}>
                    <Input label="Name" value={profile.name || ''} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
                    <Input label="Phone" type="tel" value={profile.phone || ''} onChange={(event) => setProfile({ ...profile, phone: event.target.value.replace(/[^\d+\s-]/g, '') })} />
                    <Input label="Email" type="email" value={profile.email || ''} onChange={(event) => setProfile({ ...profile, email: event.target.value })} />
                    <Input label="Role" value={profile.role || ''} readOnly disabled />
                </SettingsSection>

                <SettingsSection icon={<FiSettings />} title="Company Settings" onSave={saveCompany}>
                    <Input label="Company Name" value={company.companyName} onChange={(event) => setCompany({ ...company, companyName: event.target.value })} />
                    <Input label="Company Phone" type="tel" value={company.companyPhone} onChange={(event) => setCompany({ ...company, companyPhone: event.target.value.replace(/[^\d+\s-]/g, '') })} />
                    <Input label="Company Address" value={company.companyAddress} onChange={(event) => setCompany({ ...company, companyAddress: event.target.value })} />
                </SettingsSection>

                <SettingsSection icon={<FiSettings />} title="Application Settings" onSave={saveApplication}>
                    <Select
                        label="Theme"
                        value={theme}
                        onChange={(event) => setTheme(event.target.value)}
                        options={[
                            { value: 'light', label: 'Light' },
                            { value: 'dark', label: 'Dark' },
                        ]}
                    />
                    <Select
                        label="Currency"
                        value={appSettings.currency}
                        onChange={(event) => setAppSettings({ ...appSettings, currency: event.target.value })}
                        options={[{ value: 'INR', label: 'Indian Rupee (₹)' }]}
                    />
                    <Select
                        label="Date Format"
                        value={appSettings.dateFormat}
                        onChange={(event) => setAppSettings({ ...appSettings, dateFormat: event.target.value })}
                        options={[
                            { value: 'DD MMM YYYY', label: '9 Jun 2026' },
                            { value: 'DD/MM/YYYY', label: '09/06/2026' },
                        ]}
                    />
                </SettingsSection>

                <SettingsSection icon={<FiShield />} title="Security" onSave={saveSecurity}>
                    <Input label="Change Password" type="password" value={security.currentPassword} onChange={(event) => setSecurity({ ...security, currentPassword: event.target.value })} placeholder="Current password" />
                    <Input label="New Password" type="password" value={security.newPassword} onChange={(event) => setSecurity({ ...security, newPassword: event.target.value })} placeholder="New password" />
                    <Input label="Confirm Password" type="password" value={security.confirmPassword} onChange={(event) => setSecurity({ ...security, confirmPassword: event.target.value })} placeholder="Confirm password" />
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                            <FiLock /> Password display
                        </div>
                        <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">---</p>
                    </div>
                </SettingsSection>
            </div>
        </div>
    );
}

function SettingsSection({ title, icon, children, onSave }) {
    return (
        <Card className="rounded-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300">
                        {icon}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
            <div className="mt-5 flex justify-end border-t border-slate-100 pt-5 dark:border-slate-800">
                <Button className="gap-2" onClick={onSave}><FiSave /> Save</Button>
            </div>
        </Card>
    );
}

export default SettingsPage;
