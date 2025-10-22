import React, { useContext, useState, useEffect, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import Card from '../shared/Card';
import { Tenant, PaymentFrequency } from '../../types';
import { UserCircleIcon, PhoneIcon, EnvelopeIcon, CalendarDaysIcon, XMarkIcon, PencilSquareIcon, NoSymbolIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const TenantDetails: React.FC<{ tenant: Tenant; onEdit: (tenant: Tenant) => void }> = ({ tenant, onEdit }) => (
    <div className="p-4 bg-blue-50 rounded-lg group relative flex items-center gap-6 border-l-4 border-brand-accent">
        {tenant.profilePicture ? (
            <img src={tenant.profilePicture} alt={tenant.name} className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md flex-shrink-0" />
        ) : (
            <div className="flex-shrink-0 h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center">
                <UserCircleIcon className="h-16 w-16 text-slate-400" />
            </div>
        )}
        <div className="flex-grow">
            <h4 className="font-bold text-lg text-brand-primary">{tenant.name}</h4>
            <p className="font-semibold text-slate-700">Apt {tenant.apartmentNumber}</p>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600">
                <div className="flex items-center gap-2"><PhoneIcon className="h-4 w-4 text-slate-400"/> {tenant.phone}</div>
                <div className="flex items-center gap-2"><EnvelopeIcon className="h-4 w-4 text-slate-400"/> {tenant.email}</div>
                <div className="flex items-center gap-2 col-span-full mt-1 pt-1 border-t border-blue-200">
                    <CalendarDaysIcon className="h-4 w-4 text-slate-400"/> 
                    Lease: {new Date(tenant.leaseStartDate + 'T00:00:00').toLocaleDateString()} to {new Date(tenant.leaseEndDate + 'T00:00:00').toLocaleDateString()}
                </div>
            </div>
        </div>
        <div className="text-right flex-shrink-0">
             <p className="font-semibold text-slate-800 text-lg">₦{tenant.rentAmount.toLocaleString()}</p>
             <p className="text-sm text-slate-500 capitalize">{tenant.paymentFrequency} Rent</p>
        </div>
         <button 
            onClick={() => onEdit(tenant)}
            className="absolute top-2 right-2 p-1.5 bg-white rounded-full text-slate-500 hover:bg-brand-light hover:text-brand-primary transition-colors"
            aria-label={`Edit ${tenant.name}`}
        >
            <PencilSquareIcon className="h-5 w-5" />
        </button>
    </div>
);

interface TenantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tenant: Tenant | Omit<Tenant, 'id' | 'propertyId'>) => void;
  initialData?: Tenant | null;
}

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

const TenantFormModal: React.FC<TenantFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const initialFormState: Omit<Tenant, 'id' | 'profilePicture' | 'propertyId'> & { profilePicture?: string } = {
        name: '', email: '', phone: '', apartmentNumber: '', leaseStartDate: '', leaseEndDate: '', rentAmount: 0, paymentFrequency: PaymentFrequency.Annual, profilePicture: ''
    };

    const [formData, setFormData] = useState<Tenant | Omit<Tenant, 'id' | 'propertyId'>>(initialFormState);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || initialFormState);
        }
    }, [isOpen, initialData]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await blobToBase64(file);
            setFormData(prev => ({
                ...prev,
                profilePicture: base64,
            }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData(prev => ({
            ...prev,
            [name]: isNumber ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    const isEditing = !!initialData;
    const profilePicture = 'profilePicture' in formData ? formData.profilePicture : '';


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative max-h-full overflow-y-auto">
                 <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">{isEditing ? 'Edit Tenant' : 'Add New Tenant'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col items-center gap-2">
                        {profilePicture ? (
                            <img src={profilePicture} alt="Profile Preview" className="h-24 w-24 rounded-full object-cover border-4 border-slate-200" />
                        ) : (
                            <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed">
                                <UserCircleIcon className="h-16 w-16 text-slate-300" />
                            </div>
                        )}
                        <div>
                            <label htmlFor="profilePicture" className="cursor-pointer text-sm font-medium text-brand-primary hover:text-brand-secondary underline">
                                {isEditing ? 'Change' : 'Upload'} Photo
                            </label>
                            <input type="file" name="profilePicture" id="profilePicture" accept="image/*" onChange={handleFileChange} className="hidden"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                            <input type="text" name="name" id="name" value={'name' in formData ? formData.name : ''} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-brand-secondary focus:border-brand-secondary"/>
                        </div>
                        <div>
                            <label htmlFor="apartmentNumber" className="block text-sm font-medium text-slate-700">Apartment #</label>
                            <input type="text" name="apartmentNumber" id="apartmentNumber" value={'apartmentNumber' in formData ? formData.apartmentNumber : ''} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-brand-secondary focus:border-brand-secondary"/>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                            <input type="email" name="email" id="email" value={'email' in formData ? formData.email : ''} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-brand-secondary focus:border-brand-secondary"/>
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone</label>
                            <input type="tel" name="phone" id="phone" value={'phone' in formData ? formData.phone : ''} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-brand-secondary focus:border-brand-secondary"/>
                        </div>
                        <div>
                            <label htmlFor="leaseStartDate" className="block text-sm font-medium text-slate-700">Lease Start Date</label>
                            <input type="date" name="leaseStartDate" id="leaseStartDate" value={'leaseStartDate' in formData ? formData.leaseStartDate : ''} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-brand-secondary focus:border-brand-secondary"/>
                        </div>
                        <div>
                            <label htmlFor="leaseEndDate" className="block text-sm font-medium text-slate-700">Lease End Date</label>
                            <input type="date" name="leaseEndDate" id="leaseEndDate" value={'leaseEndDate' in formData ? formData.leaseEndDate : ''} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-brand-secondary focus:border-brand-secondary"/>
                        </div>
                         <div>
                            <label htmlFor="rentAmount" className="block text-sm font-medium text-slate-700">Rent Amount (₦)</label>
                            <input type="number" name="rentAmount" id="rentAmount" value={'rentAmount' in formData ? formData.rentAmount : 0} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-brand-secondary focus:border-brand-secondary" min="0" step="0.01"/>
                        </div>
                        <div>
                            <label htmlFor="paymentFrequency" className="block text-sm font-medium text-slate-700">Payment Frequency</label>
                            <select name="paymentFrequency" id="paymentFrequency" value={'paymentFrequency' in formData ? formData.paymentFrequency : PaymentFrequency.Annual} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-brand-secondary focus:border-brand-secondary">
                                <option value={PaymentFrequency.Weekly}>Weekly</option>
                                <option value={PaymentFrequency.Monthly}>Monthly</option>
                                <option value={PaymentFrequency.Annual}>Yearly</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300">
                            Cancel
                        </button>
                        <button type="submit" className="bg-brand-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-secondary">
                            Save Tenant
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ManagerTenants: React.FC = () => {
    const { tenants, addTenant, updateTenant, currentProperty } = useContext(AppContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTenants = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expiringSoonThreshold = new Date(today);
        expiringSoonThreshold.setDate(today.getDate() + 60);

        let result = tenants;

        // Apply lease status filter
        if (filter !== 'all') {
            result = result.filter(tenant => {
                const leaseEndDate = new Date(tenant.leaseEndDate + 'T00:00:00');
                switch (filter) {
                    case 'expiringSoon':
                        return leaseEndDate >= today && leaseEndDate <= expiringSoonThreshold;
                    case 'active':
                        return leaseEndDate > expiringSoonThreshold;
                    case 'expired':
                        return leaseEndDate < today;
                    default:
                        return true;
                }
            });
        }
        
        // Apply search filter
        if (searchQuery.trim() !== '') {
            const lowercasedQuery = searchQuery.toLowerCase();
            result = result.filter(tenant => 
                tenant.name.toLowerCase().includes(lowercasedQuery) ||
                tenant.apartmentNumber.includes(lowercasedQuery)
            );
        }
    
        return result;

    }, [tenants, filter, searchQuery]);

    const handleOpenAddModal = () => {
        setEditingTenant(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (tenant: Tenant) => {
        setEditingTenant(tenant);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTenant(null);
    };

    const handleSave = (data: Tenant | Omit<Tenant, 'id' | 'propertyId'>) => {
        if ('id' in data) {
            updateTenant(data.id, data);
        } else {
            addTenant(data);
        }
    };

    return (
        <>
            <div className="space-y-6">
                 <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Tenants</h1>
                        <p className="text-slate-500">Managing tenants for {currentProperty?.name}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                         <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name or apt #"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border-slate-300 rounded-md shadow-sm p-2 pl-10 focus:ring-brand-secondary focus:border-brand-secondary"
                            />
                            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                         <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="border-slate-300 rounded-md shadow-sm p-2 focus:ring-brand-secondary focus:border-brand-secondary"
                        >
                            <option value="all">All Tenants</option>
                            <option value="active">Active Leases</option>
                            <option value="expiringSoon">Expiring Soon (60 days)</option>
                            <option value="expired">Expired Leases</option>
                        </select>
                        <button 
                            onClick={handleOpenAddModal}
                            className="bg-brand-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-secondary"
                        >
                            Add Tenant
                        </button>
                    </div>
                </div>

                <Card>
                    <div className="space-y-4">
                        {filteredTenants.length > 0 ? (
                           filteredTenants.map(tenant => (
                                <TenantDetails key={tenant.id} tenant={tenant} onEdit={handleOpenEditModal}/>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center py-12">
                                <NoSymbolIcon className="h-12 w-12 text-slate-300 mb-2" />
                                <p className="text-slate-500 font-medium">No tenants match the current filters.</p>
                                <p className="text-sm text-slate-400">Try adjusting your search or filter options.</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
            <TenantFormModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                initialData={editingTenant}
            />
        </>
    );
};

export default ManagerTenants;