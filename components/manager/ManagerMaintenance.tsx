

import React, { useContext, useMemo, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import Card from '../shared/Card';
import { MaintenanceRequest, MaintenanceStatus, Tenant } from '../../types';
import { XMarkIcon } from '@heroicons/react/24/outline';

const getStatusClasses = (status: MaintenanceStatus) => {
    switch (status) {
        case MaintenanceStatus.Completed: return 'bg-status-completed/10 text-status-completed border-status-completed/20';
        case MaintenanceStatus.InProgress: return 'bg-status-progress/10 text-status-progress border-status-progress/20';
        case MaintenanceStatus.Submitted: return 'bg-status-pending/10 text-status-pending border-status-pending/20';
        default: return 'bg-slate-100 text-slate-600';
    }
};

const RequestCard: React.FC<{ request: MaintenanceRequest; tenant?: Tenant; onUpdateStatus: (id: string, status: MaintenanceStatus) => void }> = ({ request, tenant, onUpdateStatus }) => {
    return (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-semibold text-slate-800">Apt {request.apartmentNumber} - {tenant?.name || 'Unknown'}</p>
                    <p className="text-sm text-slate-500">Submitted: {new Date(request.submittedDate).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusClasses(request.status)}`}>
                    {request.status}
                </span>
            </div>
            <p className="mt-3 text-slate-700">{request.description}</p>
            {request.photo && (
                <div className="mt-3">
                    <a href={request.photo} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-secondary hover:underline">View Attached Photo</a>
                </div>
            )}
            <div className="mt-4 flex items-center gap-2">
                <label htmlFor={`status-${request.id}`} className="text-sm font-medium text-slate-600">Update Status:</label>
                <select 
                    id={`status-${request.id}`}
                    value={request.status}
                    onChange={(e) => onUpdateStatus(request.id, e.target.value as MaintenanceStatus)}
                    className="p-1 border border-slate-300 rounded-md text-sm focus:ring-brand-secondary focus:border-brand-secondary"
                >
                    <option value={MaintenanceStatus.Submitted}>Submitted</option>
                    <option value={MaintenanceStatus.InProgress}>In Progress</option>
                    <option value={MaintenanceStatus.Completed}>Completed</option>
                </select>
            </div>
        </div>
    );
};

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

interface MaintenanceRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<MaintenanceRequest, 'id' | 'submittedDate' | 'status' | 'apartmentNumber'>) => void;
    tenants: Tenant[];
}

const MaintenanceRequestModal: React.FC<MaintenanceRequestModalProps> = ({ isOpen, onClose, onSave, tenants }) => {
    const [tenantId, setTenantId] = useState('');
    const [description, setDescription] = useState('');
    const [photo, setPhoto] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (isOpen) {
            if (tenants.length > 0) {
                setTenantId(tenants[0].id);
            }
        } else {
            // Reset form on close
            setTenantId('');
            setDescription('');
            setPhoto(undefined);
        }
    }, [isOpen, tenants]);
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await blobToBase64(file);
            setPhoto(base64);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenantId || !description.trim()) {
            alert('Please select a tenant and provide a description.');
            return;
        }
        onSave({ tenantId, description, photo });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">New Maintenance Request</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="tenantId" className="block text-sm font-medium text-slate-700">Tenant</label>
                        <select 
                            id="tenantId" 
                            value={tenantId} 
                            onChange={e => setTenantId(e.target.value)} 
                            required 
                            className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-brand-secondary focus:border-brand-secondary"
                        >
                            {tenants.map(t => (
                                <option key={t.id} value={t.id}>{t.name} (Apt {t.apartmentNumber})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description of Issue</label>
                        <textarea 
                            id="description" 
                            rows={4} 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            required
                            className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-brand-secondary focus:border-brand-secondary"
                        />
                    </div>
                    <div>
                        <label htmlFor="photo" className="block text-sm font-medium text-slate-700">Attach a photo (optional)</label>
                        <input
                            type="file"
                            id="photo"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-light file:text-brand-primary hover:file:bg-blue-200"
                        />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300">
                            Cancel
                        </button>
                        <button type="submit" className="bg-brand-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-secondary">
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ManagerMaintenance: React.FC = () => {
    const { requests, tenants, updateRequestStatus, addRequest, currentProperty } = useContext(AppContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const tenantMap = useMemo(() => new Map(tenants.map(t => [t.id, t])), [tenants]);

    const sortedRequests = [...requests].sort((a,b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Maintenance Requests</h1>
                        <p className="text-slate-500">For {currentProperty?.name}</p>
                    </div>
                     <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-brand-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-secondary"
                    >
                        New Request
                    </button>
                </div>
                <Card>
                    <div className="space-y-4">
                        {sortedRequests.length > 0 ? (
                            sortedRequests.map(request => (
                                <RequestCard 
                                    key={request.id} 
                                    request={request}
                                    tenant={tenantMap.get(request.tenantId)}
                                    onUpdateStatus={updateRequestStatus}
                                />
                            ))
                        ) : (
                             <div className="text-center py-12">
                                <p className="text-slate-500">No maintenance requests found for this property.</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
            <MaintenanceRequestModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={addRequest}
                tenants={tenants}
            />
        </>
    );
};

export default ManagerMaintenance;