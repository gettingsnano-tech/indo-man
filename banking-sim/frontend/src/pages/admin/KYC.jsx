import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Card, Table, Badge, Button, Spinner, Input } from '../../components/ui';

export default function KYC() {
    const [kyc, setKyc] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState(null);
    const [status, setStatus] = useState('');
    const [note, setNote] = useState('');

    const fetchKyc = async () => {
        try {
            const res = await api.get('/admin/kyc');
            setKyc(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKyc();
    }, []);

    const startEdit = (k) => {
        setEditId(k.user_id); // Assuming we update by user_id per our route PATCH /api/admin/kyc/:userId
        setStatus(k.status);
        setNote(k.admin_note || '');
    };

    const handleSave = async (userId) => {
        try {
            await api.patch(`/admin/kyc/${userId}`, { status, admin_note: note });
            setEditId(null);
            fetchKyc();
        } catch (err) {
            alert(err.response?.data?.error || 'Save failed');
        }
    };

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <h1 className="text-3xl font-display font-bold">KYC Reviews</h1>
            
            <Card className="p-0 overflow-hidden">
                <Table>
                    <thead className="bg-[#111118] border-b border-[#1E1E2A]">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-400">User / Details</th>
                            <th className="px-6 py-4 font-medium text-gray-400">ID Info</th>
                            <th className="px-6 py-4 font-medium text-gray-400">Status</th>
                            <th className="px-6 py-4 font-medium text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E1E2A]">
                        {kyc.map(k => (
                            <tr key={k.id} className="hover:bg-[#111118]/80 transition">
                                {editId === k.user_id ? (
                                    <td colSpan="4" className="px-6 py-4 bg-[#111118]">
                                        <div className="flex gap-4 items-end">
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500 block mb-1">Status</label>
                                                <select className="w-full bg-[#0A0A0F] border border-[#1E1E2A] rounded-lg px-3 py-2 text-sm text-white" value={status} onChange={e => setStatus(e.target.value)}>
                                                    <option value="pending">Pending</option>
                                                    <option value="verified">Verified</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                            </div>
                                            <div className="flex-2 w-1/2">
                                                <Input label="Admin Note" value={note} onChange={e => setNote(e.target.value)} />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="success" className="h-[42px]" onClick={() => handleSave(k.user_id)}>Save</Button>
                                                <Button variant="ghost" className="h-[42px]" onClick={() => setEditId(null)}>Cancel</Button>
                                            </div>
                                        </div>
                                    </td>
                                ) : (
                                    <>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{k.full_name}</div>
                                            <div className="text-xs text-gray-500 mt-1">Submitted: {new Date(k.submitted_at).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-300">{k.id_type}</div>
                                            <div className="text-xs text-gray-500 font-mono mt-1">{k.id_number}</div>
                                            {k.document_url && <a href={k.document_url} target="_blank" rel="noreferrer" className="text-xs text-brand-500 hover:underline mt-1 block">View Document</a>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={k.status === 'verified' ? 'success' : k.status === 'rejected' ? 'danger' : 'warning'}>
                                                {k.status}
                                            </Badge>
                                            <div className="text-xs text-gray-500 mt-2 truncate max-w-[200px]">{k.admin_note}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="secondary" className="px-4 py-1.5 text-sm" onClick={() => startEdit(k)}>Process</Button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
}
