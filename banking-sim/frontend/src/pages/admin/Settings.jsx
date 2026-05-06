import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Card, Input, Button, Spinner } from '../../components/ui';

export default function Settings() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/admin/settings');
                setSettings(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("Logo must be less than 2MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings({ ...settings, bank_logo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSuccess('');
        try {
            await api.patch('/admin/settings', settings);
            setSuccess('Global settings updated successfully.');
        } catch (err) {
            alert('Failed to update settings');
        }
    };

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;
    if (!settings) return <Card className="p-8 text-center text-gray-500">Failed to load system settings. Please check your connection.</Card>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-display font-bold">Global Simulation Settings</h1>
            
            {success && <div className="bg-[#22C55E]/10 text-[#22C55E] p-4 rounded-lg text-sm font-medium border border-[#22C55E]/20">{success}</div>}

            <form onSubmit={handleSave} className="space-y-6">
                <Card className="p-6 space-y-6">
                    <h3 className="text-xl font-medium border-b border-[#1E1E2A] pb-4">Thresholds & Fees</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="KYC Deposit Threshold" name="kyc_threshold" type="number" step="0.01" value={settings.kyc_threshold || ''} onChange={handleChange} />
                        <Input label="Deposit Review Threshold" name="deposit_threshold" type="number" step="0.01" value={settings.deposit_threshold || ''} onChange={handleChange} />
                        <Input label="Default Withdrawal Fee" name="default_withdrawal_fee" type="number" step="0.01" value={settings.default_withdrawal_fee || ''} onChange={handleChange} />
                        <Input label="System Currency (e.g. USD, EUR, GBP)" name="default_currency" value={settings.default_currency || ''} onChange={handleChange} />
                        <Input label="Global Bank Name" name="bank_name" value={settings.bank_name || ''} onChange={handleChange} />
                        <Input label="Bank Phone" name="bank_phone" value={settings.bank_phone || ''} onChange={handleChange} />
                        <Input label="Bank Email" name="bank_email" value={settings.bank_email || ''} onChange={handleChange} />
                        <Input label="Customer Care" name="customer_care" value={settings.customer_care || ''} onChange={handleChange} />
                        
                        <div className="md:col-span-2 space-y-2 mt-2">
                            <label className="text-sm font-medium text-gray-300 block mb-2">Bank Logo</label>
                            <div className="flex items-center space-x-6">
                                {settings.bank_logo ? (
                                    <div className="relative group">
                                        <img src={settings.bank_logo} alt="Current Logo" className="h-16 w-16 object-contain bg-white/5 rounded p-2" />
                                        <button 
                                            type="button"
                                            onClick={() => setSettings({...settings, bank_logo: null})}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <div className="h-16 w-16 bg-[#2563EB]/20 text-[#2563EB] rounded-lg flex items-center justify-center font-bold">
                                        Logo
                                    </div>
                                )}
                                <label className="cursor-pointer bg-[#1E1E2A] hover:bg-[#2A2A3A] transition-colors text-white px-4 py-2 rounded-lg text-sm border border-gray-700">
                                    Upload New Logo
                                    <input type="file" className="hidden" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoUpload} />
                                </label>
                                <span className="text-xs text-gray-500">Max 2MB (PNG, JPG, SVG)</span>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 space-y-6">
                    <h3 className="text-xl font-medium border-b border-[#1E1E2A] pb-4">Bank Deposit Instructions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Bank Name" name="deposit_bank_name" value={settings.deposit_bank_name || ''} onChange={handleChange} />
                        <Input label="Account Number" name="deposit_account_number" value={settings.deposit_account_number || ''} onChange={handleChange} />
                        <Input label="Account Name" name="deposit_account_name" value={settings.deposit_account_name || ''} onChange={handleChange} />
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-sm font-medium text-gray-300">Custom Instructions</label>
                            <textarea 
                                name="deposit_instructions" 
                                value={settings.deposit_instructions || ''} 
                                onChange={handleChange}
                                rows="4"
                                className="w-full bg-[#0A0A0F] border border-[#1E1E2A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#2563EB]"
                            />
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" variant="primary" className="px-8 py-3 text-lg shadow-lg shadow-[#2563EB]/20">Save Configuration</Button>
                </div>
            </form>
        </div>
    );
}
