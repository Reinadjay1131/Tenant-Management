
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import Card from '../shared/Card';
import { PaymentStatus } from '../../types';

const TenantDashboard: React.FC = () => {
    const { currentTenant, payments, announcements } = useContext(AppContext);

    const nextPayment = useMemo(() => {
        if (!currentTenant) return null;
        return payments
            .filter(p => p.tenantId === currentTenant.id && p.status !== PaymentStatus.Paid)
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
    }, [payments, currentTenant]);

    if (!currentTenant) {
        return <div>Loading tenant data...</div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-800">Welcome, {currentTenant.name.split(' ')[0]}!</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Next Payment Due">
                        {nextPayment ? (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-brand-primary">₦{nextPayment.amount.toLocaleString()}</p>
                                    <p className="text-slate-500">Due on {new Date(nextPayment.dueDate).toLocaleDateString()}</p>
                                </div>
                                <Link to="payments" className="bg-status-paid text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700">
                                    Pay Now
                                </Link>
                            </div>
                        ) : (
                            <p className="text-slate-600">You are all caught up on your payments. Thank you!</p>
                        )}
                    </Card>
                     <Card title="Quick Actions">
                        <div className="flex gap-4">
                            <Link to="maintenance" className="flex-1 text-center bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105">
                                Submit Maintenance Request
                            </Link>
                             <Link to="payments" className="flex-1 text-center bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105">
                                View Payment History
                            </Link>
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                     <Card title="Announcements">
                        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                            {announcements.slice(0,3).map(ann => (
                                <div key={ann.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="font-semibold text-slate-800 text-sm">{ann.title}</h4>
                                        <p className="text-xs text-slate-500">{new Date(ann.date).toLocaleDateString()}</p>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-600">{ann.content}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TenantDashboard;