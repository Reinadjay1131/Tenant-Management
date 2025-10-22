
import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import Card from '../shared/Card';
import { MaintenanceStatus, MaintenanceRequest } from '../../types';

const getStatusClasses = (status: MaintenanceStatus) => {
    switch (status) {
        case MaintenanceStatus.Completed: return 'bg-status-completed/10 text-status-completed border-status-completed/20';
        case MaintenanceStatus.InProgress: return 'bg-status-progress/10 text-status-progress border-status-progress/20';
        case MaintenanceStatus.Submitted: return 'bg-status-pending/10 text-status-pending border-status-pending/20';
        default: return 'bg-slate-100 text-slate-600';
    }
};

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error('Failed to convert blob to base64 string'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}


const TenantMaintenance: React.FC = () => {
    const { requests, currentTenant, addRequest } = useContext(AppContext);
    const [description, setDescription] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);

    const tenantRequests = useMemo(() => {
        if (!currentTenant) return [];
        return requests
            .filter(r => r.tenantId === currentTenant.id)
            .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());
    }, [requests, currentTenant]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim() || !currentTenant) return;

        let photoBase64: string | undefined = undefined;
        if (photo) {
            photoBase64 = `data:${photo.type};base64,${await blobToBase64(photo)}`;
        }
        
        addRequest({
            tenantId: currentTenant.id,
            description,
            photo: photoBase64
        });
        setDescription('');
        setPhoto(null);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Maintenance Requests</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card title="New Request">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-slate-700">Describe the issue</label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={5}
                                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-brand-secondary focus:border-brand-secondary"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="photo" className="block text-sm font-medium text-slate-700">Attach a photo (optional)</label>
                                <input
                                    type="file"
                                    id="photo"
                                    onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)}
                                    accept="image/*"
                                    className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-light file:text-brand-primary hover:file:bg-blue-200"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-secondary"
                            >
                                Submit Request
                            </button>
                        </form>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card title="Your Request History">
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {tenantRequests.map((req: MaintenanceRequest) => (
                                <div key={req.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div className="flex justify-between items-start">
                                        <p className="text-xs text-slate-500">{new Date(req.submittedDate).toLocaleDateString()}</p>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusClasses(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-700">{req.description}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TenantMaintenance;
