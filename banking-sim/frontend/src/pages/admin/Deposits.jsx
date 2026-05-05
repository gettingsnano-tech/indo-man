import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Card, Table, Badge, Button, Spinner, Input } from '../../components/ui';

export default function Deposits() {
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [selectedId, setSelectedId] = useState(null);

    const fetchDeposits = async () => {
        try {
            const res = await api.get('/admin/deposits');
            setDeposits(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeposits();
    }, []);

    const handleAction = async (id, action) => {
        if (action === 'reject' && !message) {
            alert('Admin message is required for rejection');
            return;
        }
        
        try {
            await api.post(`/admin/deposit/${id}/${action}`, { admin_message: message });
            setMessage('');
            setSelectedId(null);
            fetchDeposits();
        } catch (err) {
            alert(err.response?.data?.error || 'Action failed');
        }
    };

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <h1 className="text-3xl font-display font-bold">Manage Deposits</h1>
            
            <Card className="p-0 overflow-hidden">
                <Table>
                    <thead className="bg-[#111118] border-b border-[#1E1E2A]">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-400">Date</th>
                            <th className="px-6 py-4 font-medium text-gray-400">Amount</th>
                            <th className="px-6 py-4 font-medium text-gray-400">Proof</th>
                            <th className="px-6 py-4 font-medium text-gray-400">Status</th>
                            <th className="px-6 py-4 font-medium text-gray-400">Action/Message</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E1E2A]">
                        {deposits.map(d => (
                            <tr key={d.id} className="hover:bg-[#111118]/80 transition">
                                <td className="px-6 py-4 text-sm text-gray-300">{new Date(d.created_at).toLocaleString()}</td>
                                <td className="px-6 py-4 font-medium text-[#22C55E]">{d.amount}</td>
                                <td className="px-6 py-4 text-sm text-gray-400 max-w-[200px] truncate" title={d.proof}>{d.proof || '-'}</td>
                                <td className="px-6 py-4">
                                    <Badge variant={d.status === 'approved' ? 'success' : d.status === 'rejected' ? 'danger' : 'warning'}>
                                        {d.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4">
                                    {d.status === 'pending' ? (
                                        selectedId === d.id ? (
                                            <div className="flex gap-2 items-center">
                                                <Input className="w-40 py-1 px-2 h-8 text-sm" placeholder="Message..." value={message} onChange={e => setMessage(e.target.value)} />
                                                <Button variant="success" className="px-3 py-1.5 h-8 text-xs" onClick={() => handleAction(d.id, 'approve')}>✓</Button>
                                                <Button variant="danger" className="px-3 py-1.5 h-8 text-xs" onClick={() => handleAction(d.id, 'reject')}>✗</Button>
                                                <Button variant="ghost" className="px-3 py-1.5 h-8 text-xs" onClick={() => setSelectedId(null)}>Cancel</Button>
                                            </div>
                                        ) : (
                                            <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => setSelectedId(d.id)}>Review</Button>
                                        )
                                    ) : (
                                        <span className="text-sm text-gray-500">{d.admin_message || '-'}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
}
