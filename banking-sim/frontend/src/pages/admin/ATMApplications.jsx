import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Card, Table, Badge, Button, Spinner, Input } from '../../components/ui';

export default function ATMApplications() {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState(null);
    const [status, setStatus] = useState('');
    const [message, setMessage] = useState('');

    const fetchApps = async () => {
        try {
            const res = await api.get('/atm/admin/list');
            setApps(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApps();
    }, []);

    const startEdit = (app) => {
        setEditId(app.id);
        setStatus(app.status);
        setMessage(app.admin_message || '');
    };

    const handleSave = async (id) => {
        try {
            await api.patch(`/atm/admin/${id}`, { status, admin_message: message });
            setEditId(null);
            fetchApps();
        } catch (err) {
            alert(err.response?.data?.error || 'Update failed');
        }
    };

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <h1 className="text-3xl font-display font-bold">ATM Card Applications</h1>
            
            <Card className="p-0 overflow-hidden">
                <Table>
                    <thead className="bg-[#111118] border-b border-[#1E1E2A]">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-400">User / Date</th>
                            <th className="px-6 py-4 font-medium text-gray-400">Card Type</th>
                            <th className="px-6 py-4 font-medium text-gray-400">Status</th>
                            <th className="px-6 py-4 font-medium text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E1E2A]">
                        {apps.map(app => (
                            <tr key={app.id} className="hover:bg-[#111118]/80 transition">
                                {editId === app.id ? (
                                    <td colSpan="4" className="px-6 py-4 bg-[#111118]">
                                        <div className="flex gap-4 items-end">
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500 block mb-1">Status</label>
                                                <select className="w-full bg-[#0A0A0F] border border-[#1E1E2A] rounded-lg px-3 py-2 text-sm text-white" value={status} onChange={e => setStatus(e.target.value)}>
                                                    <option value="pending">Pending</option>
                                                    <option value="approved">Approved</option>
                                                    <option value="rejected">Rejected</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                </select>
                                            </div>
                                            <div className="flex-2 w-1/2">
                                                <Input label="Admin Message" value={message} onChange={e => setMessage(e.target.value)} />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="success" className="h-[42px]" onClick={() => handleSave(app.id)}>Save</Button>
                                                <Button variant="ghost" className="h-[42px]" onClick={() => setEditId(null)}>Cancel</Button>
                                            </div>
                                        </div>
                                    </td>
                                ) : (
                                    <>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{app.user?.name}</div>
                                            <div className="text-xs text-gray-500">{app.user?.email}</div>
                                            <div className="text-xs text-gray-400 mt-1">{new Date(app.created_at).toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="info">{app.card_type}</Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={
                                                app.status === 'delivered' || app.status === 'shipped' || app.status === 'approved' ? 'success' : 
                                                app.status === 'rejected' ? 'danger' : 'warning'
                                            }>
                                                {app.status.toUpperCase()}
                                            </Badge>
                                            {app.admin_message && <div className="text-xs text-gray-500 mt-1">{app.admin_message}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="secondary" className="px-4 py-1.5 text-sm" onClick={() => startEdit(app)}>Update</Button>
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
