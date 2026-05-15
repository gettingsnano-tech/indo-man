import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Card, Table, Badge, Button, Spinner, Input } from '../../components/ui';
import { Mail, CheckCircle2, AlertCircle, Clock, Info } from 'lucide-react';

export default function Withdrawals() {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Edit state
    const [editId, setEditId] = useState(null);
    const [status, setStatus] = useState('');
    const [adminMessage, setAdminMessage] = useState('');
    const [adminReason, setAdminReason] = useState('');
    const [adminInstruction, setAdminInstruction] = useState('');
    const [isPaid, setIsPaid] = useState(false);

    const fetchWithdrawals = async () => {
        try {
            const res = await api.get('/admin/withdrawals');
            setWithdrawals(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const startEdit = (w) => {
        setEditId(w.id);
        setStatus(w.status);
        setAdminMessage(w.admin_message || '');
        setAdminReason(w.admin_reason || '');
        setAdminInstruction(w.admin_instruction || '');
        setIsPaid(w.is_paid || false);
    };

    const handleSave = async (id) => {
        if (!adminMessage || !adminReason) {
            alert('Admin message and internal reason are mandatory.');
            return;
        }
        try {
            await api.patch(`/admin/withdrawal/${id}`, {
                status, 
                admin_message: adminMessage, 
                admin_reason: adminReason, 
                admin_instruction: adminInstruction,
                is_paid: isPaid || status === 'paid'
            });
            setEditId(null);
            fetchWithdrawals();
        } catch (err) {
            alert(err.response?.data?.error || 'Save failed');
        }
    };

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-display font-bold">External Transfer Desk</h1>
                    <p className="text-gray-500 mt-1">Review and process international wire requests to other banks.</p>
                </div>
            </div>
            
            <Card className="p-0 overflow-hidden bg-[#111118] border-[#1E1E2A]">
                <Table>
                    <thead className="bg-[#0D0D14] border-b border-[#1E1E2A]">
                        <tr>
                            <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-left">Request Details</th>
                            <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-left">Financial Info</th>
                            <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-left">Bank Destination</th>
                            <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-left">Lifecycle Status</th>
                            <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E1E2A]">
                        {withdrawals.map(w => (
                            <tr key={w.id} className="hover:bg-[#15151E]/50 transition-colors">
                                {editId === w.id ? (
                                    <td colSpan="5" className="px-8 py-8 bg-[#0D0D14]">
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between border-b border-[#1E1E2A] pb-4">
                                                <h4 className="font-bold text-lg text-white">Updating Withdrawal: <span className="text-blue-500 font-mono">{w.id.split('-')[0]}</span></h4>
                                                <div className="flex items-center gap-4 text-xs">
                                                    <span className="text-gray-500 flex items-center gap-1"><Mail size={12} /> Auto-email will be sent</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Target Status</label>
                                                    <select 
                                                        className="w-full bg-[#0A0A0F] border border-[#1E1E2A] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500" 
                                                        value={status} 
                                                        onChange={e => setStatus(e.target.value)}
                                                    >
                                                        <option value="pending">Pending Review</option>
                                                        <option value="suspended">Suspended / Frozen</option>
                                                        <option value="not_approved">Rejected / Declined</option>
                                                        <option value="token_required">Identity Token Required</option>
                                                        <option value="approved">Approved for Payout</option>
                                                        <option value="paid">Completed & Paid</option>
                                                    </select>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Input label="Public Message (Visible to User)" value={adminMessage} onChange={e => setAdminMessage(e.target.value)} placeholder="e.g. Your withdrawal has been approved and is being processed." required />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Input label="Internal Reason (Admin Only)" value={adminReason} onChange={e => setAdminReason(e.target.value)} placeholder="e.g. Verified documents match bank details." required />
                                                <Input label="User Instruction (What to do next)" value={adminInstruction} onChange={e => setAdminInstruction(e.target.value)} placeholder="e.g. Please check your bank in 3-5 business days." />
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-[#1E1E2A]">
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isPaid || status === 'paid'} 
                                                        onChange={e => setIsPaid(e.target.checked)}
                                                        className="w-5 h-5 rounded border-[#1E1E2A] bg-[#0A0A0F] text-blue-500 focus:ring-blue-500/20"
                                                    />
                                                    <span className="text-sm font-medium text-gray-300">Mark as Finalized/Paid</span>
                                                </label>
                                                <div className="flex gap-3">
                                                    <Button variant="ghost" onClick={() => setEditId(null)}>Discard Changes</Button>
                                                    <Button variant="success" className="px-10" onClick={() => handleSave(w.id)}>Commit Update</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                ) : (
                                    <>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-800/30 flex items-center justify-center text-gray-500">
                                                    <Clock size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">{new Date(w.created_at).toLocaleDateString()}</div>
                                                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">{w.id.split('-')[0]}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="text-lg font-bold text-[#EF4444] tracking-tight">{w.amount}</div>
                                            <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Fee: {w.fee}</div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="text-sm text-white font-bold">{w.bank_name}</div>
                                            <div className="text-xs text-gray-400 mt-1">{w.account_number}</div>
                                            <div className="text-[10px] text-gray-500 italic mt-0.5">{w.account_name}</div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <Badge variant={
                                                w.status === 'paid' ? 'success' : 
                                                w.status === 'approved' ? 'success' : 
                                                w.status === 'pending' ? 'warning' : 
                                                w.status === 'token_required' ? 'info' : 'danger'
                                            } className="px-3 py-1 text-[10px] font-bold">
                                                {w.status.replace('_', ' ').toUpperCase()}
                                            </Badge>
                                            <div className="mt-3 flex flex-col gap-1.5">
                                                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                                    <Info size={10} className="text-blue-500" />
                                                    <span className="truncate max-w-[150px]">{w.admin_message || 'No message set'}</span>
                                                </div>
                                                {w.is_paid && (
                                                    <div className="text-[10px] text-emerald-500 flex items-center gap-1 font-bold">
                                                        <CheckCircle2 size={10} /> DISBURSED
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <Button variant="secondary" size="sm" className="font-bold text-xs px-4" onClick={() => startEdit(w)}>
                                                Audit & Edit
                                            </Button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                        {withdrawals.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-20 text-center">
                                    <AlertCircle size={48} className="mx-auto mb-4 text-gray-700" />
                                    <h3 className="text-lg font-bold text-gray-500">No withdrawal requests found</h3>
                                    <p className="text-sm text-gray-600">Pending wire transfers will appear here for review.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
}
