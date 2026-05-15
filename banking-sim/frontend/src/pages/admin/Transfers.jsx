import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Card, Table, Badge, Spinner } from '../../components/ui';
import { Send, Clock, User } from 'lucide-react';

export default function AdminTransfers() {
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTransfers = async () => {
        try {
            const res = await api.get('/admin/transfers');
            setTransfers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransfers();
    }, []);

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-display font-bold">Internal Network Ledger</h1>
                <p className="text-gray-500 mt-1">Audit trail for all internal peer-to-peer transfers.</p>
            </div>
            
            <Card className="p-0 overflow-hidden bg-[#111118] border-[#1E1E2A]">
                <Table>
                    <thead className="bg-[#0D0D14] border-b border-[#1E1E2A]">
                        <tr>
                            <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-left">Timestamp</th>
                            <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-left">Sender</th>
                            <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-left">Recipient</th>
                            <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-left">Amount</th>
                            <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E1E2A]">
                        {transfers.map(t => (
                            <tr key={t.id} className="hover:bg-[#15151E]/50 transition-colors">
                                <td className="px-6 py-6 text-sm text-gray-400">
                                    {new Date(t.created_at).toLocaleString()}
                                </td>
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-2">
                                        <User size={14} className="text-blue-500" />
                                        <span className="text-sm font-medium text-white">{t.sender_email || t.sender_id}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-2">
                                        <User size={14} className="text-emerald-500" />
                                        <span className="text-sm font-medium text-white">{t.recipient_email || t.recipient_id}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-6 font-bold text-white">
                                    {t.amount}
                                </td>
                                <td className="px-6 py-6">
                                    <Badge variant="success" className="text-[10px] uppercase font-bold">COMPLETED</Badge>
                                </td>
                            </tr>
                        ))}
                        {transfers.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-20 text-center text-gray-500">
                                    <Send size={40} className="mx-auto mb-4 opacity-20" />
                                    <p>No internal transfers found.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
}
