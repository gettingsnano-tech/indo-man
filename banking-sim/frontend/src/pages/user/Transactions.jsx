import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Card, Table, Badge, Spinner } from '../../components/ui';

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await api.get('/user/transactions', { params: { limit: 100 } });
                setTransactions(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <h1 className="text-3xl font-display font-bold">Transaction History</h1>
            
            <Card className="p-0 overflow-hidden">
                <Table>
                    <thead className="bg-[#111118] border-b border-[#1E1E2A]">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-400">Date</th>
                            <th className="px-6 py-4 font-medium text-gray-400">Type</th>
                            <th className="px-6 py-4 font-medium text-gray-400">Amount</th>
                            <th className="px-6 py-4 font-medium text-gray-400">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E1E2A]">
                        {transactions.map(item => (
                            <tr key={item.id} className="hover:bg-[#111118]/80 transition">
                                <td className="px-6 py-4 text-sm text-gray-300">
                                    {new Date(item.created_at).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant={
                                        item.type === 'deposit' || item.type === 'transfer_in' ? 'success' :
                                        item.type === 'withdrawal' ? 'danger' : 'info'
                                    }>
                                        {item.type.replace('_', ' ')}
                                    </Badge>
                                </td>
                                <td className={`px-6 py-4 font-medium ${item.amount > 0 ? (item.type.includes('in') || item.type === 'deposit' ? 'text-[#22C55E]' : 'text-[#EF4444]') : 'text-white'}`}>
                                    {item.amount}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{item.description}</td>
                            </tr>
                        ))}
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No transactions found.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
}
