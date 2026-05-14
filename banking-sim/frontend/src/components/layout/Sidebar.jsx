import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, Send, History, ShieldCheck, Users, Settings, LogOut, CreditCard, MessageSquare, Landmark } from 'lucide-react';
import clsx from 'clsx';
import api from '../../api/axios';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        api.get('/admin/settings').then(res => setSettings(res.data)).catch(() => {});
    }, []);
    
    const userLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Deposit', path: '/deposit', icon: ArrowDownToLine },
        { name: 'Transfer to other Banks', path: '/withdrawal', icon: ArrowUpFromLine },
        { name: 'Transfer', path: '/transfer', icon: Send },
        { name: 'Transactions', path: '/transactions', icon: History },
        { name: 'KYC Verification', path: '/kyc', icon: ShieldCheck },
        { name: 'ATM Card', path: '/atm', icon: CreditCard },
        { name: 'Customer care', path: '/support', icon: MessageSquare },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];
    
    const adminLinks = [
        { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Deposits', path: '/admin/deposits', icon: ArrowDownToLine },
        { name: 'Transfer to other Banks', path: '/admin/withdrawals', icon: ArrowUpFromLine },
        { name: 'KYC Reviews', path: '/admin/kyc', icon: ShieldCheck },
        { name: 'ATM Applications', path: '/admin/atm', icon: CreditCard },
        { name: 'Account Pool', path: '/admin/accounts', icon: Landmark },
        { name: 'Customer care', path: '/admin/support', icon: MessageSquare },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
    ];
    
    const links = user?.is_admin ? adminLinks : userLinks;

    return (
        <aside className={clsx(
            "fixed inset-y-0 left-0 w-72 bg-[#0D0D14] border-r border-[#1E1E2A]/50 flex flex-col z-50 transition-all duration-300 lg:static lg:translate-x-0 shadow-2xl",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            {/* Logo Area */}
            <div className="h-24 flex items-center px-8 border-b border-[#1E1E2A]/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <ShieldCheck className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-display font-bold text-white tracking-tight leading-none">
                            {(settings?.bank_name || (user?.is_admin ? 'VAULT' : 'SECURE')).split(' ')[0]}
                        </h1>
                        <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase mt-1">
                            {(settings?.bank_name || '').split(' ').slice(1).join(' ') || (user?.is_admin ? 'Admin Portal' : 'Banking Core')}
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Navigation Section */}
            <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
                <div className="px-4 mb-4">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Main Menu</p>
                </div>
                {links.map((link) => {
                    const Icon = link.icon;
                    return (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            onClick={onClose}
                            className={({ isActive }) => clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 group relative overflow-hidden",
                                isActive 
                                    ? "bg-[#2563EB]/10 text-[#2563EB] shadow-[inset_0_0_20px_rgba(37,99,235,0.05)]" 
                                    : "text-gray-400 hover:text-gray-100 hover:bg-[#15151E]"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#2563EB] rounded-r-full shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                                    )}
                                    <Icon size={20} className={clsx(
                                        "transition-transform duration-300 group-hover:scale-110",
                                        isActive ? "text-[#2563EB]" : "group-hover:text-[#2563EB]"
                                    )} />
                                    <span className="text-sm tracking-wide">{link.name}</span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* User Profile Footer */}
            <div className="p-4 border-t border-[#1E1E2A]/30 bg-[#0A0A0F]/50 backdrop-blur-md">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#111118]/50 border border-[#1E1E2A]/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E1E2A] to-[#0A0A0F] border border-[#2563EB]/30 flex items-center justify-center text-[#2563EB] font-bold shadow-inner">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button 
                        onClick={logout}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
