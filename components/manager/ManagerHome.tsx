import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { Property } from '../../types';
import Card from '../shared/Card';
import { BuildingOffice2Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: Omit<Property, 'id'>) => void;
}

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

const PropertyFormModal: React.FC<PropertyFormModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await blobToBase64(file);
            setImageUrl(base64);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, address, imageUrl });
        onClose();
    };

    useEffect(() => {
        if (isOpen) {
            setName('');
            setAddress('');
            setImageUrl('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
                 <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Add New Property</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Property Name</label>
                        <input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-brand-secondary focus:border-brand-secondary"/>
                    </div>
                     <div>
                        <label htmlFor="address" className="block text-sm font-medium text-slate-700">Address</label>
                        <input type="text" name="address" id="address" value={address} onChange={(e) => setAddress(e.target.value)} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-brand-secondary focus:border-brand-secondary"/>
                    </div>
                     <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-700">Property Image</label>
                        <input type="file" name="imageUrl" id="imageUrl" accept="image/*" onChange={handleFileChange} className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-light file:text-brand-primary hover:file:bg-blue-200" />
                    </div>
                     {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 h-32 w-full object-cover rounded-md" />}

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300">Cancel</button>
                        <button type="submit" className="bg-brand-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-secondary">Save Property</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ManagerHome: React.FC = () => {
    const { properties, setCurrentProperty, addProperty, allTenants } = useContext(AppContext);
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
                <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl mb-6 shadow-soft">
                            <BuildingOffice2Icon className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-neutral-900 mb-4">
                            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-500">Zenith</span>
                        </h1>
                        <p className="text-xl text-neutral-600 max-w-2xl mx-auto mb-8">
                            Professional property management made simple. Manage your properties, tenants, and operations from one powerful platform.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold px-8 py-4 rounded-xl hover:from-brand-700 hover:to-brand-600 transform hover:scale-105 transition-all duration-200 shadow-medium hover:shadow-strong"
                        >
                            <BuildingOffice2Icon className="h-5 w-5" />
                            Add Property
                        </button>
                    </div>

                    {/* Properties Grid */}
                    {properties.length > 0 ? (
                        <>
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-neutral-900">Your Properties</h2>
                                    <p className="text-neutral-600 mt-1">{properties.length} {properties.length === 1 ? 'property' : 'properties'} under management</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="inline-flex items-center gap-2 bg-white text-brand-600 font-semibold px-6 py-3 rounded-xl border-2 border-brand-200 hover:bg-brand-50 transition-all duration-200 shadow-soft hover:shadow-medium"
                                >
                                    <BuildingOffice2Icon className="h-5 w-5" />
                                    Add Property
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {properties.map(prop => {
                                    const tenantCount = allTenants.filter(t => t.propertyId === prop.id).length;
                                    return (
                                        <Link 
                                            to="/manager/dashboard" 
                                            key={prop.id} 
                                            onClick={() => setCurrentProperty(prop)}
                                            className="group block"
                                        >
                                            <Card 
                                                variant="elevated" 
                                                padding="sm" 
                                                className="overflow-hidden group-hover:shadow-strong transition-all duration-300 transform group-hover:-translate-y-1"
                                            >
                                                {/* Property Image */}
                                                <div className="h-48 bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-lg mb-6 overflow-hidden relative">
                                                    {prop.imageUrl ? (
                                                        <img 
                                                            src={prop.imageUrl} 
                                                            alt={prop.name} 
                                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center">
                                                            <BuildingOffice2Icon className="h-16 w-16 text-neutral-400" />
                                                        </div>
                                                    )}
                                                    {/* Overlay gradient */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                </div>

                                                {/* Property Info */}
                                                <div className="space-y-3">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-neutral-900 group-hover:text-brand-600 transition-colors duration-200">
                                                            {prop.name}
                                                        </h3>
                                                        <p className="text-sm text-neutral-600 line-clamp-2">{prop.address}</p>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                                                            <span className="text-sm font-medium text-neutral-700">
                                                                {tenantCount} {tenantCount === 1 ? 'Unit' : 'Units'}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-neutral-500 group-hover:text-brand-600 transition-colors duration-200 font-medium">
                                                            View Details →
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        /* Empty State */
                        <div className="text-center py-20">
                            <div className="w-24 h-24 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-3xl flex items-center justify-center mx-auto mb-8">
                                <BuildingOffice2Icon className="h-12 w-12 text-neutral-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-neutral-900 mb-4">No Properties Yet</h3>
                            <p className="text-lg text-neutral-600 max-w-md mx-auto mb-8">
                                Start your property management journey by adding your first property to the system.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="inline-flex items-center gap-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold px-8 py-4 rounded-xl hover:from-brand-700 hover:to-brand-600 transform hover:scale-105 transition-all duration-200 shadow-medium"
                                >
                                    <BuildingOffice2Icon className="h-5 w-5" />
                                    Add Property
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <PropertyFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={addProperty}
            />
        </>
    );
};

export default ManagerHome;