
import React, { useContext } from 'react';
import { HashRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import ManagerLayout from './components/manager/ManagerLayout';
import ManagerDashboard from './components/manager/ManagerDashboard';
import ManagerTenants from './components/manager/ManagerTenants';
import ManagerPayments from './components/manager/ManagerPayments';
import ManagerMaintenance from './components/manager/ManagerMaintenance';
import ManagerAnnouncements from './components/manager/ManagerAnnouncements';
import { AppContext } from './context/AppContext';
import ManagerHome from './components/manager/ManagerHome';

const ManagerPropertyRoutes: React.FC = () => {
    const { currentProperty } = useContext(AppContext);
    return currentProperty ? <ManagerLayout /> : <Navigate to="/manager" replace />;
};

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/manager" replace />} />
        
        <Route path="/manager" element={<ManagerHome />} />
        <Route element={<ManagerPropertyRoutes />}>
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/tenants" element={<ManagerTenants />} />
            <Route path="/manager/payments" element={<ManagerPayments />} />
            <Route path="/manager/maintenance" element={<ManagerMaintenance />} />
            <Route path="/manager/announcements" element={<ManagerAnnouncements />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;