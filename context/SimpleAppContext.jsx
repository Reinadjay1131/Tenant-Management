import React, { createContext, useState, useEffect } from 'react';

export const SimpleAppContext = createContext({
  properties: [],
  tenants: [],
  maintenanceRequests: [],
  loading: false,
  error: null,
  addProperty: async () => {},
  addTenant: async () => {},
  updateTenant: async () => {},
  addMaintenanceRequest: async () => {},
  updateMaintenanceRequest: async () => {},
  refreshProperties: async () => {},
  refreshTenants: async () => {},
  refreshMaintenanceRequests: async () => {},
});

// Simple API service
const apiService = {
  async request(endpoint, options = {}) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`http://localhost:5000/api${endpoint}`, {
        ...options,
        headers,
      });
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  async getProperties() {
    return this.request('/properties');
  },

  async createProperty(property) {
    return this.request('/properties', {
      method: 'POST',
      body: JSON.stringify(property),
    });
  },

  async getTenants() {
    return this.request('/tenants');
  },

  async createTenant(tenant) {
    return this.request('/tenants', {
      method: 'POST',
      body: JSON.stringify(tenant),
    });
  },

  async updateTenant(id, tenant) {
    return this.request(`/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tenant),
    });
  },

  async getMaintenanceRequests(propertyId) {
    return this.request(`/maintenance-requests${propertyId ? `?propertyId=${propertyId}` : ''}`);
  },

  async createMaintenanceRequest(request) {
    return this.request('/maintenance-requests', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async updateMaintenanceRequest(id, request) {
    return this.request(`/maintenance-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },
};

export const SimpleAppProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log('SimpleAppProvider: Initializing with backend connection...');

  // Load properties from backend
  const refreshProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading properties from backend...');
      const data = await apiService.getProperties();
      console.log('Properties loaded:', data);
      setProperties(data || []);
    } catch (error) {
      console.error('Failed to load properties:', error);
      setError('Failed to connect to backend. Please ensure the server is running.');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // Load tenants from backend
  const refreshTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading tenants from backend...');
      const data = await apiService.getTenants();
      console.log('Tenants loaded:', data);
      setTenants(data || []);
    } catch (error) {
      console.error('Failed to load tenants:', error);
      setError('Failed to load tenants.');
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  // Add new property
  const addProperty = async (propertyData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Adding property to backend:', propertyData);
      const newProperty = await apiService.createProperty(propertyData);
      console.log('Property added successfully:', newProperty);
      setProperties(prev => [...prev, newProperty]);
    } catch (error) {
      console.error('Failed to add property:', error);
      setError('Failed to save property. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add new tenant
  const addTenant = async (tenantData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Adding tenant to backend:', tenantData);
      const newTenant = await apiService.createTenant(tenantData);
      console.log('Tenant added successfully:', newTenant);
      setTenants(prev => [...prev, newTenant]);
    } catch (error) {
      console.error('Failed to add tenant:', error);
      setError('Failed to save tenant. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update existing tenant
  const updateTenant = async (tenantId, tenantData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Updating tenant in backend:', tenantId, tenantData);
      const updatedTenant = await apiService.updateTenant(tenantId, tenantData);
      console.log('Tenant updated successfully:', updatedTenant);
      setTenants(prev => prev.map(tenant => 
        tenant.id === tenantId ? updatedTenant : tenant
      ));
    } catch (error) {
      console.error('Failed to update tenant:', error);
      setError('Failed to update tenant. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Load maintenance requests from backend
  const refreshMaintenanceRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading maintenance requests from backend...');
      const data = await apiService.getMaintenanceRequests();
      console.log('Maintenance requests loaded:', data);
      setMaintenanceRequests(data || []);
    } catch (error) {
      console.error('Failed to load maintenance requests:', error);
      setError('Failed to load maintenance requests.');
      setMaintenanceRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Add new maintenance request
  const addMaintenanceRequest = async (requestData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Adding maintenance request to backend:', requestData);
      const newRequest = await apiService.createMaintenanceRequest(requestData);
      console.log('Maintenance request added successfully:', newRequest);
      setMaintenanceRequests(prev => [...prev, newRequest]);
    } catch (error) {
      console.error('Failed to add maintenance request:', error);
      setError('Failed to save maintenance request. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update existing maintenance request
  const updateMaintenanceRequest = async (requestId, requestData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Updating maintenance request in backend:', requestId, requestData);
      const updatedRequest = await apiService.updateMaintenanceRequest(requestId, requestData);
      console.log('Maintenance request updated successfully:', updatedRequest);
      setMaintenanceRequests(prev => prev.map(request => 
        request.id === requestId ? updatedRequest : request
      ));
    } catch (error) {
      console.error('Failed to update maintenance request:', error);
      setError('Failed to update maintenance request. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    console.log('SimpleAppProvider: Loading initial data...');
    refreshProperties();
    refreshTenants();
    refreshMaintenanceRequests();
  }, []);

  return (
    <SimpleAppContext.Provider value={{
      properties,
      tenants,
      maintenanceRequests,
      loading,
      error,
      addProperty,
      addTenant,
      updateTenant,
      addMaintenanceRequest,
      updateMaintenanceRequest,
      refreshProperties,
      refreshTenants,
      refreshMaintenanceRequests,
    }}>
      {children}
    </SimpleAppContext.Provider>
  );
};