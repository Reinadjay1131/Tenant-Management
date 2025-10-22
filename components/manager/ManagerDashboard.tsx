import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import Card from '../shared/Card';
import { PaymentStatus, MaintenanceStatus, Tenant } from '../../types';
import { getAIInsight } from '../../services/geminiService';
import { SparklesIcon, ArrowPathIcon, CalendarDaysIcon, UsersIcon, CurrencyDollarIcon, WrenchScrewdriverIcon, BuildingOffice2Icon } from '@heroicons/react/24/solid';

const AIAssistant: React.FC = () => {
    const { tenants, payments, requests } = useContext(AppContext);
    const [prompt, setPrompt] = useState('');
    const [year, setYear] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAsk = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setResponse('');
        const res = await getAIInsight(prompt, { tenants, payments, requests }, year);
        setResponse(res);
        setIsLoading(false);
    };

    const quickPrompts = [
        "Summarize outstanding issues this month.",
        "Draft a rent reminder for late tenants.",
        "Which apartments have open maintenance requests?",
        "List all tenants whose leases expire in the next 6 months.",
        "Provide a summary of financials for the year."
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ask about your property management..."
                        className="w-full p-4 pr-16 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 text-sm"
                        disabled={isLoading}
                        onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
                    />
                    <button
                        onClick={handleAsk}
                        disabled={isLoading || !prompt.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-600 text-white p-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-brand-700 disabled:bg-neutral-300 transition-all duration-200"
                    >
                        {isLoading ? (
                            <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        ) : (
                            <SparklesIcon className="h-4 w-4" />
                        )}
                    </button>
                </div>
                <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="Year (optional)"
                    className="p-4 w-full lg:w-32 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 text-sm"
                    disabled={isLoading}
                />
            </div>

            <div className="flex flex-wrap gap-2">
                {quickPrompts.map(p => (
                    <button 
                        key={p} 
                        onClick={() => setPrompt(p)} 
                        className="text-xs bg-brand-50 text-brand-700 font-medium px-3 py-2 rounded-full hover:bg-brand-100 border border-brand-200 transition-all duration-200"
                    >
                        {p}
                    </button>
                ))}
            </div>
            
            {isLoading && (
                <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3 text-neutral-600">
                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
                        <span className="font-medium">AI is analyzing your data...</span>
                    </div>
                </div>
            )}

            {response && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 animate-slide-up">
                    <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <SparklesIcon className="h-4 w-4 text-brand-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-neutral-900 mb-2">AI Insights</h4>
                            <div className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
                                {response}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const LeaseExpiryWatchlist: React.FC = () => {
    const { tenants } = useContext(AppContext);

    const expiringLeases = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const thirtyDaysFromNow = new Date(today);
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        return tenants
            .filter(tenant => {
                const leaseEndDate = new Date(tenant.leaseEndDate + 'T00:00:00');
                return leaseEndDate >= today && leaseEndDate <= thirtyDaysFromNow;
            })
            .sort((a, b) => new Date(a.leaseEndDate).getTime() - new Date(b.leaseEndDate).getTime());
    }, [tenants]);

    const getDaysUntilExpiry = (leaseEndDate: string) => {
        const today = new Date();
        const expiry = new Date(leaseEndDate + 'T00:00:00');
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getUrgencyColor = (days: number) => {
        if (days <= 7) return 'text-danger-600 bg-danger-50 border-danger-200';
        if (days <= 14) return 'text-warning-600 bg-warning-50 border-warning-200';
        return 'text-brand-600 bg-brand-50 border-brand-200';
    };

    return (
        <div className="space-y-4">
            {expiringLeases.length > 0 ? (
                <>
                    <div className="text-sm text-neutral-600 mb-4">
                        <span className="font-medium">{expiringLeases.length}</span> lease{expiringLeases.length > 1 ? 's' : ''} expiring in the next 30 days
                    </div>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {expiringLeases.map(tenant => {
                            const daysUntilExpiry = getDaysUntilExpiry(tenant.leaseEndDate);
                            return (
                                <div 
                                    key={tenant.id} 
                                    className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200 hover:shadow-soft transition-all duration-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-bold text-neutral-700">
                                                {tenant.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-neutral-900">{tenant.name}</p>
                                            <p className="text-sm text-neutral-600">Apartment {tenant.apartmentNumber}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(daysUntilExpiry)}`}>
                                            {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
                                        </div>
                                        <p className="text-xs text-neutral-500 mt-1">
                                            {new Date(tenant.leaseEndDate + 'T00:00:00').toLocaleDateString(undefined, { 
                                                month: 'short', 
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 bg-success-100 rounded-2xl flex items-center justify-center mb-4">
                        <CalendarDaysIcon className="h-8 w-8 text-success-600" />
                    </div>
                    <p className="font-medium text-neutral-900 mb-2">All Clear!</p>
                    <p className="text-sm text-neutral-600">No leases are expiring in the next 30 days.</p>
                </div>
            )}
        </div>
    );
};


const ManagerDashboard: React.FC = () => {
    const { tenants, payments, requests, currentProperty } = useContext(AppContext);

    const totalTenants = tenants.length;
    const openRequests = requests.filter(r => r.status !== MaintenanceStatus.Completed).length;

    const currentYear = new Date().getFullYear();
    const rentCollected = payments
        .filter(p => p.status === PaymentStatus.Paid && new Date(p.dueDate + 'T00:00:00').getFullYear() === currentYear)
        .reduce((sum, p) => sum + p.amount, 0);
    const rentDue = payments
        .filter(p => new Date(p.dueDate + 'T00:00:00').getFullYear() === currentYear)
        .reduce((sum, p) => sum + p.amount, 0);

    const collectionRate = rentDue > 0 ? (rentCollected / rentDue) * 100 : 0;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-600 to-brand-500 rounded-2xl p-8 text-white shadow-medium">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
                        <p className="text-brand-100 text-lg">
                            Managing {currentProperty?.name || 'Property'}
                        </p>
                        <p className="text-brand-200 text-sm mt-1">
                            {currentProperty?.address || 'Property management system'}
                        </p>
                    </div>
                    <div className="mt-6 md:mt-0">
                        <div className="text-right">
                            <div className="text-2xl font-bold">{new Date().toLocaleDateString()}</div>
                            <div className="text-brand-200 text-sm">Today</div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card variant="glass" padding="md" className="text-center group hover:scale-105 transition-transform duration-200">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 rounded-xl mb-4">
                        <UsersIcon className="h-6 w-6 text-brand-600" />
                    </div>
                    <p className="text-3xl font-bold text-neutral-900 mb-1">{totalTenants}</p>
                    <p className="text-neutral-600 font-medium">Active Tenants</p>
                    <div className="mt-2 text-xs text-neutral-500">Across all units</div>
                </Card>

                <Card variant="glass" padding="md" className="text-center group hover:scale-105 transition-transform duration-200">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-success-100 rounded-xl mb-4">
                        <CurrencyDollarIcon className="h-6 w-6 text-success-600" />
                    </div>
                    <p className="text-3xl font-bold text-neutral-900 mb-1">₦{rentCollected.toLocaleString()}</p>
                    <p className="text-neutral-600 font-medium">Collected This Year</p>
                    <div className="mt-2">
                        <div className="text-xs text-neutral-500">
                            {collectionRate.toFixed(1)}% collection rate
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1">
                            <div 
                                className="bg-success-500 h-1.5 rounded-full transition-all duration-500" 
                                style={{ width: `${Math.min(collectionRate, 100)}%` }}
                            />
                        </div>
                    </div>
                </Card>

                <Card variant="glass" padding="md" className="text-center group hover:scale-105 transition-transform duration-200">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-warning-100 rounded-xl mb-4">
                        <WrenchScrewdriverIcon className="h-6 w-6 text-warning-600" />
                    </div>
                    <p className="text-3xl font-bold text-neutral-900 mb-1">{openRequests}</p>
                    <p className="text-neutral-600 font-medium">Open Requests</p>
                    <div className="mt-2 text-xs text-neutral-500">Maintenance items</div>
                </Card>

                <Card variant="glass" padding="md" className="text-center group hover:scale-105 transition-transform duration-200">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 rounded-xl mb-4">
                        <BuildingOffice2Icon className="h-6 w-6 text-brand-600" />
                    </div>
                    <p className="text-3xl font-bold text-neutral-900 mb-1">{totalTenants}</p>
                    <p className="text-neutral-600 font-medium">Occupied Units</p>
                    <div className="mt-2 text-xs text-neutral-500">Current occupancy</div>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <Card variant="elevated" title={
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                            <SparklesIcon className="h-5 w-5 text-brand-600" />
                        </div>
                        <span>AI Assistant</span>
                    </div>
                }>
                    <AIAssistant />
                </Card>

                <Card variant="elevated" title={
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                            <CalendarDaysIcon className="h-5 w-5 text-warning-600" />
                        </div>
                        <span>Lease Expiry Watchlist</span>
                    </div>
                }>
                    <LeaseExpiryWatchlist />
                </Card>
            </div>
        </div>
    );
};

export default ManagerDashboard;