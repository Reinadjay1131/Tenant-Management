import React, { useState, useContext } from 'react';
import { SimpleAppContext } from '../context/SimpleAppContext.jsx';

const SimpleDashboard = () => {
  const { 
    properties, 
    tenants, 
    maintenanceRequests, 
    loading, 
    error, 
    addProperty, 
    addTenant, 
    updateTenant,
    addMaintenanceRequest,
    updateMaintenanceRequest
  } = useContext(SimpleAppContext);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [showEditTenantModal, setShowEditTenantModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedPropertyForTenant, setSelectedPropertyForTenant] = useState(null);
  const [selectedTenantForEdit, setSelectedTenantForEdit] = useState(null);
  const [selectedPropertyForMaintenance, setSelectedPropertyForMaintenance] = useState(null);
  const [expandedProperty, setExpandedProperty] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPropertyForPayment, setSelectedPropertyForPayment] = useState(null);

  // Modal forms state
  const [propertyForm, setPropertyForm] = useState({ name: '', address: '', imageUrl: '', capacity: '' });
  const [tenantForm, setTenantForm] = useState({
    name: '', email: '', phone: '', apartmentNumber: '', apartmentType: '',
    leaseStartDate: '', leaseEndDate: '', rentAmount: '', profilePicture: '', paymentFrequency: 'monthly'
  });
  const [maintenanceForm, setMaintenanceForm] = useState({
    tenantId: '', apartmentNumber: '', category: 'General', priority: 'Medium',
    title: '', description: '', photo: '', estimatedCompletion: '', contractor: ''
  });
  const [tenantImagePreview, setTenantImagePreview] = useState('');
  const [propertyImagePreview, setPropertyImagePreview] = useState('');

  // Get tenants for a specific property
  const getPropertyTenants = (propertyId) => {
    return tenants.filter(tenant => tenant.propertyId === propertyId);
  };

  // Calculate property stats
  const getPropertyStats = (propertyId) => {
    const propertyTenants = getPropertyTenants(propertyId);
    const property = properties.find(p => p.id === propertyId);
    const capacity = property?.capacity || 1; // Avoid division by zero
    const occupancyRate = Math.round((propertyTenants.length / capacity) * 100);
    
    return {
      tenantCount: propertyTenants.length,
      capacity: capacity,
      occupancyRate,
      maintenanceRequests: 0, // Will be populated from backend
      pendingPayments: 0 // Will be populated from backend
    };
  };

  // Check if payment is due within 30 days
  const isPaymentDueSoon = (tenant) => {
    if (!tenant.leaseStartDate || !tenant.rentAmount) return false;
    
    const today = new Date();
    const leaseStart = new Date(tenant.leaseStartDate);
    const frequency = tenant.paymentFrequency || 'monthly';
    
    // Calculate next payment date based on frequency
    const nextPaymentDate = new Date(leaseStart);
    
    // Find the next payment date from lease start
    while (nextPaymentDate <= today) {
      if (frequency === 'weekly') {
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);
      } else if (frequency === 'monthly') {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      } else if (frequency === 'annually') {
        nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
      }
    }
    
    // Check if payment is due within 30 days
    const daysUntilDue = Math.ceil((nextPaymentDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 30;
  };

  // Get days until next payment
  const getDaysUntilPayment = (tenant) => {
    if (!tenant.leaseStartDate) return null;
    
    const today = new Date();
    const leaseStart = new Date(tenant.leaseStartDate);
    const frequency = tenant.paymentFrequency || 'monthly';
    
    const nextPaymentDate = new Date(leaseStart);
    while (nextPaymentDate <= today) {
      if (frequency === 'weekly') {
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);
      } else if (frequency === 'monthly') {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      } else if (frequency === 'annually') {
        nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
      }
    }
    
    return Math.ceil((nextPaymentDate - today) / (1000 * 60 * 60 * 24));
  };

  // Get maintenance requests for a specific property
  const getPropertyMaintenanceRequests = (propertyId) => {
    return maintenanceRequests?.filter(request => request.propertyId === propertyId) || [];
  };

  // Get maintenance stats for property
  const getMaintenanceStats = (propertyId) => {
    const requests = getPropertyMaintenanceRequests(propertyId);
    return {
      total: requests.length,
      open: requests.filter(r => r.status === 'Open').length,
      inProgress: requests.filter(r => r.status === 'In Progress').length,
      completed: requests.filter(r => r.status === 'Completed').length,
      emergency: requests.filter(r => r.priority === 'Emergency').length
    };
  };

  // Handle form submissions
  const handleAddProperty = async (e) => {
    e.preventDefault();
    try {
      await addProperty({
        ...propertyForm,
        capacity: parseInt(propertyForm.capacity) || 0
      });
      setPropertyForm({ name: '', address: '', imageUrl: '', capacity: '' });
      setPropertyImagePreview('');
      setShowAddPropertyModal(false);
    } catch (error) {
      alert('Failed to add property');
    }
  };

  const handleAddTenant = async (e) => {
    e.preventDefault();
    try {
      await addTenant({
        ...tenantForm,
        propertyId: selectedPropertyForTenant.id,
        rentAmount: parseFloat(tenantForm.rentAmount),
        profilePicture: tenantImagePreview
      });
      setTenantForm({
        name: '', email: '', phone: '', apartmentNumber: '', apartmentType: '',
        leaseStartDate: '', leaseEndDate: '', rentAmount: '', profilePicture: '', paymentFrequency: 'monthly'
      });
      setTenantImagePreview('');
      setShowAddTenantModal(false);
      setSelectedPropertyForTenant(null);
    } catch (error) {
      alert('Failed to add tenant');
    }
  };

  const handleEditTenant = async (e) => {
    e.preventDefault();
    try {
      await updateTenant(selectedTenantForEdit.id, {
        ...tenantForm,
        propertyId: selectedTenantForEdit.propertyId,
        rentAmount: parseFloat(tenantForm.rentAmount),
        profilePicture: tenantImagePreview || selectedTenantForEdit.profilePicture
      });
      setTenantForm({
        name: '', email: '', phone: '', apartmentNumber: '', apartmentType: '',
        leaseStartDate: '', leaseEndDate: '', rentAmount: '', profilePicture: '', paymentFrequency: 'monthly'
      });
      setTenantImagePreview('');
      setShowEditTenantModal(false);
      setSelectedTenantForEdit(null);
    } catch (error) {
      alert('Failed to update tenant');
    }
  };

  const openEditTenantModal = (tenant) => {
    setSelectedTenantForEdit(tenant);
    setTenantForm({
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      apartmentNumber: tenant.apartmentNumber,
      apartmentType: tenant.apartmentType || '',
      leaseStartDate: tenant.leaseStartDate,
      leaseEndDate: tenant.leaseEndDate,
      rentAmount: tenant.rentAmount.toString(),
      profilePicture: tenant.profilePicture || '',
      paymentFrequency: tenant.paymentFrequency || 'monthly'
    });
    setTenantImagePreview(tenant.profilePicture || '');
    setShowEditTenantModal(true);
  };

  const openMaintenanceModal = (property) => {
    setSelectedPropertyForMaintenance(property);
    setMaintenanceForm({
      tenantId: '', 
      apartmentNumber: '', 
      category: 'General', 
      priority: 'Medium',
      title: '', 
      description: '', 
      photo: '', 
      estimatedCompletion: '', 
      contractor: ''
    });
    setShowMaintenanceModal(true);
  };

  const handleAddMaintenanceRequest = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting maintenance request:', {
        ...maintenanceForm,
        propertyId: selectedPropertyForMaintenance.id
      });
      await addMaintenanceRequest({
        ...maintenanceForm,
        propertyId: selectedPropertyForMaintenance.id
      });
      console.log('Maintenance request submitted successfully');
      setMaintenanceForm({
        tenantId: '', apartmentNumber: '', category: 'General', priority: 'Medium',
        title: '', description: '', photo: '', estimatedCompletion: '', contractor: ''
      });
      setShowMaintenanceModal(false);
      setSelectedPropertyForMaintenance(null);
    } catch (error) {
      console.error('Failed to add maintenance request:', error);
      alert('Failed to add maintenance request: ' + (error.message || 'Unknown error'));
    }
  };

  const handleTenantImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTenantImagePreview(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePropertyImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPropertyImagePreview(event.target?.result);
        setPropertyForm({...propertyForm, imageUrl: event.target?.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddTenantModal = (property) => {
    setSelectedPropertyForTenant(property);
    setShowAddTenantModal(true);
  };

  const openPaymentModal = (property) => {
    setSelectedPropertyForPayment(property);
    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex items-center space-x-4">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="text-gray-700 font-medium">Loading your properties...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Property Portfolio</h1>
              <p className="text-gray-600 mt-1">Manage all your properties from one dashboard</p>
            </div>
            <button
              onClick={() => setShowAddPropertyModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <span className="text-lg">🏢</span>
              <span>Add Property</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
            <span className="text-red-500 text-xl">⚠️</span>
            <div>
              <h3 className="text-red-800 font-medium">Connection Issue</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {properties.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🏢</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Zenith Property Management</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start building your property portfolio. Add your first property to begin managing tenants, tracking payments, and handling maintenance requests.
            </p>
            <button
              onClick={() => setShowAddPropertyModal(true)}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2 mx-auto"
            >
              <span className="text-lg">🏢</span>
              <span>Add Your First Property</span>
            </button>
          </div>
        ) : (
          // Properties Grid
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {properties.map((property) => {
              const stats = getPropertyStats(property.id);
              const propertyTenants = getPropertyTenants(property.id);
              const isExpanded = expandedProperty === property.id;

              return (
                <div key={property.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  {/* Property Header */}
                  <div className="relative">
                    <img 
                      src={property.imageUrl || '/default-property.jpg'} 
                      alt={property.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold">{property.name}</h3>
                      <p className="text-white/90 text-sm">{property.address}</p>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Active
                      </span>
                    </div>
                  </div>

                  {/* Property Stats */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.tenantCount}/{stats.capacity}</div>
                        <div className="text-blue-600 text-sm font-medium">Units Occupied</div>
                      </div>
                      <div className="bg-green-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.occupancyRate}%</div>
                        <div className="text-green-600 text-sm font-medium">Occupancy Rate</div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-3">
                      <button
                        onClick={() => openAddTenantModal(property)}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <span>👤</span>
                        <span>Add Tenant</span>
                      </button>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => openPaymentModal(property)}
                          className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                        >
                          <span>💰</span>
                          <span>Payment</span>
                        </button>
                        <button 
                          onClick={() => openMaintenanceModal(property)}
                          className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1 relative"
                        >
                          <span>🔧</span>
                          <span>Maintenance</span>
                          {getMaintenanceStats(property.id).open > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow-md animate-pulse" title="Open maintenance requests">
                              {getMaintenanceStats(property.id).open}
                            </span>
                          )}
                        </button>
                      </div>

                      <button
                        onClick={() => setExpandedProperty(isExpanded ? null : property.id)}
                        className="w-full bg-gray-50 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                      >
                        {isExpanded ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <h4 className="font-semibold text-gray-900 mb-3">Current Tenants</h4>
                        {propertyTenants.length === 0 ? (
                          <p className="text-gray-500 text-sm italic">No tenants yet</p>
                        ) : (
                          <div className="space-y-3">
                            {propertyTenants.map((tenant) => {
                              const paymentDueSoon = isPaymentDueSoon(tenant);
                              const daysUntilPayment = getDaysUntilPayment(tenant);
                              
                              return (
                                <div key={tenant.id} className={`rounded-lg p-3 ${
                                  paymentDueSoon ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'
                                }`}>
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                                        {tenant.profilePicture ? (
                                          <img 
                                            src={tenant.profilePicture} 
                                            alt={tenant.name} 
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <span className="text-blue-600 text-lg">👤</span>
                                        )}
                                      </div>
                                      <div>
                                        <div className="font-medium text-gray-900">{tenant.name}</div>
                                        <div className="text-sm text-gray-600">Unit {tenant.apartmentNumber}</div>
                                        {tenant.apartmentType && (
                                          <div className="text-sm text-gray-500">{tenant.apartmentType}</div>
                                        )}
                                        <div className="text-sm text-gray-500">{tenant.email}</div>
                                        <div className="text-sm text-gray-500">📞 {tenant.phone}</div>
                                        {paymentDueSoon && (
                                          <div className="flex items-center gap-2 mt-1">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                                            <span className="text-orange-600 text-xs font-medium">
                                              Payment due in {daysUntilPayment} days
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="flex items-center gap-2 justify-end mb-2">
                                        <button
                                          onClick={() => openEditTenantModal(tenant)}
                                          className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                                        >
                                          Edit
                                        </button>
                                      </div>
                                      <div className="font-semibold text-green-600">
                                        ₦{tenant.rentAmount}/{tenant.paymentFrequency === 'weekly' ? 'wk' : tenant.paymentFrequency === 'monthly' ? 'mo' : 'yr'}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {tenant.leaseStartDate && new Date(tenant.leaseStartDate).toLocaleDateString()}
                                      </div>
                                      {paymentDueSoon && (
                                        <div className="mt-1">
                                          <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">
                                            Due Soon
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      {showAddPropertyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Property</h2>
            <form onSubmit={handleAddProperty} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Name</label>
                <input
                  type="text"
                  value={propertyForm.name}
                  onChange={(e) => setPropertyForm({...propertyForm, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={propertyForm.address}
                  onChange={(e) => setPropertyForm({...propertyForm, address: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Capacity (Apartments)</label>
                <input
                  type="number"
                  value={propertyForm.capacity}
                  onChange={(e) => setPropertyForm({...propertyForm, capacity: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. 80"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Click to upload (optional)</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePropertyImageChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                  />
                  {propertyImagePreview && (
                    <img
                      src={propertyImagePreview}
                      alt="Property preview"
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  )}
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddPropertyModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Tenant Modal */}
      {showAddTenantModal && selectedPropertyForTenant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Tenant</h2>
            <p className="text-gray-600 mb-6">{selectedPropertyForTenant.name}</p>
            <form onSubmit={handleAddTenant} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {tenantImagePreview ? (
                          <img 
                            src={tenantImagePreview} 
                            alt="Preview" 
                            className="w-16 h-16 rounded-full object-cover mb-2"
                          />
                        ) : (
                          <>
                            <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> profile photo
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG or JPEG</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleTenantImageChange}
                      />
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={tenantForm.name}
                  onChange={(e) => setTenantForm({...tenantForm, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={tenantForm.email}
                  onChange={(e) => setTenantForm({...tenantForm, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={tenantForm.phone}
                    onChange={(e) => setTenantForm({...tenantForm, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit #</label>
                  <input
                    type="text"
                    value={tenantForm.apartmentNumber}
                    onChange={(e) => setTenantForm({...tenantForm, apartmentNumber: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Apartment Type Description</label>
                <input
                  type="text"
                  value={tenantForm.apartmentType}
                  onChange={(e) => setTenantForm({...tenantForm, apartmentType: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. 2-bedroom apartment, Studio, Penthouse, etc."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Frequency</label>
                  <select
                    value={tenantForm.paymentFrequency}
                    onChange={(e) => setTenantForm({...tenantForm, paymentFrequency: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {tenantForm.paymentFrequency === 'weekly' ? 'Weekly' : 
                     tenantForm.paymentFrequency === 'monthly' ? 'Monthly' : 'Annual'} Rent (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                    <input
                      type="number"
                      value={tenantForm.rentAmount}
                      onChange={(e) => setTenantForm({...tenantForm, rentAmount: e.target.value})}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lease Start</label>
                  <input
                    type="date"
                    value={tenantForm.leaseStartDate}
                    onChange={(e) => setTenantForm({...tenantForm, leaseStartDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lease End</label>
                  <input
                    type="date"
                    value={tenantForm.leaseEndDate}
                    onChange={(e) => setTenantForm({...tenantForm, leaseEndDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddTenantModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tenant Modal */}
      {showEditTenantModal && selectedTenantForEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Tenant</h2>
            <form onSubmit={handleEditTenant} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={tenantForm.name}
                    onChange={(e) => setTenantForm({...tenantForm, name: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={tenantForm.email}
                    onChange={(e) => setTenantForm({...tenantForm, email: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={tenantForm.phone}
                    onChange={(e) => setTenantForm({...tenantForm, phone: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit Number</label>
                  <input
                    type="text"
                    value={tenantForm.apartmentNumber}
                    onChange={(e) => setTenantForm({...tenantForm, apartmentNumber: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Apartment Type</label>
                <input
                  type="text"
                  value={tenantForm.apartmentType}
                  onChange={(e) => setTenantForm({...tenantForm, apartmentType: e.target.value})}
                  placeholder="e.g., 2-bedroom, Studio, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lease Start</label>
                  <input
                    type="date"
                    value={tenantForm.leaseStartDate}
                    onChange={(e) => setTenantForm({...tenantForm, leaseStartDate: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lease End</label>
                  <input
                    type="date"
                    value={tenantForm.leaseEndDate}
                    onChange={(e) => setTenantForm({...tenantForm, leaseEndDate: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rent Amount (₦)</label>
                  <input
                    type="number"
                    value={tenantForm.rentAmount}
                    onChange={(e) => setTenantForm({...tenantForm, rentAmount: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Frequency</label>
                  <select
                    value={tenantForm.paymentFrequency}
                    onChange={(e) => setTenantForm({...tenantForm, paymentFrequency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {tenantImagePreview ? (
                      <img 
                        src={tenantImagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-2xl">👤</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleTenantImageChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditTenantModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && selectedPropertyForMaintenance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔧</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Maintenance Management</h2>
                  <p className="text-gray-600">{selectedPropertyForMaintenance.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowMaintenanceModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {(() => {
              const maintenanceStats = getMaintenanceStats(selectedPropertyForMaintenance.id);
              const propertyRequests = getPropertyMaintenanceRequests(selectedPropertyForMaintenance.id);
              
              return (
                <>
                  {/* Overview Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-blue-50 rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-blue-600">{maintenanceStats.total}</div>
                      <div className="text-blue-600 font-medium">Total Requests</div>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-orange-600">{maintenanceStats.open}</div>
                      <div className="text-orange-600 font-medium">Open</div>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-yellow-600">{maintenanceStats.inProgress}</div>
                      <div className="text-yellow-600 font-medium">In Progress</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-green-600">{maintenanceStats.completed}</div>
                      <div className="text-green-600 font-medium">Completed</div>
                    </div>
                  </div>

                  {/* Emergency Alerts */}
                  {maintenanceStats.emergency > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-red-800 mb-4 flex items-center gap-3">
                        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                        Emergency Maintenance Required
                      </h3>
                      <div className="space-y-3">
                        {propertyRequests.filter(req => req.priority === 'Emergency').map(request => (
                          <div key={request.id} className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold text-red-900">{request.title}</div>
                                <div className="text-red-700">Unit {request.apartmentNumber} • {request.category}</div>
                                <div className="text-red-600 text-sm mt-1">{request.description}</div>
                              </div>
                              <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                                EMERGENCY
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Request Form */}
                  <div className="mb-8 bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Maintenance Request</h3>
                    <form onSubmit={handleAddMaintenanceRequest} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Unit Number</label>
                          <input
                            type="text"
                            value={maintenanceForm.apartmentNumber}
                            onChange={(e) => setMaintenanceForm({...maintenanceForm, apartmentNumber: e.target.value})}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., 101"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                          <select
                            value={maintenanceForm.category}
                            onChange={(e) => setMaintenanceForm({...maintenanceForm, category: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Plumbing">Plumbing</option>
                            <option value="Electrical">Electrical</option>
                            <option value="HVAC">HVAC</option>
                            <option value="Structural">Structural</option>
                            <option value="Appliances">Appliances</option>
                            <option value="General">General</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                          <select
                            value={maintenanceForm.priority}
                            onChange={(e) => setMaintenanceForm({...maintenanceForm, priority: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Emergency">Emergency</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          value={maintenanceForm.title}
                          onChange={(e) => setMaintenanceForm({...maintenanceForm, title: e.target.value})}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Brief description of the issue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={maintenanceForm.description}
                          onChange={(e) => setMaintenanceForm({...maintenanceForm, description: e.target.value})}
                          required
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Detailed description of the maintenance issue"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Completion</label>
                          <input
                            type="date"
                            value={maintenanceForm.estimatedCompletion}
                            onChange={(e) => setMaintenanceForm({...maintenanceForm, estimatedCompletion: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Contractor</label>
                          <input
                            type="text"
                            value={maintenanceForm.contractor}
                            onChange={(e) => setMaintenanceForm({...maintenanceForm, contractor: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Assigned contractor/worker"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                          Add Request
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Maintenance Requests List */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">All Maintenance Requests</h3>
                    {propertyRequests.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <span className="text-4xl mb-4 block">🔧</span>
                        <p>No maintenance requests yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {propertyRequests.map(request => (
                          <div key={request.id} className={`rounded-xl p-4 border hover:shadow-md transition-shadow ${
                            request.priority === 'Emergency' ? 'bg-red-50 border-red-200' :
                            request.priority === 'High' ? 'bg-orange-50 border-orange-200' :
                            request.status === 'Completed' ? 'bg-green-50 border-green-200' :
                            'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-semibold text-gray-900">{request.title}</h4>
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    request.priority === 'Emergency' ? 'bg-red-100 text-red-700' :
                                    request.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                    request.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {request.priority}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    request.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                    request.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {request.status}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600 mb-2">
                                  <span className="font-medium">Unit {request.apartmentNumber}</span> • 
                                  <span className="ml-1">{request.category}</span> • 
                                  <span className="ml-1">Submitted {new Date(request.submittedDate).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-700 text-sm mb-2">{request.description}</p>
                                {request.contractor && (
                                  <div className="text-sm text-blue-600">👷 {request.contractor}</div>
                                )}
                                {request.estimatedCompletion && (
                                  <div className="text-sm text-gray-500">📅 Est. completion: {new Date(request.estimatedCompletion).toLocaleDateString()}</div>
                                )}
                              </div>
                              <div className="ml-4">
                                <select
                                  value={request.status}
                                  onChange={async (e) => {
                                    try {
                                      await updateMaintenanceRequest(request.id, { status: e.target.value });
                                    } catch (error) {
                                      alert('Failed to update status');
                                    }
                                  }}
                                  className="text-sm border border-gray-300 rounded px-2 py-1"
                                >
                                  <option value="Open">Open</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Completed">Completed</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPropertyForPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">💰</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>
                  <p className="text-gray-600">{selectedPropertyForPayment.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {(() => {
              const propertyTenants = getPropertyTenants(selectedPropertyForPayment.id);
              return (
                <>
                  {/* Payment Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-green-50 rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-green-600">{propertyTenants.filter(t => !isPaymentDueSoon(t)).length}</div>
                      <div className="text-green-600 font-medium">Up to Date</div>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-orange-600">{propertyTenants.filter(t => isPaymentDueSoon(t)).length}</div>
                      <div className="text-orange-600 font-medium">Due Soon</div>
                    </div>
                  </div>

                  {/* Payment Alerts */}
                  {propertyTenants.filter(t => isPaymentDueSoon(t)).length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-orange-800 mb-4 flex items-center gap-3">
                        <span className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></span>
                        Payment Due Alerts
                      </h3>
                      <div className="space-y-3">
                        {propertyTenants.filter(t => isPaymentDueSoon(t)).map(tenant => (
                          <div key={tenant.id} className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                                  {tenant.profilePicture ? (
                                    <img src={tenant.profilePicture} alt={tenant.name} className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                    <span className="text-orange-600 text-lg">👤</span>
                                  )}
                                </div>
                                <div>
                                  <div className="font-semibold text-orange-900">{tenant.name}</div>
                                  <div className="text-orange-700">Unit {tenant.apartmentNumber} • {tenant.apartmentType}</div>
                                  <div className="text-orange-600 text-sm">📞 {tenant.phone}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-orange-900 text-lg">₦{tenant.rentAmount?.toLocaleString()}</div>
                                <div className="text-orange-700 font-medium">Due in {getDaysUntilPayment(tenant)} days</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Tenant Payments */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">All Tenant Payments</h3>
                    <div className="space-y-3">
                      {propertyTenants.length === 0 ? (
                        <div className="text-center py-12">
                          <span className="text-6xl">🏠</span>
                          <p className="text-gray-500 mt-4">No tenants added yet</p>
                          <p className="text-gray-400 text-sm">Add tenants to see payment information</p>
                        </div>
                      ) : (
                        propertyTenants.map(tenant => (
                          <div key={tenant.id} className="bg-gray-50 rounded-xl p-4 border hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                                  {tenant.profilePicture ? (
                                    <img src={tenant.profilePicture} alt={tenant.name} className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                    <span className="text-blue-600 text-xl">👤</span>
                                  )}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900 text-lg">{tenant.name}</div>
                                  <div className="text-gray-600">Unit {tenant.apartmentNumber}</div>
                                  {tenant.apartmentType && (
                                    <div className="text-gray-500 text-sm">{tenant.apartmentType}</div>
                                  )}
                                  <div className="text-gray-500 text-sm">📞 {tenant.phone}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-gray-900 text-lg">
                                  ₦{tenant.rentAmount?.toLocaleString()}/{tenant.paymentFrequency === 'weekly' ? 'wk' : tenant.paymentFrequency === 'monthly' ? 'mo' : 'yr'}
                                </div>
                                <div className={`font-medium ${
                                  isPaymentDueSoon(tenant) ? 'text-orange-600' : 'text-green-600'
                                }`}>
                                  {isPaymentDueSoon(tenant) 
                                    ? `Due in ${getDaysUntilPayment(tenant)} days`
                                    : 'Up to date'
                                  }
                                </div>
                                {tenant.leaseStartDate && (
                                  <div className="text-gray-500 text-sm">
                                    Since {new Date(tenant.leaseStartDate).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleDashboard;