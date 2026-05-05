import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Card, Table, Badge, Button, Spinner, Input } from '../../components/ui';
import { User, ShieldCheck, CreditCard, Lock, Unlock, Settings2, X, AlertTriangle } from 'lucide-react';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Lifecycle Edit State
    const [editingLifecycle, setEditingLifecycle] = useState(null); // stores user object
    const [lifecycleData, setLifecycleData] = useState({
        status: 'pending',
        admin_message: '',
        admin_reason: '',
        admin_instruction: '',
        withdrawal_fee: '0.00'
    });

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleActive = async (id, currentStatus) => {
        await api.patch(`/admin/user/${id}`, { is_active: !currentStatus });
        fetchUsers();
    };

    const openLifecycle = async (user) => {
        setEditingLifecycle(user);
        try {
            const res = await api.get(`/admin/withdrawal-settings/${user.id}`);
            setLifecycleData({
                status: res.data.status || 'pending',
                admin_message: res.data.admin_message || '',
                admin_reason: res.data.admin_reason || '',
                admin_instruction: res.data.admin_instruction || '',
                withdrawal_fee: res.data.withdrawal_fee || '0.00'
            });
        } catch (err) {
            console.error("Failed to fetch lifecycle", err);
        }
    };

    const saveLifecycle = async () => {
        try {
            await api.patch(`/admin/withdrawal-settings/${editingLifecycle.id}`, lifecycleData);
            setEditingLifecycle(null);
            fetchUsers();
        } catch (err) {
            alert('Failed to save lifecycle settings');
        }
    };

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-display font-bold">User Directory</h1>
                <p className="text-gray-500 mt-1">Manage user access, withdrawal lifecycle, and financial parameters.</p>
            </div>
            
            <Card className="p-0 overflow-hidden bg-[#111118] border-[#1E1E2A]">
                <Table>
                    <thead className="bg-[#0D0D14] border-b border-[#1E1E2A]">
                        <tr>
                            <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-left">Identity</th>
                            <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-left">Vault Balance</th>
                            <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-left">KYC Profile</th>
                            <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-left">Settings</th>
                            <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E1E2A]">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-[#15151E]/50 transition-colors group">
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E1E2A] to-[#0A0A0F] border border-[#1E1E2A] flex items-center justify-center text-gray-400 group-hover:border-blue-500/30 transition-colors">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white flex items-center gap-2">
                                                {u.name} 
                                                {u.is_admin && <Badge variant="info" className="text-[8px] h-4">STAFF</Badge>}
                                                {!u.is_active && <Badge variant="danger" className="text-[8px] h-4">DISABLED</Badge>}
                                            </div>
                                            <div className="text-[10px] text-gray-500 font-mono">{u.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="text-sm font-bold text-white">{parseFloat(u.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">AVAILABLE FUNDS</div>
                                </td>
                                <td className="px-6 py-6">
                                    <Badge variant={u.kyc_status === 'verified' ? 'success' : u.kyc_status === 'pending' ? 'warning' : 'default'} className="px-3 py-1 text-[10px] font-bold">
                                        {(u.kyc_status || 'not_started').replace('_', ' ').toUpperCase()}
                                    </Badge>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">Wire:</span>
                                            <Badge variant={u.transfer_status === 'active' ? 'success' : 'danger'} className="text-[8px] px-1.5 py-0">
                                                {u.transfer_status?.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">Fee:</span>
                                            <span className="text-[10px] text-gray-400 font-mono">{u.withdrawal_fee}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6 text-right space-x-2">
                                    <Button 
                                        variant="secondary" 
                                        size="sm"
                                        className="text-xs font-bold"
                                        onClick={() => openLifecycle(u)}
                                    >
                                        <Settings2 size={14} className="mr-2" /> Lifecycle
                                    </Button>
                                    <Button 
                                        variant={u.is_active ? 'danger' : 'success'} 
                                        size="sm"
                                        className="text-xs font-bold"
                                        onClick={() => toggleActive(u.id, u.is_active)}
                                    >
                                        {u.is_active ? <Lock size={14} /> : <Unlock size={14} />}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>

            {/* Lifecycle Modal Overlay */}
            {editingLifecycle && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-2xl bg-[#0D0D14] border-[#1E1E2A] p-8 shadow-2xl relative">
                        <button 
                            onClick={() => setEditingLifecycle(null)}
                            className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500">
                                <ShieldCheck size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Withdrawal Lifecycle Settings</h3>
                                <p className="text-sm text-gray-500">Configuring parameters for <span className="text-white font-medium">{editingLifecycle.name}</span></p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Global Lifecycle Stage</label>
                                    <select 
                                        className="w-full bg-[#0A0A0F] border border-[#1E1E2A] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                                        value={lifecycleData.status}
                                        onChange={e => setLifecycleData({...lifecycleData, status: e.target.value})}
                                    >
                                        <option value="pending">Standard (Pending)</option>
                                        <option value="suspended">Suspended / Frozen</option>
                                        <option value="not_approved">Decline Initial Request</option>
                                        <option value="token_required">Token Requirement Forced</option>
                                        <option value="approved">Auto-Approve Enabled</option>
                                        <option value="paid">Pre-Marked Paid</option>
                                    </select>
                                </div>
                                <Input 
                                    label="Custom Withdrawal Fee" 
                                    type="number" 
                                    value={lifecycleData.withdrawal_fee} 
                                    onChange={e => setLifecycleData({...lifecycleData, withdrawal_fee: e.target.value})} 
                                />
                            </div>

                            <div className="space-y-4">
                                <Input 
                                    label="Display Message (User Visible)" 
                                    value={lifecycleData.admin_message} 
                                    onChange={e => setLifecycleData({...lifecycleData, admin_message: e.target.value})} 
                                    placeholder="This message will show when the user visits the withdrawal page."
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input 
                                        label="Internal Justification" 
                                        value={lifecycleData.admin_reason} 
                                        onChange={e => setLifecycleData({...lifecycleData, admin_reason: e.target.value})} 
                                        placeholder="Reason for this lifecycle state"
                                    />
                                    <Input 
                                        label="Call to Action (Instruction)" 
                                        value={lifecycleData.admin_instruction} 
                                        onChange={e => setLifecycleData({...lifecycleData, admin_instruction: e.target.value})} 
                                        placeholder="What should the user do?"
                                    />
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
                                <AlertTriangle size={20} className="text-amber-500 shrink-0" />
                                <p className="text-[11px] text-gray-400 leading-relaxed">
                                    Setting a status other than <span className="text-white">Standard</span> will block the user's ability to initiate new requests until they fulfill the requirements or the status is reset.
                                </p>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button className="flex-1 py-4 text-sm font-bold" onClick={saveLifecycle}>
                                    Save User lifecycle
                                </Button>
                                <Button variant="ghost" className="px-8" onClick={() => setEditingLifecycle(null)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
