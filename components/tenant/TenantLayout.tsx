

import React, { useContext, useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { HomeIcon, CurrencyDollarIcon, WrenchScrewdriverIcon, Bars3Icon, XMarkIcon, UserCircleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: 'dashboard', icon: HomeIcon },
  { name: 'Payments', href: 'payments', icon: CurrencyDollarIcon },
  { name: 'Maintenance', href: 'maintenance', icon: WrenchScrewdriverIcon },
];

const TenantLayout: React.FC = () => {
    const { currentTenant, setCurrentTenant } = useContext(AppContext);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        setCurrentTenant(null);
    };

    if (!currentTenant) return null;

    return (
        <div className="min-h-screen bg-slate-100">
             {/* Mobile menu button */}
             <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-slate-800 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
                <button type="button" className="-m-2.5 p-2.5 text-white lg:hidden" onClick={() => setSidebarOpen(true)}>
                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                </button>
                <div className="flex-1 text-sm font-semibold leading-6 text-white">Tenant Portal</div>
            </div>
            
            {/* Static sidebar for desktop */}
            <div className={`fixed inset-y-0 z-50 flex w-72 flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-800 px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center gap-x-3 text-white">
                        <UserCircleIcon className="h-8 w-8"/>
                        <div>
                            <p className="font-bold text-lg">{currentTenant.name}</p>
                            <p className="text-xs text-slate-300">Apt {currentTenant.apartmentNumber}</p>
                        </div>
                    </div>
                    <nav className="flex flex-1 flex-col">
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul role="list" className="-mx-2 space-y-1">
                                    {navigation.map((item) => (
                                        <li key={item.name}>
                                            <NavLink
                                                to={item.href}
                                                onClick={() => setSidebarOpen(false)}
                                                className={({ isActive }) =>
                                                    `group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
                                                    ${ isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`
                                                }
                                            >
                                                <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                                {item.name}
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                            <li className="mt-auto">
                                <Link
                                    to="/"
                                    onClick={handleLogout}
                                    className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-slate-300 hover:bg-slate-700 hover:text-white"
                                >
                                    <ArrowLeftOnRectangleIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                    Logout
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
                 {sidebarOpen && (
                    <div className="absolute top-4 right-[-3rem] lg:hidden">
                        <button onClick={() => setSidebarOpen(false)} className="text-white">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                )}
            </div>
            
             {/* Overlay for mobile */}
             {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

            <main className="lg:pl-72">
                <div className="px-4 py-10 sm:px-6 lg:px-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default TenantLayout;
