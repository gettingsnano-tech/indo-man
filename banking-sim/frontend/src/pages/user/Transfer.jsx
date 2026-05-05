import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Card, Button, Input, Table, Badge, Spinner } from '../../components/ui';

export default function Transfer() {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [email, setEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchData = async () => {
        try {
            const [wRes, tRes] = await Promise.all([
                api.get('/user/wallet'),
                api.get('/user/transactions', { params: { limit: 100 } })
            ]);
            setWallet(wRes.data);
            const transfers = tRes.data.data.filter(t => t.type.includes('transfer'));
            setTransactions(transfers);
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
            await api.post('/transfer', { recipient_email: email, amount, note });
            setSuccess(`Successfully transferred to ${email}`);
            setEmail('');
            setAmount('');
            setNote('');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Transfer failed');
        }
    };

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <h1 className="text-3xl font-display font-bold">Transfer Funds</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-[#111118]">
                    <h3 className="text-gray-400 text-sm font-medium mb-1">Available Balance</h3>
                    <div className="text-4xl font-display font-bold text-white mb-4">
                        {wallet?.balance} <span className="text-xl text-[#2563EB]">{wallet?.currency}</span>
                    </div>
                    <p className="text-sm text-gray-400">Instantly send funds to other registered users in the network.</p>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-medium mb-4">Send Transfer</h3>
                    {error && (
                        <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] p-4 rounded-lg mb-4 text-sm">
                            <span className="font-bold block mb-1">Transfer Blocked or Failed:</span>
                            {error}
                        </div>
                    )}
                    {success && <div className="bg-[#22C55E]/10 text-[#22C55E] p-3 rounded-lg mb-4 text-sm">{success}</div>}
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input label="Recipient Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        <Input label="Amount" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
                        <Input label="Note (Optional)" type="text" value={note} onChange={e => setNote(e.target.value)} />
                        <Button type="submit" className="w-full">Send Funds</Button>
                    </form>
                </Card>
            </div>

            <Card className="p-0 overflow-hidden mt-8">
                <div className="p-6 border-b border-[#1E1E2A]">
                    <h3 className="text-lg font-medium">Recent Transfers</h3>
                </div>
                <Table>
                    <thead className="bg-[#111118] border-b border-[#1E1E2A]">
                        <tr>
                            <th className="px-6 py-3 font-medium">Date</th>
                            <th className="px-6 py-3 font-medium">Direction</th>
                            <th className="px-6 py-3 font-medium">Amount</th>
                            <th className="px-6 py-3 font-medium">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E1E2A]">
                        {transactions.map(item => (
                            <tr key={item.id} className="hover:bg-[#111118]/80 transition">
                                <td className="px-6 py-4 text-sm">{new Date(item.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <Badge variant={item.type === 'transfer_in' ? 'success' : 'info'}>
                                        {item.type.replace('_', ' ')}
                                    </Badge>
                                </td>
                                <td className={`px-6 py-4 font-medium ${item.type === 'transfer_in' ? 'text-[#22C55E]' : 'text-white'}`}>
                                    {item.amount}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{item.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
}
