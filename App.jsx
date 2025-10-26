import React, { useState, useContext } from 'react';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Profile from './components/Profile.jsx';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import SimpleDashboard from './components/SimpleDashboard.jsx';
import { SimpleAppProvider } from './context/SimpleAppContext.jsx';

// Property Form Modal Component
const PropertyModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
      {page === 'reset-password' && <ForgotPassword onSwitchToLogin={() => setPage('login')} />}

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && address) {
      // Convert file to base64 for storage (in a real app, you'd upload to a file server)
      onSave({ 
        name, 
        address, 
        imageUrl: imagePreview || '/default-property.jpg' 
      });
      setName('');
      setAddress('');
      setSelectedFile(null);
      setImagePreview('');
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    setAddress('');
    setSelectedFile(null);
    setImagePreview('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add New Property</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-light"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter property name"
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter property address"
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Image
              </label>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or JPEG</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                {/* File name display */}
                {selectedFile && (
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-600 mr-2">📎</span>
                    <span className="text-blue-700 font-medium">{selectedFile.name}</span>
                  </div>
                )}

                {/* Image preview */}
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <img 
                      src={imagePreview} 
                      alt="Property preview" 
                      className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Property
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main Manager Home Component
const ManagerHomeComponent = () => {
  const { properties, addProperty, loading, error } = useContext(SimpleAppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddProperty = async (propertyData) => {
    try {
      console.log('Adding property with data:', propertyData);
      
      // Transform the data to match our Property type
      const formattedProperty = {
        name: propertyData.name,
        address: propertyData.address,
        imageUrl: propertyData.imageUrl,
      };
      
      await addProperty(formattedProperty);
      console.log('Property added successfully');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to add property:', error);
      alert('Failed to add property. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4 animate-fade-in">
            🏢 Zenith Property Management
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            Professional tenant management made simple and powerful
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Add Property
            </button>
            {properties.length > 0 && (
              <button 
                onClick={() => window.open('/dashboard', '_blank')}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Property Dashboard
              </button>
            )}
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300">
              View Demo
            </button>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Your Properties ({properties.length})
          </h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading properties...</p>
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div key={property.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <img 
                    src={property.imageUrl || '/default-property.jpg'} 
                    alt={property.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{property.name}</h3>
                    <p className="text-gray-600 mb-4">{property.address}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-blue-600">Active Property</span>
                      <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                        Listed
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🏢</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Ready to Get Started
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Add your first property to begin managing tenants, payments, and maintenance requests.
              </p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Add Property
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Property Modal */}
      <PropertyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddProperty}
      />
    </div>
  );
};


function App() {

  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token && user ? { token, user: JSON.parse(user) } : null;
  });
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setAuth({ token: data.token, user: data.user });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth(null);
  };

  if (!auth) {
    // Password reset routes for unauthenticated users
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (window.location.pathname === '/reset-password') {
      if (token) {
        return <ResetPassword token={token} onSwitchToLogin={() => setShowRegister(false)} />;
      } else {
        return <ForgotPassword onSwitchToLogin={() => setShowRegister(false)} />;
      }
    }
    if (showRegister) {
      return <Register onRegister={() => setShowRegister(false)} onSwitchToLogin={() => setShowRegister(false)} />;
    }
    return <Login onLogin={handleLogin} onSwitchToRegister={() => setShowRegister(true)} />;
  }

  return (
    <SimpleAppProvider>
      <HashRouter>
        <Header auth={auth} onLogout={handleLogout} />
        <div style={{minHeight: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column'}}>
          <div style={{flex: 1}}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<SimpleDashboard />} />
              <Route path="/home" element={<ManagerHomeComponent />} />
            </Routes>
          </div>
          <footer className="w-full text-center text-xs text-gray-400 py-4 bg-white border-t">NOYB FUNDAMENTALS 2025 ©</footer>
        </div>
      </HashRouter>
    </SimpleAppProvider>
  );

}

function Header({ auth, onLogout }) {
  return (
    <div className="w-full bg-gradient-to-r from-blue-700 to-purple-700 shadow-lg mb-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <img src="/zenith-logo-png_seeklogo-479185.png" alt="Logo" className="w-8 h-8 rounded-full bg-white" />
          <span className="text-white text-xl font-bold tracking-wide">Zenith Property Management</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white text-sm font-medium">{auth.user.username} <span className="bg-white/20 text-xs px-2 py-1 rounded ml-2">{auth.user.role}</span></span>
          <button
            onClick={onLogout}
            className="bg-white text-blue-700 font-semibold px-4 py-1 rounded-lg shadow hover:bg-blue-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;