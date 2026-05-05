import { useEffect, useState } from 'react';
import clsx from 'clsx';
import api from '../../api/axios';
import { Card, Button, Badge, Spinner } from '../../components/ui';
import { CreditCard, ShieldCheck, Zap, Globe, Copy, Check, Landmark } from 'lucide-react';

export default function ATMCard() {
    const [history, setHistory] = useState([]);
    const [profile, setProfile] = useState(null);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [copied, setCopied] = useState(false);

    const fetchData = async () => {
        try {
            const [atmRes, profileRes, settingsRes] = await Promise.all([
                api.get('/atm/history'),
                api.get('/user/profile'),
                api.get('/admin/settings')
            ]);
            setHistory(atmRes.data);
            setProfile(profileRes.data);
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

    const handleApply = async (cardType) => {
        setApplying(true);
        setError('');
        setSuccess('');
        try {
            await api.post('/atm/apply', { card_type: cardType });
            setSuccess(`Application for ${cardType} card submitted successfully.`);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Application failed');
        } finally {
            setApplying(false);
        }
    };

    const copyToClipboard = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;

    const approved = history.find(h => h.status === 'approved' || h.status === 'shipped' || h.status === 'delivered');
    const hasPending = history.some(h => h.status === 'pending');

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-display font-bold">Debit & ATM Cards</h1>
                    <p className="text-gray-500 mt-1">Manage your virtual and physical spending power.</p>
                </div>
            </div>
            
            {success && <div className="bg-[#22C55E]/10 text-[#22C55E] p-4 rounded-lg text-sm border border-[#22C55E]/20">{success}</div>}
            {error && <div className="bg-[#EF4444]/10 text-[#EF4444] p-4 rounded-lg text-sm border border-[#EF4444]/20">{error}</div>}

            {/* Premium Card Display */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-1 w-full space-y-6">
                    {approved ? (
                        <div className="perspective-1000 group">
                            <div className={clsx(
                                "relative w-full max-w-[500px] aspect-[1.586/1] rounded-[24px] p-8 flex flex-col justify-between text-white shadow-2xl transition-all duration-500 transform group-hover:rotate-y-6 group-hover:scale-[1.02]",
                                approved.card_type === 'Black' ? 'bg-gradient-to-br from-[#1A1A1A] via-[#0D0D0D] to-[#262626] border border-white/10' :
                                approved.card_type === 'Premium' ? 'bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] border border-white/10' :
                                'bg-gradient-to-br from-[#4B5563] to-[#1F2937] border border-white/10'
                            )}>
                                {/* Glassmorphism overlays */}
                                <div className="absolute inset-0 bg-white/5 opacity-20 pointer-events-none"></div>
                                <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 blur-[80px] rounded-full pointer-events-none"></div>
                                
                                <div className="relative z-10 flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                                <Landmark size={16} className="text-white" />
                                            </div>
                                            <p className="text-sm font-bold tracking-[0.2em] uppercase">{settings?.bank_name || 'TITAN BANK'}</p>
                                        </div>
                                        <p className="text-[10px] opacity-60 font-bold tracking-widest mt-2">{approved.card_type.toUpperCase()} WORLD DEBIT</p>
                                    </div>
                                    <div className="w-14 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg border border-yellow-300/30">
                                        <div className="w-full h-full flex flex-col justify-around py-1 px-2 opacity-40">
                                            <div className="h-[1px] bg-black"></div>
                                            <div className="h-[1px] bg-black"></div>
                                            <div className="h-[1px] bg-black"></div>
                                            <div className="h-[1px] bg-black"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <p className="text-2xl md:text-3xl font-mono tracking-[0.15em] drop-shadow-lg">
                                            {approved.card_number || '**** **** **** ****'}
                                        </p>
                                        {approved.card_number && (
                                            <button onClick={() => copyToClipboard(approved.card_number)} className="hover:text-blue-300 transition-colors">
                                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex gap-12">
                                        <div>
                                            <p className="text-[9px] opacity-50 uppercase font-bold tracking-tighter">Valid Thru</p>
                                            <p className="text-lg font-mono">{approved.expiry_date || '12/29'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] opacity-50 uppercase font-bold tracking-tighter">CVV</p>
                                            <p className="text-lg font-mono">{approved.cvv || '***'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 flex justify-between items-end">
                                    <p className="text-xl font-display font-medium uppercase tracking-wider drop-shadow-md">
                                        {profile?.name || 'VALUED CUSTOMER'}
                                    </p>
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-red-600/90 mix-blend-screen shadow-lg"></div>
                                        <div className="w-10 h-10 rounded-full bg-yellow-500/90 -ml-4 mix-blend-screen shadow-lg"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-gray-800 bg-transparent">
                            <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center mb-6">
                                <CreditCard size={40} className="text-gray-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No Active Card</h3>
                            <p className="text-gray-500 max-w-sm mb-8">Unlock global spending power by applying for your virtual or physical {settings?.bank_name || 'TITAN'} Bank card below.</p>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-[#111118] border border-[#1E1E2A] flex items-center gap-3">
                            <ShieldCheck size={20} className="text-emerald-500" />
                            <span className="text-xs font-medium">Secured by 256-bit AES</span>
                        </div>
                        <div className="p-4 rounded-xl bg-[#111118] border border-[#1E1E2A] flex items-center gap-3">
                            <Zap size={20} className="text-blue-500" />
                            <span className="text-xs font-medium">Instant Activation</span>
                        </div>
                        <div className="p-4 rounded-xl bg-[#111118] border border-[#1E1E2A] flex items-center gap-3">
                            <Globe size={20} className="text-purple-500" />
                            <span className="text-xs font-medium">Worldwide Access</span>
                        </div>
                    </div>
                </div>

                <Card className="w-full lg:w-[350px] p-6 h-fit bg-[#111118] border-[#1E1E2A]">
                    <h3 className="text-lg font-bold mb-6">Card Tier Selection</h3>
                    <div className="space-y-4">
                        {[
                            { type: 'Standard', color: 'bg-gray-600', text: 'Daily limit: $1,000', fee: 'Free' },
                            { type: 'Premium', color: 'bg-blue-600', text: 'Daily limit: $5,000', fee: '$9.99/mo' },
                            { type: 'Black', color: 'bg-black border border-gray-800', text: 'Unlimited limit', fee: '$49.99/mo' }
                        ].map((card) => (
                            <div key={card.type} className="p-4 rounded-xl bg-[#0A0A0F] border border-[#1E1E2A] hover:border-[#2563EB]/50 transition cursor-pointer group">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold">{card.type} Card</h4>
                                    <Badge variant="secondary">{card.fee}</Badge>
                                </div>
                                <p className="text-[10px] text-gray-500 mb-4">{card.text}</p>
                                <Button 
                                    size="sm"
                                    className="w-full" 
                                    disabled={hasPending || approved || applying} 
                                    onClick={() => handleApply(card.type)}
                                >
                                    {hasPending ? 'Reviewing...' : approved ? 'Active' : 'Apply Now'}
                                </Button>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <Card className="p-0 overflow-hidden">
                <div className="p-6 border-b border-[#1E1E2A] flex justify-between items-center">
                    <h3 className="text-lg font-bold">Transaction & Application Log</h3>
                    <Badge variant="outline">HISTORY</Badge>
                </div>
                <div className="divide-y divide-[#1E1E2A]">
                    {history.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 italic">No historical records found.</div>
                    ) : (
                        history.map(item => (
                            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-[#111118] transition">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#1E1E2A] flex items-center justify-center">
                                        <CreditCard size={18} className="text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{item.card_type} Card Issue</p>
                                        <p className="text-[10px] text-gray-500">REF: {item.id?.slice(0,8).toUpperCase() || 'REF'}</p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <Badge variant={
                                        item.status === 'delivered' || item.status === 'approved' ? 'success' : 
                                        item.status === 'rejected' ? 'danger' : 'warning'
                                    }>
                                        {item.status.toUpperCase()}
                                    </Badge>
                                    <p className="text-[10px] text-gray-600">{new Date(item.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
}


