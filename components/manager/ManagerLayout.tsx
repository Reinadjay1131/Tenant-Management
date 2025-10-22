

import React, { useState, useContext } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { HomeIcon, UsersIcon, CurrencyDollarIcon, WrenchScrewdriverIcon, MegaphoneIcon, Bars3Icon, XMarkIcon, BuildingOffice2Icon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { AppContext } from '../../context/AppContext';

const navigation = [
  { name: 'Dashboard', href: '/manager/dashboard', icon: HomeIcon, description: 'Overview & Analytics' },
  { name: 'Tenants', href: '/manager/tenants', icon: UsersIcon, description: 'Manage Residents' },
  { name: 'Payments', href: '/manager/payments', icon: CurrencyDollarIcon, description: 'Financial Records' },
  { name: 'Maintenance', href: '/manager/maintenance', icon: WrenchScrewdriverIcon, description: 'Service Requests' },
  { name: 'Announcements', href: '/manager/announcements', icon: MegaphoneIcon, description: 'Communications' },
];

const ManagerLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { currentProperty, setCurrentProperty } = useContext(AppContext);
    const navigate = useNavigate();

    const handleSwitchProperty = () => {
        setCurrentProperty(null);
        navigate('/manager');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
            {/* Mobile header */}
            <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 py-4 shadow-soft sm:px-6 lg:hidden">
                <button 
                    type="button" 
                    className="p-2 text-neutral-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors lg:hidden" 
                    onClick={() => setSidebarOpen(true)}
                >
                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-semibold text-neutral-900">{currentProperty?.name || 'Manager Portal'}</h1>
                    <p className="text-sm text-neutral-500">Property Management System</p>
                </div>
            </div>
            
            {/* Desktop sidebar */}
            <div className={`fixed inset-y-0 z-50 flex w-80 flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                {/* Sidebar header */}
                <div className="flex flex-col bg-gradient-to-b from-brand-600 to-brand-700 text-white">
                    <div className="flex h-20 items-center gap-x-4 px-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                            <BuildingOffice2Icon className="h-7 w-7"/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold tracking-tight">Zenith PM</h1>
                            <p className="text-brand-100 text-sm truncate font-medium">
                                {currentProperty?.name || 'Property Management'}
                            </p>
                        </div>
                    </div>
                    
                    {/* Property info card */}
                    {currentProperty && (
                        <div className="mx-6 mb-6 p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                            <div className="text-sm text-brand-100 mb-1">Current Property</div>
                            <div className="font-semibold text-white truncate">{currentProperty.name}</div>
                            <div className="text-xs text-brand-200 mt-1 truncate">{currentProperty.address}</div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex-1 bg-white border-r border-neutral-200 shadow-medium">
                    <nav className="flex flex-1 flex-col px-4 py-6">
                        <ul role="list" className="flex flex-1 flex-col gap-y-2">
                            {navigation.map((item) => (
                                <li key={item.name}>
                                    <NavLink
                                        to={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={({ isActive }) =>
                                            `group flex items-center gap-x-3 rounded-xl p-3 text-sm font-medium transition-all duration-200
                                            ${isActive 
                                                ? 'bg-brand-50 text-brand-700 shadow-soft border border-brand-200' 
                                                : 'text-neutral-700 hover:text-brand-700 hover:bg-brand-50/50'
                                            }`
                                        }
                                    >
                                        <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold">{item.name}</div>
                                            <div className="text-xs text-neutral-500 mt-0.5">{item.description}</div>
                                        </div>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                        
                        {/* Bottom action */}
                        <div className="mt-auto pt-6 border-t border-neutral-200">
                            <button
                                onClick={handleSwitchProperty}
                                className="group w-full flex items-center gap-x-3 rounded-xl p-3 text-sm font-medium text-neutral-700 hover:text-danger-600 hover:bg-danger-50 transition-all duration-200"
                            >
                                <ArrowLeftOnRectangleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                                <div className="flex-1 text-left">
                                    <div className="font-semibold">Switch Property</div>
                                    <div className="text-xs text-neutral-500 mt-0.5">Change active property</div>
                                </div>
                            </button>
                        </div>
                    </nav>
                </div>

                {/* Mobile close button */}
                {sidebarOpen && (
                    <button 
                        onClick={() => setSidebarOpen(false)}
                        className="absolute top-4 -right-12 p-2 bg-white rounded-lg shadow-medium text-neutral-600 lg:hidden"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                )}
            </div>
            
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-40 lg:hidden" 
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <main className="lg:pl-80">
                <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default ManagerLayout;
