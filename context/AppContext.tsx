import React, { createContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Tenant, Payment, MaintenanceRequest, Announcement, PaymentStatus, MaintenanceStatus, AppContextType, Property, PaymentFrequency } from '../types';

export const AppContext = createContext<AppContextType>(null!);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  const [currentProperty, setCurrentPropertyState] = useState<Property | null>(null);
  // FIX: Add state for the current tenant for the tenant portal.
  const [currentTenant, setCurrentTenantState] = useState<Tenant | null>(null);

  // Automatically update payment statuses on app load.
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    setPayments(currentPayments => {
        let hasChanges = false;
        
        const updatedPayments = currentPayments.map(payment => {
            const dueDate = new Date(payment.dueDate + 'T00:00:00');
            
            const isOverdue = dueDate < today && payment.status !== PaymentStatus.Paid;

            if (isOverdue && payment.status !== PaymentStatus.Late) {
                hasChanges = true;
                return { ...payment, status: PaymentStatus.Late };
            }
            
            return payment;
        });

        return hasChanges ? updatedPayments : currentPayments;
    });
  }, []);

  // Persistence for current property selection
  useEffect(() => {
    try {
      const storedProperty = sessionStorage.getItem('currentProperty');
      if (storedProperty) setCurrentPropertyState(JSON.parse(storedProperty));
    } catch (e) {
      console.error("Failed to parse from session storage", e);
      sessionStorage.clear();
    }
  }, []);

  // FIX: Add persistence for current tenant selection.
  useEffect(() => {
    try {
      const storedTenant = sessionStorage.getItem('currentTenant');
      if (storedTenant) setCurrentTenantState(JSON.parse(storedTenant));
    } catch (e) {
      console.error("Failed to parse from session storage", e);
      sessionStorage.clear();
    }
  }, []);

  const setCurrentProperty = (property: Property | null) => {
    sessionStorage.setItem('currentProperty', JSON.stringify(property));
    setCurrentPropertyState(property);
  };
  
  // FIX: Add setter for current tenant.
  const setCurrentTenant = (tenant: Tenant | null) => {
    sessionStorage.setItem('currentTenant', JSON.stringify(tenant));
    setCurrentTenantState(tenant);
  };
  
  const addProperty = (propertyData: Omit<Property, 'id'>) => {
    const newProperty = { ...propertyData, id: `prop${Date.now()}` };
    setProperties(prev => [...prev, newProperty]);
  };

  const addTenant = (tenantData: Omit<Tenant, 'id' | 'propertyId'>) => {
    if(!currentProperty) return;
    const newTenant = { ...tenantData, id: `t${Date.now()}`, propertyId: currentProperty.id };
    setTenants(prev => [...prev, newTenant]);

    // Create the first yearly payment record with the Due Date matching the Lease End Date.
    const newPayment: Payment = {
        id: `p${Date.now()}`,
        tenantId: newTenant.id,
        amount: newTenant.rentAmount,
        dueDate: newTenant.leaseEndDate, // Corrected logic: Due date is the lease end date.
        status: PaymentStatus.Unpaid
    };
    setPayments(prev => [...prev, newPayment]);
  };
  
  const updateTenant = (id: string, data: Partial<Omit<Tenant, 'id'>>) => {
    let updatedTenant: Tenant | undefined;
    setTenants(currentTenants => 
        currentTenants.map(t => {
            if (t.id === id) {
                updatedTenant = { ...t, ...data };
                return updatedTenant;
            }
            return t;
        })
    );

    if (data.leaseEndDate && updatedTenant) {
        setPayments(currentPayments => {
            const tenantPayments = currentPayments.filter(p => p.tenantId === id);
            const unpaidPayments = tenantPayments.filter(p => p.status !== PaymentStatus.Paid);
            
            const latestUnpaidPayment = unpaidPayments.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())[0];

            let finalPayments = [...currentPayments];

            if (latestUnpaidPayment) {
                // If there's an unpaid payment, sync its due date with the new lease end date.
                finalPayments = finalPayments.map(p => 
                    p.id === latestUnpaidPayment.id 
                    ? { ...p, dueDate: data.leaseEndDate! }
                    : p
                );
            } else {
                // If there are no unpaid payments (e.g., lease was extended after paying), create a new one.
                const newPayment: Payment = {
                    id: `p${Date.now()}`,
                    tenantId: id,
                    amount: updatedTenant.rentAmount,
                    dueDate: data.leaseEndDate,
                    status: PaymentStatus.Unpaid
                };
                finalPayments.push(newPayment);
            }
            
            return finalPayments;
        });
    }
};

  const addRequest = (requestData: Omit<MaintenanceRequest, 'id'|'submittedDate'|'status'|'apartmentNumber'>) => {
    const tenant = tenants.find(t => t.id === requestData.tenantId);
    if (!tenant) return;
    const newRequest = { 
        ...requestData, 
        id: `r${Date.now()}`,
        submittedDate: new Date().toISOString().split('T')[0],
        status: MaintenanceStatus.Submitted,
        apartmentNumber: tenant.apartmentNumber
    };
    setRequests(prev => [newRequest, ...prev]);
  };

  const updateRequestStatus = (id: string, status: MaintenanceStatus) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };
  
  const markPaymentAsPaid = (paymentId: string) => {
    setPayments(currentPayments => {
        const paymentToUpdate = currentPayments.find(p => p.id === paymentId);
        if (!paymentToUpdate || paymentToUpdate.status === PaymentStatus.Paid) {
            return currentPayments;
        }

        const tenant = tenants.find(t => t.id === paymentToUpdate.tenantId);
        if (!tenant) {
            console.error("Cannot create next payment: tenant not found.");
            return currentPayments;
        }

        const updatedPayments = currentPayments.map(p => 
            p.id === paymentId 
            ? { ...p, status: PaymentStatus.Paid, paidDate: new Date().toISOString().split('T')[0] }
            : p
        );

        const originalDueDate = new Date(paymentToUpdate.dueDate + 'T00:00:00');
        const nextDueDate = new Date(originalDueDate);
        
        switch (tenant.paymentFrequency) {
            case PaymentFrequency.Annual:
                nextDueDate.setFullYear(originalDueDate.getFullYear() + 1);
                break;
            case PaymentFrequency.Monthly:
                nextDueDate.setMonth(originalDueDate.getMonth() + 1);
                break;
            case PaymentFrequency.Weekly:
                nextDueDate.setDate(originalDueDate.getDate() + 7);
                break;
            default:
                nextDueDate.setFullYear(originalDueDate.getFullYear() + 1);
                break;
        }
        
        const leaseEndDate = new Date(tenant.leaseEndDate + 'T00:00:00');

        if (nextDueDate <= leaseEndDate) {
            const nextPayment: Payment = {
                id: `p${Date.now()}-${paymentToUpdate.tenantId}`,
                tenantId: paymentToUpdate.tenantId,
                amount: paymentToUpdate.amount,
                dueDate: nextDueDate.toISOString().split('T')[0],
                status: PaymentStatus.Unpaid
            };
            return [...updatedPayments, nextPayment];
        } else {
            return updatedPayments;
        }
    });
  };

  const addAnnouncement = (announcementData: Omit<Announcement, 'id'|'date'|'propertyId'>) => {
     if(!currentProperty) return;
    const newAnnouncement = { 
      ...announcementData, 
      id: `a${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      propertyId: currentProperty.id
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
  };

  const propertyTenants = useMemo(() => {
    if (!currentProperty) return [];
    return tenants.filter(t => t.propertyId === currentProperty.id);
  }, [tenants, currentProperty]);

  const propertyTenantIds = useMemo(() => {
    return new Set(propertyTenants.map(t => t.id));
  }, [propertyTenants]);

  const propertyPayments = useMemo(() => {
    if (!currentProperty) return [];
    return payments.filter(p => propertyTenantIds.has(p.tenantId));
  }, [payments, propertyTenantIds, currentProperty]);

  const propertyRequests = useMemo(() => {
    if (!currentProperty) return [];
    return requests.filter(r => propertyTenantIds.has(r.tenantId));
  }, [requests, propertyTenantIds, currentProperty]);

  const propertyAnnouncements = useMemo(() => {
     if (!currentProperty) return [];
    return announcements.filter(a => a.propertyId === currentProperty.id);
  }, [announcements, currentProperty]);


  return (
    <AppContext.Provider value={{
      allTenants: tenants,
      tenants: propertyTenants, 
      payments: propertyPayments, 
      requests: propertyRequests, 
      announcements: propertyAnnouncements, 
      properties,
      currentProperty,
      addProperty,
      setCurrentProperty,
      addTenant, 
      addRequest, 
      updateRequestStatus, 
      addAnnouncement, 
      markPaymentAsPaid, 
      updateTenant,
      // FIX: Provide currentTenant and setCurrentTenant to the context
      currentTenant,
      setCurrentTenant,
    }}>
      {children}
    </AppContext.Provider>
  );
};
