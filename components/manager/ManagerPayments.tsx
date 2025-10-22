import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import Card from '../shared/Card';
import { Payment, PaymentStatus, Tenant } from '../../types';

const getStatusClasses = (status: PaymentStatus) => {
    switch (status) {
        case PaymentStatus.Paid: return 'bg-status-paid/10 text-status-paid border-status-paid/20';
        case PaymentStatus.Late: return 'bg-status-late/10 text-status-late border-status-late/20';
        case PaymentStatus.Unpaid: return 'bg-status-pending/10 text-status-pending border-status-pending/20';
        default: return 'bg-slate-100 text-slate-600';
    }
};

const PaymentRow: React.FC<{ payment: Payment; tenant?: Tenant; onCollectRent: (paymentId: string) => void }> = ({ payment, tenant, onCollectRent }) => {
    return (
        <tr className="border-b border-slate-200 hover:bg-slate-50">
            <td className="p-3">
                <p className="font-semibold text-slate-800">{tenant?.name || 'N/A'}</p>
                <p className="text-sm text-slate-500">Apt {tenant?.apartmentNumber}</p>
            </td>
            <td className="p-3 text-slate-600">₦{payment.amount.toLocaleString()}</td>
            <td className="p-3 text-slate-600">{new Date(payment.dueDate  + 'T00:00:00').toLocaleDateString()}</td>
            <td className="p-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusClasses(payment.status)}`}>
                    {payment.status}
                </span>
            </td>
            <td className="p-3">
                {payment.status === PaymentStatus.Paid ? (
                    <span className="text-sm text-slate-500">Paid on {payment.paidDate ? new Date(payment.paidDate + 'T00:00:00').toLocaleDateString() : ''}</span>
                ) : (
                    <button
                        onClick={() => onCollectRent(payment.id)}
                        className="bg-brand-primary text-white font-semibold py-1 px-3 text-xs rounded-lg hover:bg-brand-secondary"
                    >
                        Collect Rent
                    </button>
                )}
            </td>
        </tr>
    );
};

const ManagerPayments: React.FC = () => {
    const { payments, tenants, markPaymentAsPaid, currentProperty } = useContext(AppContext);
    
    const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
    const [selectedYear, setSelectedYear] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('all');

    const tenantMap = useMemo(() => new Map(tenants.map(t => [t.id, t])), [tenants]);

    const uniqueYears = useMemo(() => {
        const years = new Set(payments.map(p => new Date(p.dueDate + 'T00:00:00').getFullYear().toString()));
        return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
    }, [payments]);

    const months = [
        { value: '1', label: 'January' }, { value: '2', label: 'February' },
        { value: '3', label: 'March' }, { value: '4', label: 'April' },
        { value: '5', label: 'May' }, { value: '6', label: 'June' },
        { value: '7', label: 'July' }, { value: '8', label: 'August' },
        { value: '9', label: 'September' }, { value: '10', label: 'October' },
        { value: '11', label: 'November' }, { value: '12', label: 'December' },
    ];

    const filteredPayments = useMemo(() => {
        let result = payments;
        
        // Filter by date
        if (selectedYear !== 'all') {
            result = result.filter(p => new Date(p.dueDate + 'T00:00:00').getFullYear().toString() === selectedYear);
        }
        if (selectedMonth !== 'all') {
            result = result.filter(p => (new Date(p.dueDate + 'T00:00:00').getMonth() + 1).toString() === selectedMonth);
        }

        // Filter by status
        if (statusFilter !== 'all') {
            result = result.filter(p => p.status === statusFilter);
        }

        return result.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
    }, [payments, statusFilter, selectedYear, selectedMonth]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Payments</h1>
                <p className="text-slate-500">For {currentProperty?.name}</p>
            </div>


            <Card>
                <div className="flex flex-wrap justify-end items-center gap-4 mb-4">
                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="border-slate-300 rounded-md shadow-sm">
                        <option value="all">All Years</option>
                        {uniqueYears.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="border-slate-300 rounded-md shadow-sm">
                        <option value="all">All Months</option>
                        {months.map(month => <option key={month.value} value={month.value}>{month.label}</option>)}
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'all')} className="border-slate-300 rounded-md shadow-sm">
                        <option value="all">All Statuses</option>
                        <option value={PaymentStatus.Paid}>Paid</option>
                        <option value={PaymentStatus.Unpaid}>Unpaid</option>
                        <option value={PaymentStatus.Late}>Late</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-600 uppercase">
                            <tr>
                                <th className="p-3">Tenant</th>
                                <th className="p-3">Amount</th>
                                <th className="p-3">Due Date</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.map(payment => (
                                <PaymentRow 
                                    key={payment.id} 
                                    payment={payment} 
                                    tenant={tenantMap.get(payment.tenantId)}
                                    onCollectRent={markPaymentAsPaid}
                                />
                            ))}
                        </tbody>
                    </table>
                     {filteredPayments.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            No payments match the selected filters.
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ManagerPayments;