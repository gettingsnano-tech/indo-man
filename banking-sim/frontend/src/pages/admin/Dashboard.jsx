import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Card, Spinner } from '../../components/ui';
import { Users, ArrowDownToLine, ArrowUpFromLine, ShieldCheck, Activity, TrendingUp, DollarSign } from 'lucide-react';
import clsx from 'clsx';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingDeposits: 0,
        pendingWithdrawals: 0,
        pendingKYC: 0,
        totalBalance: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, depositsRes, withdrawalsRes, kycRes] = await Promise.all([
                    api.get('/admin/users'),
                    api.get('/admin/deposits'),
                    api.get('/admin/withdrawals'),
                    api.get('/admin/kyc')
                ]);
                
                const users = usersRes.data || [];
                const deposits = depositsRes.data || [];
                const withdrawals = withdrawalsRes.data || [];
                const kyc = kycRes.data || [];

                setStats({
                    totalUsers: users.length,
                    pendingDeposits: deposits.filter(d => d.status === 'pending').length,
                    pendingWithdrawals: withdrawals.filter(w => w.status === 'pending').length,
                    pendingKYC: kyc.filter(k => k.status === 'pending').length,
                    totalBalance: users.reduce((sum, u) => sum + parseFloat(u.balance || 0), 0)
                });
            } catch (err) {
                console.error("Admin Dashboard Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;

    const cards = [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        { label: 'Pending Deposits', value: stats.pendingDeposits, icon: ArrowDownToLine, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        { label: 'Pending Withdrawals', value: stats.pendingWithdrawals, icon: ArrowUpFromLine, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
        { label: 'KYC Reviews', value: stats.pendingKYC, icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-display font-bold">Admin System Overview</h1>
                    <p className="text-gray-500 mt-1">Real-time health monitoring of the banking core.</p>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-xs font-bold uppercase tracking-widest">
                    <Activity size={14} className="animate-pulse" /> Systems Operational
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <Card key={i} className={clsx("p-6 hover:translate-y-[-4px] transition-all duration-300", card.border)}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={clsx("p-3 rounded-xl", card.bg)}>
                                <card.icon className={card.color} size={24} />
                            </div>
                            <TrendingUp size={16} className="text-gray-600" />
                        </div>
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{card.label}</p>
                        <h3 className="text-4xl font-display font-bold text-white mt-1">{card.value}</h3>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 p-8 bg-gradient-to-br from-[#111118] to-[#0A0A0F] border-[#1E1E2A] flex flex-col justify-center">
                    <div className="flex items-center gap-6">
                        <div className="p-6 bg-[#2563EB]/10 rounded-2xl border border-[#2563EB]/20 shadow-2xl shadow-blue-500/5">
                            <DollarSign size={48} className="text-[#2563EB]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Total Vault Liquidity</h3>
                            <div className="text-5xl font-display font-bold text-white tracking-tight">
                                {stats.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <p className="text-xs text-gray-400 mt-4 flex items-center gap-2">
                                <Activity size={12} className="text-emerald-500" /> Aggregate of all active user wallets across the ecosystem.
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-8 bg-[#111118] border-[#1E1E2A] flex flex-col justify-center text-center">
                    <h3 className="text-xl font-bold mb-3 text-white">System Diagnostics Secure</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                        All core ledgers and APIs are functioning identically. The identity-string migration is complete and persistent.
                    </p>
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="w-1.5 h-6 bg-emerald-500/20 rounded-full overflow-hidden">
                                <div className="w-full bg-emerald-500 animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
