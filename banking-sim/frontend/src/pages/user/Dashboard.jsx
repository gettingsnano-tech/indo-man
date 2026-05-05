import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Card, Button, Spinner, Badge } from '../../components/ui';
import { Wallet, Landmark, TrendingUp, ArrowRight, User as UserIcon, Building2, Copy, Check, History } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [account, setAccount] = useState(null);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [requestingAccount, setRequestingAccount] = useState(false);
    const [copied, setCopied] = useState(false);

    const fetchData = async () => {
        try {
            const [profileRes, accountRes, settingsRes] = await Promise.all([
                api.get('/user/profile'),
                api.get('/accounts/my-account'),
                api.get('/admin/settings')
            ]);
            setData(profileRes.data);
            setAccount(accountRes.data);
            setSettings(settingsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleGetAccount = async () => {
        setRequestingAccount(true);
        try {
            const res = await api.post('/accounts/request');
            setAccount(res.data);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to request account');
        } finally {
            setRequestingAccount(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const { user: authUser } = useAuth();
    if (authUser?.is_admin) return <Navigate to="/admin/dashboard" />;
    if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;

    const currency = settings?.default_currency || 'USD';
    const balance = parseFloat(data?.wallet?.balance || 0);
    const savings = parseFloat(data?.wallet?.savings_balance || 0);
    const total = balance + savings;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Top Overview Bar */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-stretch">
                {/* User Profile Info */}
                <Card className="flex-1 p-6 flex flex-col md:flex-row items-center gap-6 bg-gradient-to-br from-[#111118] to-[#0A0A0F] border-[#1E1E2A]">
                    <div className="w-20 h-20 rounded-2xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center text-[#2563EB] shadow-xl">
                        <UserIcon size={40} />
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h2 className="text-2xl font-bold text-white">Welcome back, {data?.name?.split(' ')[0] || 'User'}!</h2>
                        <p className="text-gray-500 text-sm mt-1">{data?.email}</p>
                        <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                            <Badge variant="success">Account Active</Badge>
                            <Badge variant="secondary">Verified Member</Badge>
                        </div>
                    </div>
                </Card>

                {/* Bank Account Details */}
                <Card className="w-full md:w-[400px] p-6 bg-[#111118] border-[#1E1E2A] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563EB]/5 blur-3xl -mr-16 -mt-16 group-hover:bg-[#2563EB]/10 transition-all"></div>
                    
                    <div className="relative z-10">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Official Bank Details</h3>
                        
                        {account ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Bank Name</p>
                                    <p className="text-sm font-semibold text-white flex items-center gap-2">
                                        <Building2 size={14} className="text-[#2563EB]" />
                                        {account.bank_name}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Account Number</p>
                                        <button 
                                            onClick={() => copyToClipboard(account.account_number)}
                                            className="text-sm font-mono text-[#2563EB] hover:text-[#60A5FA] transition-colors flex items-center gap-2"
                                        >
                                            {account.account_number}
                                            {copied ? <Check size={12} /> : <Copy size={12} />}
                                        </button>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Routing Number</p>
                                        <p className="text-sm font-mono text-white">{account.routing_number}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-4 text-center">
                                <p className="text-xs text-gray-500 mb-4">You haven't requested an official bank account number yet.</p>
                                <Button 
                                    className="w-full" 
                                    size="sm" 
                                    onClick={handleGetAccount}
                                    disabled={requestingAccount}
                                >
                                    {requestingAccount ? 'Requesting...' : 'Get Account Number'}
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Balances Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Current Balance', value: balance, icon: Wallet, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Available Funds', value: balance, icon: Landmark, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Savings Account', value: savings, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { label: 'Total Assets', value: total, icon: Building2, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                ].map((stat, i) => (
                    <Card key={i} className="p-6 hover:border-[#2563EB]/30 transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={clsx("p-3 rounded-xl", stat.bg)}>
                                <stat.icon className={stat.color} size={24} />
                            </div>
                            <Badge variant="outline" className="text-[10px] opacity-50">REAL-TIME</Badge>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-white mt-1 group-hover:text-[#2563EB] transition-colors">
                            {currency} {stat.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </h3>
                    </Card>
                ))}
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">Recent Transactions</h3>
                        <Link to="/transactions" className="text-sm text-[#2563EB] hover:underline flex items-center gap-1">
                            View all <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {data?.recent_transactions?.length > 0 ? (
                            data.recent_transactions.map((tx, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[#0A0A0F] border border-[#1E1E2A] hover:border-gray-700 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={clsx(
                                            "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold",
                                            tx.type?.includes('deposit') ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                        )}>
                                            {tx.type?.charAt(0).toUpperCase() || 'T'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{tx.description}</p>
                                            <p className="text-[10px] text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <p className={clsx(
                                        "text-sm font-bold",
                                        tx.type.includes('deposit') ? "text-emerald-500" : "text-red-500"
                                    )}>
                                        {tx.type.includes('deposit') ? '+' : '-'}{currency} {tx.amount.toLocaleString()}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center text-gray-500">
                                <History size={40} className="mx-auto mb-4 opacity-20" />
                                <p>No recent transaction activity.</p>
                            </div>
                        )}
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card className="p-6 bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] border-none text-white overflow-hidden relative">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-2">Secure Transfers</h3>
                            <p className="text-blue-100 text-xs mb-6">Send funds instantly to any account worldwide with our end-to-end encryption.</p>
                            <Link to="/transfer">
                                <Button variant="secondary" className="w-full bg-white text-[#2563EB] hover:bg-blue-50 border-none">
                                    Start Transfer
                                </Button>
                            </Link>
                        </div>
                        <ArrowRight size={100} className="absolute -bottom-4 -right-4 text-white/10" />
                    </Card>

                    <Card className="p-6 border-[#1E1E2A]">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Security Status</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">KYC Verification</span>
                                <Badge variant={data?.kyc_status === 'verified' ? 'success' : 'warning'}>
                                    {data?.kyc_status?.toUpperCase() || 'NOT STARTED'}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">2FA Protection</span>
                                <Badge variant="success">ENABLED</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">Encryption</span>
                                <Badge variant="secondary">AES-256</Badge>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
