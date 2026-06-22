import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiUploadCloud, FiCheckCircle, FiXCircle, FiX, FiFileText } from 'react-icons/fi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import api from '../../services/api/axios';

const documentTypeOptions = [
    { value: 'Aadhaar', label: 'Aadhaar Card' },
    { value: 'PAN', label: 'PAN Card' },
    { value: 'DL', label: 'Driving License' },
    { value: 'Voter ID', label: 'Voter ID' }
];

const invalidInputClass = 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100 dark:border-red-500 dark:bg-red-950/30';

const normalizeDocumentType = (value) => {
    const mappings = {
        'PAN Card': 'PAN',
        'Driving License': 'DL'
    };

    return mappings[value] || value;
};

const AddCustomerPage = () => {
    const navigate = useNavigate();
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        altPhone: '',
        aadhaar: '',
        address: '',
        city: '',
        state: '',
        pinCode: '',
        docType: 'Aadhaar'
    });

    const [isAadhaarFocused, setIsAadhaarFocused] = useState(false);
    const [filePreview, setFilePreview] = useState(null);
    const [fileName, setFileName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: '' }
    const [validationErrors, setValidationErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});

    // Track if form has unsaved changes
    const hasUnsavedChanges = useMemo(() => {
        return Object.values(formData).some(val => val !== '' && val !== 'Aadhaar') || filePreview !== null;
    }, [formData, filePreview]);

    // Unsaved changes warning on reload/close tab
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    // Handle inputs
    const handleChange = (e) => {
        const { id, value } = e.target;
        
        if (id === 'phone' || id === 'altPhone') {
            const rawPhone = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [id]: rawPhone }));
            setValidationErrors(prev => ({ ...prev, [id]: undefined }));
            return;
        }

        if (id === 'pinCode') {
            const rawPin = value.replace(/\D/g, '').slice(0, 6);
            setFormData(prev => ({ ...prev, [id]: rawPin }));
            setValidationErrors(prev => ({ ...prev, [id]: undefined }));
            return;
        }

        setFormData(prev => ({ ...prev, [id]: value }));
        setValidationErrors(prev => ({ ...prev, [id]: undefined }));
    };

    const handleAadhaarChange = (e) => {
        const rawAadhaar = e.target.value.replace(/\D/g, '').slice(0, 12);
        setFormData(prev => ({ ...prev, aadhaar: rawAadhaar }));
    };

    const handleBlur = (e) => {
        const { id } = e.target;
        setTouchedFields(prev => ({ ...prev, [id]: true }));
    };

    // Derived Aadhaar display value
    const displayAadhaar = useMemo(() => {
        if (!formData.aadhaar) return '';
        if (isAadhaarFocused) {
            return formData.aadhaar.replace(/(\d{4})(?=\d)/g, '$1-');
        }
        if (formData.aadhaar.length === 12) {
            return `XXXX-XXXX-${formData.aadhaar.slice(-4)}`;
        }
        return formData.aadhaar.replace(/(\d{4})(?=\d)/g, '$1-'); // Partial mask if not 12
    }, [formData.aadhaar, isAadhaarFocused]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            if (file.type.startsWith('image/')) {
                setFilePreview(URL.createObjectURL(file));
            } else if (file.type === 'application/pdf') {
                setFilePreview('PDF');
            } else {
                setFilePreview(null);
            }
        }
    };

    const removeFile = () => {
        setFilePreview(null);
        setFileName('');
        const fileInput = document.getElementById('dropzone-file');
        if (fileInput) fileInput.value = '';
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) {
            errors.name = 'Full Name is required';
        }

        if (!formData.phone.trim()) {
            errors.phone = 'Phone Number is required';
        } else if (formData.phone.length !== 10) {
            errors.phone = 'Phone Number must be exactly 10 digits';
        }

        if (!formData.city.trim()) {
            errors.city = 'City is required';
        }

        if (!formData.state.trim()) {
            errors.state = 'State is required';
        }

        if (!formData.pinCode.trim()) {
            errors.pinCode = 'PIN Code is required';
        } else if (formData.pinCode.length !== 6) {
            errors.pinCode = 'PIN Code must be exactly 6 digits';
        }

        return errors;
    };

    const getFieldError = (field) => {
        if (!touchedFields[field] && !validationErrors[field]) return '';
        return validationErrors[field] || validateForm()[field] || '';
    };

    const fieldClassName = (field) => getFieldError(field) ? invalidInputClass : '';

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setTouchedFields(prev => ({
                ...prev,
                name: true,
                phone: true,
                city: true,
                state: true,
                pinCode: true
            }));
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                fullName: formData.name,
                phone: formData.phone,
                alternatePhone: formData.altPhone,
                aadhaar: formData.aadhaar,
                address: {
                    street: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pinCode
                },
                kycDocumentType: normalizeDocumentType(formData.docType),
                kycDocumentImage: filePreview || ""
            };

            const response = await api.post('/customers', payload);
            const newCustomer = response.data.customer;
            
            showToast('success', 'Customer created successfully');
            
            // Short delay to show the toast before navigation
            setTimeout(() => {
                navigate('/customers');
            }, 1000);
            
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to create customer';
            showToast('error', errorMessage);
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        if (hasUnsavedChanges && !window.confirm('Are you sure you want to reset all fields?')) {
            return;
        }
        setFormData({
            name: '', phone: '', altPhone: '', aadhaar: '',
            address: '', city: '', state: '', pinCode: '', docType: 'Aadhaar'
        });
        setValidationErrors({});
        setTouchedFields({});
        removeFile();
    };

    return (
        <div className="relative min-h-[calc(100vh-8rem)] pb-24">
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
                <button 
                    onClick={() => {
                        if (!hasUnsavedChanges || window.confirm('Discard unsaved changes?')) {
                            navigate('/customers');
                        }
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                    <FiArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Add New Customer</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Enter personal and KYC details to create a customer profile.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mx-auto max-w-6xl">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    
                    {/* Left Section: Personal Details */}
                    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900 h-max">
                        <h2 className="mb-6 text-lg font-medium text-slate-900 dark:text-white">Personal Details</h2>
                        
                        <div className="space-y-5">
                            <div>
                                <Input 
                                    label="Full Name *" 
                                    id="name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    onBlur={handleBlur}
                                    placeholder="Enter full name" 
                                    className={fieldClassName('name')}
                                />
                                {getFieldError('name') && (
                                    <p className="mt-1 text-xs font-medium text-red-500">{getFieldError('name')}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <Input 
                                        label="Phone Number *" 
                                        id="phone" 
                                        value={formData.phone} 
                                        onChange={handleChange} 
                                        onBlur={handleBlur}
                                        placeholder="10-digit mobile number" 
                                        maxLength={10}
                                        className={fieldClassName('phone')}
                                    />
                                    {getFieldError('phone') && (
                                        <p className="mt-1 text-xs font-medium text-red-500">{getFieldError('phone')}</p>
                                    )}
                                </div>
                                <div>
                                    <Input 
                                        label="Alternate Phone" 
                                        id="altPhone" 
                                        value={formData.altPhone} 
                                        onChange={handleChange} 
                                        placeholder="Optional" 
                                        maxLength={10}
                                    />
                                </div>
                            </div>

                            <div>
                                <Input 
                                    label="Aadhaar Number *" 
                                    id="aadhaar" 
                                    value={displayAadhaar} 
                                    onChange={handleAadhaarChange} 
                                    onFocus={() => setIsAadhaarFocused(true)}
                                    onBlur={() => setIsAadhaarFocused(false)}
                                    placeholder="12-digit Aadhaar number" 
                                />
                                {formData.aadhaar && formData.aadhaar.length !== 12 && (
                                    <p className="mt-1 text-xs text-red-500">Must be exactly 12 digits</p>
                                )}
                            </div>

                            <div>
                                <Input 
                                    label="Street Address *" 
                                    id="address" 
                                    value={formData.address} 
                                    onChange={handleChange} 
                                    placeholder="House/Flat No., Street Name, Area" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Section: Address & KYC */}
                    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900 h-max">
                        <h2 className="mb-6 text-lg font-medium text-slate-900 dark:text-white">Address & KYC</h2>
                        
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <Input 
                                        label="City *" 
                                        id="city" 
                                    value={formData.city} 
                                    onChange={handleChange} 
                                    onBlur={handleBlur}
                                    placeholder="Enter city" 
                                    className={fieldClassName('city')}
                                />
                                {getFieldError('city') && (
                                    <p className="mt-1 text-xs font-medium text-red-500">{getFieldError('city')}</p>
                                )}
                            </div>
                            <div>
                                <Input 
                                        label="State *" 
                                        id="state" 
                                    value={formData.state} 
                                    onChange={handleChange} 
                                    onBlur={handleBlur}
                                    placeholder="Enter state" 
                                    className={fieldClassName('state')}
                                />
                                {getFieldError('state') && (
                                    <p className="mt-1 text-xs font-medium text-red-500">{getFieldError('state')}</p>
                                )}
                            </div>
                        </div>

                            <div>
                                <Input 
                                    label="PIN Code *" 
                                    id="pinCode" 
                                    value={formData.pinCode} 
                                    onChange={handleChange} 
                                    onBlur={handleBlur}
                                    placeholder="6-digit PIN code" 
                                    maxLength={6}
                                    className={fieldClassName('pinCode')}
                                />
                                {getFieldError('pinCode') && (
                                    <p className="mt-1 text-xs font-medium text-red-500">{getFieldError('pinCode')}</p>
                                )}
                            </div>

                            <hr className="border-slate-200 dark:border-slate-700" />

                            <div>
                                <Select 
                                    label="Document Type *" 
                                    id="docType"
                                    value={formData.docType}
                                    onChange={handleChange}
                                    options={documentTypeOptions}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                                    KYC Document Upload
                                </label>
                                
                                {!filePreview ? (
                                    <div className="flex w-full items-center justify-center">
                                        <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-800">
                                            <div className="flex flex-col items-center justify-center pb-5 pt-5">
                                                <FiUploadCloud className="mb-2 h-6 w-6 text-slate-400" />
                                                <p className="mb-1 text-sm text-slate-600 dark:text-slate-400">
                                                    <span className="font-semibold text-sky-600 dark:text-sky-400">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-slate-500">JPG, PNG or PDF (Max 5MB)</p>
                                            </div>
                                            <input id="dropzone-file" type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />
                                        </label>
                                    </div>
                                ) : (
                                    <div className="relative flex items-center gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                                            {filePreview === 'PDF' ? (
                                                <FiFileText size={28} className="text-red-500" />
                                            ) : (
                                                <img src={filePreview} alt="Preview" className="h-full w-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{fileName}</p>
                                            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                                                <FiCheckCircle size={12} /> Uploaded successfully
                                            </p>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={removeFile}
                                            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
                                            title="Remove file"
                                        >
                                            <FiX size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-slate-200/80 bg-white/80 p-4 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/80 md:pl-64">
                    <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 sm:gap-4">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={handleReset}
                            className="text-slate-600 dark:text-slate-300 w-full sm:w-auto"
                        >
                            Reset Form
                        </Button>
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={() => {
                                if (!hasUnsavedChanges || window.confirm('Discard unsaved changes?')) {
                                    navigate('/customers');
                                }
                            }}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full sm:w-auto min-w-[140px] flex justify-center items-center gap-2"
                        >
                            {isSubmitting ? 'Saving...' : <><FiSave /> Save Customer</>}
                        </Button>
                    </div>
                </div>
            </form>

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
};

export default AddCustomerPage;
