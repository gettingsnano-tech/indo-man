import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Card, Button, Input, Table, Badge, Spinner } from '../../components/ui';

export default function Deposit() {
    const [instructions, setInstructions] = useState(null);
    const [history, setHistory] = useState([]);
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [amount, setAmount] = useState('');
    const [proof, setProof] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchData = async () => {
        try {
            const [instRes, histRes] = await Promise.all([
                api.get('/deposit/instructions'),
                api.get('/deposit/history')
            ]);
            setInstructions(instRes.data);
            setHistory(histRes.data);
            
            // Fetch account separately as it might 404 if not assigned
            try {
                const accRes = await api.get('/accounts/my-account');
                setAccount(accRes.data);
            } catch (e) {
                // Ignore 404 for account
            }
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
            await api.post('/deposit/request', { amount, proof });
            setSuccess('Deposit request submitted successfully.');
            setAmount('');
            setProof('');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Submission failed');
        }
    };

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <h1 className="text-3xl font-display font-bold">Deposit Funds</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-[#111118]">
                    <h3 className="text-lg font-medium mb-4">Bank Transfer Instructions</h3>
                    
                    {account ? (
                        <div className="space-y-4">
                            <div className="bg-[#2563EB]/5 p-4 rounded-lg border border-[#2563EB]/10 mb-4">
                                <p className="text-xs text-[#2563EB] font-bold uppercase tracking-wider mb-1">Your Personal Assigned Account</p>
                                <p className="text-xs text-gray-400">Please use these details to deposit funds via wire transfer or ACH.</p>
                            </div>
                            <div className="space-y-4 text-sm text-gray-300">
                                <div>
                                    <span className="block text-gray-500 mb-1">Bank Name</span>
                                    <div className="font-medium text-white">{account.bank_name}</div>
                                </div>
                                <div>
                                    <span className="block text-gray-500 mb-1">Account Number</span>
                                    <div className="font-medium text-[#2563EB] font-mono">{account.account_number}</div>
                                </div>
                                <div>
                                    <span className="block text-gray-500 mb-1">Routing Number</span>
                                    <div className="font-medium text-white font-mono">{account.routing_number}</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 text-sm text-gray-300">
                            <div>
                                <span className="block text-gray-500 mb-1">Bank Name</span>
                                <div className="font-medium text-white">{instructions?.bank_name || 'N/A'}</div>
                            </div>
                            <div>
                                <span className="block text-gray-500 mb-1">Account Number</span>
                                <div className="font-medium text-white">{instructions?.account_number || 'N/A'}</div>
                            </div>
                            <div>
                                <span className="block text-gray-500 mb-1">Account Name</span>
                                <div className="font-medium text-white">{instructions?.account_name || 'N/A'}</div>
                            </div>
                            <div className="pt-4 border-t border-[#1E1E2A]">
                                <span className="block text-gray-500 mb-1">Instructions</span>
                                <div className="text-gray-400 leading-relaxed">{instructions?.deposit_instructions || 'Please follow the standard deposit procedure.'}</div>
                            </div>
                        </div>
                    )}
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-medium mb-4">Submit Deposit Request</h3>
                    {error && <div className="bg-[#EF4444]/10 text-[#EF4444] p-3 rounded-lg mb-4 text-sm">{error}</div>}
                    {success && <div className="bg-[#22C55E]/10 text-[#22C55E] p-3 rounded-lg mb-4 text-sm">{success}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input label="Amount" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
                        <Input label="Payment Proof / Reference (Optional)" type="text" value={proof} onChange={e => setProof(e.target.value)} placeholder="TxHash or reference number" />
                        <Button type="submit" className="w-full">Submit Request</Button>
                    </form>
                </Card>
            </div>

            <Card className="p-0 overflow-hidden mt-8">
                <div className="p-6 border-b border-[#1E1E2A]">
                    <h3 className="text-lg font-medium">Deposit History</h3>
                </div>
                <Table>
                    <thead className="bg-[#111118] border-b border-[#1E1E2A]">
                        <tr>
                            <th className="px-6 py-3 font-medium">Date</th>
                            <th className="px-6 py-3 font-medium">Amount</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                            <th className="px-6 py-3 font-medium">Admin Message</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E1E2A]">
                        {history.map(item => (
                            <tr key={item.id} className="hover:bg-[#111118]/80 transition">
                                <td className="px-6 py-4">{new Date(item.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-medium text-white">{item.amount}</td>
                                <td className="px-6 py-4">
                                    <Badge variant={item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'danger' : 'warning'}>
                                        {item.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-gray-500">{item.admin_message || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
}
