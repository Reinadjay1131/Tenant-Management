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
  // FIX: Add currentTenant state for the tenant portal
  const [currentTenant, setCurrentTenantState] = useState<Tenant | null>(null);

  // Automatically update payment statuses on app load.
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    setPayments(currentPayments => {
        let hasChanges = false;
        
        const updatedPayments = currentPayments.map(payment => {
            const dueDate = new Date(payment.dueDate + 'T00:00:00');
            
            // A payment is considered overdue if its due date has passed and it's not paid.
            const isOverdue = dueDate < today && payment.status !== PaymentStatus.Paid;

            // If the payment is overdue and not already marked as Late, we need to update it.
            if (isOverdue && payment.status !== PaymentStatus.Late) {
                hasChanges = true;
                return { ...payment, status: PaymentStatus.Late };
            }
            
            return payment;
        });

        // Only update the state if any payment status actually changed to avoid unnecessary re-renders.
        return hasChanges ? updatedPayments : currentPayments;
    });
  }, []); // Empty dependency array ensures this runs only once on mount.

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

  // FIX: Add persistence for current tenant selection for the tenant portal.
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

  // FIX: Add setter for current tenant for the tenant portal.
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

    // Create the first yearly payment record based on the lease start date
    const newPayment: Payment = {
        id: `p${Date.now()}`,
        tenantId: newTenant.id,
        amount: newTenant.rentAmount,
        dueDate: newTenant.leaseStartDate, // Due date is the lease start date for yearly rent
        status: PaymentStatus.Unpaid
    };
    setPayments(prev => [...prev, newPayment]);
  };
  
  const updateTenant = (id: string, data: Partial<Omit<Tenant, 'id'>>) => {
    setTenants(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  };

  const addRequest = (requestData: Omit<MaintenanceRequest, 'id'|'submittedDate'|'status'|'apartmentNumber'>) => {
    const tenant = tenants.find(t => t.id === requestData.tenantId);
    if (!tenant) {
        console.error("Failed to add maintenance request: Tenant not found.");
        return;
    }
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
            default: // Default to annual
                nextDueDate.setFullYear(originalDueDate.getFullYear() + 1);
                break;
        }
        
        const leaseEndDate = new Date(tenant.leaseEndDate + 'T00:00:00');

        // Only create the next payment if its due date is before or on the lease end date.
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
             // If the next payment would be after the lease expires, don't create a new one.
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

  // Memoized, filtered data for the manager portal
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