import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Card, Input, Button, Spinner, Badge } from '../../components/ui';
import { Plus, Hash, Landmark, Building2, User } from 'lucide-react';
import clsx from 'clsx';

export default function AccountPool() {
    const [pool, setPool] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    
    const [formData, setFormData] = useState({
        account_number: '',
        routing_number: '',
        bank_name: ''
    });

    const fetchPool = async () => {
        try {
            const res = await api.get('/accounts/admin/pool');
            setPool(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPool();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAdding(true);
        try {
            await api.post('/accounts/admin/pool', formData);
            setFormData({ account_number: '', routing_number: '', bank_name: '' });
            fetchPool();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to add to pool');
        } finally {
            setAdding(false);
        }
    };

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-display font-bold">Account Number Pool</h1>
                    <p className="text-gray-500 mt-1">Manage the available pool of bank account details for users.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Card */}
                <Card className="p-6 h-fit bg-[#111118]">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Plus size={20} className="text-[#2563EB]" />
                        Add New Detail
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input 
                            label="Account Number" 
                            placeholder="e.g. 1000998877"
                            value={formData.account_number}
                            onChange={e => setFormData({...formData, account_number: e.target.value})}
                            required
                        />
                        <Input 
                            label="Routing Number" 
                            placeholder="e.g. 021000021"
                            value={formData.routing_number}
                            onChange={e => setFormData({...formData, routing_number: e.target.value})}
                            required
                        />
                        <Input 
                            label="Bank Name" 
                            placeholder="e.g. JPMorgan Chase"
                            value={formData.bank_name}
                            onChange={e => setFormData({...formData, bank_name: e.target.value})}
                            required
                        />
                        <Button type="submit" className="w-full mt-2" disabled={adding}>
                            {adding ? 'Adding...' : 'Add to Pool'}
                        </Button>
                    </form>
                </Card>

                {/* Pool Table */}
                <Card className="lg:col-span-2 overflow-hidden">
                    <div className="p-6 border-b border-[#1E1E2A] flex justify-between items-center">
                        <h3 className="font-bold">Available Pool</h3>
                        <Badge>{pool.length} Total</Badge>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#0D0D14] text-[10px] text-gray-500 uppercase tracking-widest border-b border-[#1E1E2A]">
                                    <th className="px-6 py-4 font-bold">Account Info</th>
                                    <th className="px-6 py-4 font-bold">Routing</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold">Assigned To</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1E1E2A]">
                                {pool.length > 0 ? (
                                    pool.map(item => (
                                        <tr key={item.id} className="hover:bg-[#111118] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-[#1E1E2A] flex items-center justify-center">
                                                        <Hash size={14} className="text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{item.account_number}</p>
                                                        <p className="text-[10px] text-gray-500">{item.bank_name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-mono text-gray-400">{item.routing_number}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={item.is_used ? 'danger' : 'success'}>
                                                    {item.is_used ? 'USED' : 'AVAILABLE'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.is_used ? (
                                                    <div className="flex items-center gap-2 text-xs text-blue-400">
                                                        <User size={12} />
                                                        <span>Assigned</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-600">--</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            No account details in the pool.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
