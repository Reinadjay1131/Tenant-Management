import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import Card from '../shared/Card';
import { PaymentStatus, Payment } from '../../types';

const getStatusClasses = (status: PaymentStatus) => {
    switch (status) {
        case PaymentStatus.Paid: return 'bg-status-paid/10 text-status-paid border-status-paid/20';
        case PaymentStatus.Late: return 'bg-status-late/10 text-status-late border-status-late/20';
        case PaymentStatus.Unpaid: return 'bg-status-pending/10 text-status-pending border-status-pending/20';
        default: return 'bg-slate-100 text-slate-600';
    }
};

const TenantPayments: React.FC = () => {
    const { payments, currentTenant, markPaymentAsPaid } = useContext(AppContext);

    const tenantPayments = useMemo(() => {
        if (!currentTenant) return [];
        return payments
            .filter(p => p.tenantId === currentTenant.id)
            .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
    }, [payments, currentTenant]);

    const handlePayNow = (payment: Payment) => {
        if(payment.status === PaymentStatus.Unpaid || payment.status === PaymentStatus.Late){
            markPaymentAsPaid(payment.id);
            alert(`Payment of ₦${payment.amount} has been submitted.`);
        }
    };


    if (!currentTenant) return null;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Payment History</h1>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-600 uppercase">
                            <tr>
                                <th className="p-3">Due Date</th>
                                <th className="p-3">Amount</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Paid On</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tenantPayments.map(payment => (
                                <tr key={payment.id} className="border-b border-slate-200">
                                    <td className="p-3 font-medium text-slate-700">{new Date(payment.dueDate  + 'T00:00:00').toLocaleDateString()}</td>
                                    <td className="p-3 text-slate-600">₦{payment.amount.toLocaleString()}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusClasses(payment.status)}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-slate-600">{payment.paidDate ? new Date(payment.paidDate  + 'T00:00:00').toLocaleDateString() : 'N/A'}</td>
                                    <td className="p-3">
                                        {payment.status !== PaymentStatus.Paid && (
                                            <button 
                                                onClick={() => handlePayNow(payment)}
                                                className="bg-status-paid text-white font-semibold py-1 px-3 text-xs rounded-lg hover:bg-green-700"
                                            >
                                                Pay Now
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default TenantPayments;