import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/user/Dashboard';
import Deposit from './pages/user/Deposit';
import Withdrawal from './pages/user/Withdrawal';
import Transfer from './pages/user/Transfer';
import Transactions from './pages/user/Transactions';
import KYC from './pages/user/KYC';
import ATMCard from './pages/user/ATMCard';
import UserSettings from './pages/user/UserSettings';
import Support from './pages/user/Support';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminDeposits from './pages/admin/Deposits';
import AdminWithdrawals from './pages/admin/Withdrawals';
import AdminTransfers from './pages/admin/Transfers';
import AdminKYC from './pages/admin/KYC';
import AdminSettings from './pages/admin/Settings';
import ATMApplications from './pages/admin/ATMApplications';
import SupportManagement from './pages/admin/SupportManagement';
import AccountPool from './pages/admin/AccountPool';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="p-8 text-center text-[#2563EB]">Loading Session...</div>;
    if (!user) return <Navigate to="/login" />;
    if (requireAdmin && !user.is_admin) return <Navigate to="/dashboard" />;
    return <AppLayout>{children}</AppLayout>;
};

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* User Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
            <Route path="/withdrawal" element={<ProtectedRoute><Withdrawal /></ProtectedRoute>} />
            <Route path="/transfer" element={<ProtectedRoute><Transfer /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/kyc" element={<ProtectedRoute><KYC /></ProtectedRoute>} />
            <Route path="/atm" element={<ProtectedRoute><ATMCard /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/deposits" element={<ProtectedRoute requireAdmin><AdminDeposits /></ProtectedRoute>} />
            <Route path="/admin/withdrawals" element={<ProtectedRoute requireAdmin><AdminWithdrawals /></ProtectedRoute>} />
            <Route path="/admin/transfers" element={<ProtectedRoute requireAdmin><AdminTransfers /></ProtectedRoute>} />
            <Route path="/admin/kyc" element={<ProtectedRoute requireAdmin><AdminKYC /></ProtectedRoute>} />
            <Route path="/admin/atm" element={<ProtectedRoute requireAdmin><ATMApplications /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminSettings /></ProtectedRoute>} />
            <Route path="/admin/support" element={<ProtectedRoute requireAdmin><SupportManagement /></ProtectedRoute>} />
            <Route path="/admin/accounts" element={<ProtectedRoute requireAdmin><AccountPool /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
    );
}

export default App;
