import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Card, Button, Input, Table, Badge, Spinner } from '../../components/ui';
import { Wallet, Landmark, ArrowRight, History, Info, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import clsx from 'clsx';

export default function Withdrawal() {
    const [wallet, setWallet] = useState(null);
    const [history, setHistory] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [amount, setAmount] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchData = async () => {
        try {
            const [wRes, histRes, profRes] = await Promise.all([
                api.get('/user/wallet'),
                api.get('/transfer-external/external-history'),
                api.get('/user/profile')
            ]);
            setWallet(wRes.data);
            setHistory(histRes.data);
            setProfile(profRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await api.post('/transfer-external/request', { 
                amount, 
                bank_name: bankName, 
                account_number: accountNumber, 
                account_name: accountName 
            });
            setSuccess('Withdrawal request submitted successfully.');
            setAmount('');
            setBankName('');
            setAccountNumber('');
            setAccountName('');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Submission failed');
        }
    };

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;

    const accountStatus = profile?.withdrawal_settings;
    const isRestricted = accountStatus?.status && accountStatus?.status !== 'pending' && accountStatus?.status !== 'approved' && accountStatus?.status !== 'paid';

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Account Level Notice */}
            {isRestricted && (
                <Card className="p-6 bg-red-500/10 border-red-500/30 border-2 border-dashed animate-pulse">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full bg-red-500/20 text-red-500">
                            <AlertCircle size={32} />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white uppercase tracking-tight">Account Restriction: {accountStatus.status.replace('_', ' ').toUpperCase()}</h4>
                            <p className="text-sm text-gray-300 mt-1">{accountStatus.admin_message || "Your withdrawal ability has been restricted by the compliance department."}</p>
                            {accountStatus.admin_instruction && (
                                <div className="mt-4 p-3 bg-black/40 rounded-xl border border-white/5">
                                    <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Required Action:</p>
                                    <p className="text-xs text-white italic">{accountStatus.admin_instruction}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            )}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-display font-bold">Transfer to other Banks</h1>
                    <p className="text-gray-500 mt-1">Transfer funds to any external bank account worldwide via Secure Wire.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Balance & Stats Card */}
                <div className="space-y-6">
                    <Card className="p-8 bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] border-none text-white overflow-hidden relative group">
                        <div className="relative z-10">
                            <h3 className="text-blue-100 text-sm font-medium mb-1">Available for Withdrawal</h3>
                            <div className="text-4xl font-display font-bold mb-6">
                                {parseFloat(wallet?.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })} 
                                <span className="text-xl ml-2 opacity-60">{wallet?.currency}</span>
                            </div>
                            <div className="space-y-3 pt-6 border-t border-white/10">
                                <div className="flex justify-between text-xs">
                                    <span className="text-blue-100">Savings Reserve</span>
                                    <span className="font-bold">{parseFloat(wallet?.savings_balance).toLocaleString()} {wallet?.currency}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-blue-100">Withdrawal Limit</span>
                                    <span className="font-bold">UNLIMITED</span>
                                </div>
                            </div>
                        </div>
                        <Wallet size={120} className="absolute -bottom-4 -right-4 text-white/5 group-hover:scale-110 transition-transform duration-700" />
                    </Card>

                    <Card className="p-6 bg-[#111118] border-[#1E1E2A]">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Security Notice</h4>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 h-fit">
                                    <Info size={16} />
                                </div>
                                <p className="text-[11px] text-gray-400 leading-relaxed">
                                    All international wire transfers are processed within 24-48 business hours. Please ensure beneficiary details are accurate.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 h-fit">
                                    <AlertCircle size={16} />
                                </div>
                                <p className="text-[11px] text-gray-400 leading-relaxed">
                                    Standard processing fees apply to all outbound transactions unless otherwise specified in your account settings.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Request Form */}
                <Card className="lg:col-span-2 p-8 bg-[#111118] border-[#1E1E2A]">
                    <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                        <Landmark size={22} className="text-[#2563EB]" />
                        Request Wire Transfer
                    </h3>
                    
                    {error && <div className="bg-red-500/10 text-red-500 p-4 rounded-xl mb-8 text-sm border border-red-500/20">{error}</div>}
                    {success && <div className="bg-emerald-500/10 text-emerald-500 p-4 rounded-xl mb-8 text-sm border border-emerald-500/20 flex items-center gap-2">
                        <CheckCircle2 size={16} /> {success}
                    </div>}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Amount to Withdraw" type="number" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required disabled={isRestricted} />
                            <Input label="Beneficiary Bank Name" placeholder="e.g. Chase Bank, HSBC" value={bankName} onChange={e => setBankName(e.target.value)} required disabled={isRestricted} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Account Number / IBAN" placeholder="Enter recipient account" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} required disabled={isRestricted} />
                            <Input label="Account Holder Name" placeholder="Exact name on account" value={accountName} onChange={e => setAccountName(e.target.value)} required disabled={isRestricted} />
                        </div>
                        
                        <div className="pt-4">
                            <Button type="submit" className="w-full py-6 text-lg font-bold shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2" disabled={isRestricted}>
                                {isRestricted ? 'Withdrawal Restricted' : 'Initialize Transfer'} <ArrowRight size={20} />
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>

            {/* History Section */}
            <div className="space-y-4 pt-8">
                <h3 className="text-xl font-bold flex items-center gap-2 px-2">
                    <History size={20} className="text-gray-400" />
                    Withdrawal Lifecycle
                </h3>
                
                <Card className="p-0 overflow-hidden bg-[#111118] border-[#1E1E2A]">
                    <Table>
                        <thead className="bg-[#0D0D14] border-b border-[#1E1E2A]">
                            <tr>
                                <th className="px-6 py-4 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-left">Date / ID</th>
                                <th className="px-6 py-4 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-left">Financials</th>
                                <th className="px-6 py-4 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-left">Status</th>
                                <th className="px-6 py-4 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-left">Support & Instructions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1E1E2A]">
                            {history.map(item => (
                                <tr key={item.id} className="hover:bg-[#15151E]/50 transition-colors">
                                    <td className="px-6 py-6">
                                        <div className="text-sm font-bold text-white">{new Date(item.created_at).toLocaleDateString()}</div>
                                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">{item.id.split('-')[0]}</div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="text-sm font-bold text-white">-{parseFloat(item.amount).toLocaleString()} {wallet?.currency}</div>
                                        <div className="text-[10px] text-gray-500 mt-1">Processing Fee: {item.fee} {wallet?.currency}</div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <Badge variant={
                                            item.status === 'paid' ? 'success' : 
                                            item.status === 'approved' ? 'success' : 
                                            ['pending', 'token_required'].includes(item.status) ? 'warning' : 'danger'
                                        } className="px-3 py-1 text-[10px] font-bold">
                                            {item.status.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="space-y-3">
                                            {item.admin_message && (
                                                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 shadow-sm animate-in fade-in slide-in-from-left-2 duration-500">
                                                    <div className="flex items-start gap-2">
                                                        <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                                                        <p className="text-xs text-gray-300 font-medium leading-relaxed">
                                                            {item.admin_message}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            {item.admin_instruction && (
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 w-fit">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Next Step:</span>
                                                    <span className="text-[10px] text-emerald-100 italic">{item.admin_instruction}</span>
                                                </div>
                                            )}
                                            {!item.admin_message && !item.admin_instruction && (
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Clock size={12} className="animate-spin-slow" />
                                                    <span className="text-[10px] italic">Request under review...</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center text-gray-500">
                                        <History size={40} className="mx-auto mb-4 opacity-20" />
                                        <p className="text-sm">No withdrawal history found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card>
            </div>
        </div>
    );
}
