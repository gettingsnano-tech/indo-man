import { useEffect, useState } from 'react';
import clsx from 'clsx';
import api from '../../api/axios';
import { Card, Input, Button, Spinner } from '../../components/ui';
import { User, Bell, Lock, Mail } from 'lucide-react';

export default function UserSettings() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [activeTab, setActiveTab] = useState('profile');
    
    // Password state
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/user/profile');
                setProfile(res.data);
            } catch (err) {
                console.error(err);
                if (err.response?.status === 404 || err.response?.status === 401) {
                    setError('Session expired or user not found. Please log in again.');
                } else {
                    setError('Failed to load profile data.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleUpdateProfile = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        setSuccess('');
        setError('');
        try {
            const res = await api.patch('/user/profile', {
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                dob: profile.dob,
                address: profile.address,
                city: profile.city,
                country: profile.country,
                postal_code: profile.postal_code,
                email_notifications: profile.email_notifications,
                push_notifications: profile.push_notifications,
                marketing_notifications: profile.marketing_notifications,
                transaction_notifications: profile.transaction_notifications,
                security_notifications: profile.security_notifications
            });
            setProfile(res.data);
            setSuccess('Settings updated successfully.');
        } catch (err) {
            setError(err.response?.data?.error || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setSaving(true);
        setSuccess('');
        setError('');
        try {
            await api.post('/user/profile/password', { password });
            setPassword('');
            setConfirmPassword('');
            setSuccess('Password updated successfully.');
        } catch (err) {
            setError(err.response?.data?.error || 'Password update failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading && !profile) return <div className="flex h-full items-center justify-center"><Spinner /></div>;

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-display font-bold">Settings & Privacy</h1>
            
            {error && <div className="bg-[#EF4444]/10 text-[#EF4444] p-4 rounded-lg text-sm border border-[#EF4444]/20 mb-4">{error}</div>}
            {success && <div className="bg-[#22C55E]/10 text-[#22C55E] p-4 rounded-lg text-sm border border-[#22C55E]/20 mb-4">{success}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Navigation Tabs */}
                <Card className="p-4 h-fit space-y-1 bg-[#111118]">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all",
                                    activeTab === tab.id 
                                        ? "bg-[#2563EB]/10 text-[#2563EB]" 
                                        : "text-gray-400 hover:text-white hover:bg-[#111118]"
                                )}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </Card>

                <div className="md:col-span-2 space-y-6">
                    {!profile && !loading ? (
                        <Card className="p-8 text-center text-gray-500">
                            Failed to load user profile. Please check your connection or log in again.
                        </Card>
                    ) : (
                        <>
                            {activeTab === 'profile' && (
                                <Card className="p-6">
                                    <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                                        <User size={20} className="text-[#2563EB]" />
                                        Personal Information
                                    </h3>
                                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input 
                                                label="Full Name" 
                                                placeholder="e.g. John Doe"
                                                value={profile?.name || ''} 
                                                onChange={e => setProfile({...profile, name: e.target.value})} 
                                            />
                                            <Input 
                                                label="Email Address" 
                                                type="email"
                                                placeholder="email@example.com"
                                                value={profile?.email || ''} 
                                                onChange={e => setProfile({...profile, email: e.target.value})} 
                                            />
                                            <Input 
                                                label="Phone Number" 
                                                placeholder="+1 234 567 890"
                                                value={profile?.phone || ''} 
                                                onChange={e => setProfile({...profile, phone: e.target.value})} 
                                            />
                                            <Input 
                                                label="Date of Birth" 
                                                type="date"
                                                value={profile?.dob || ''} 
                                                onChange={e => setProfile({...profile, dob: e.target.value})} 
                                            />
                                        </div>
                                        <Input 
                                            label="Street Address" 
                                            placeholder="House number and street name"
                                            value={profile?.address || ''} 
                                            onChange={e => setProfile({...profile, address: e.target.value})} 
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <Input 
                                                label="City" 
                                                placeholder="City"
                                                value={profile?.city || ''} 
                                                onChange={e => setProfile({...profile, city: e.target.value})} 
                                            />
                                            <Input 
                                                label="Country" 
                                                placeholder="Country"
                                                value={profile?.country || ''} 
                                                onChange={e => setProfile({...profile, country: e.target.value})} 
                                            />
                                            <Input 
                                                label="Postal Code" 
                                                placeholder="ZIP Code"
                                                value={profile?.postal_code || ''} 
                                                onChange={e => setProfile({...profile, postal_code: e.target.value})} 
                                            />
                                        </div>
                                        <div className="pt-4 flex justify-end">
                                            <Button type="submit" disabled={saving}>
                                                {saving ? 'Saving...' : 'Update Profile'}
                                            </Button>
                                        </div>
                                    </form>
                                </Card>
                            )}
                        </>
                    )}

                    {activeTab === 'notifications' && (
                        <Card className="p-6">
                            <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                                <Bell size={20} className="text-[#2563EB]" />
                                Notification Preferences
                            </h3>
                            {profile && (
                                <div className="space-y-4">
                                    {[
                                        { id: 'email_notifications', label: 'Email Alerts', desc: 'Critical account updates and transactions.' },
                                        { id: 'push_notifications', label: 'Push Notifications', desc: 'Instant browser alerts for account activity.' },
                                        { id: 'transaction_notifications', label: 'Transaction Updates', desc: 'Alerts for deposits, transfers, and withdrawals.' },
                                        { id: 'security_notifications', label: 'Security Alerts', desc: 'Login attempts and sensitive data changes.' },
                                        { id: 'marketing_notifications', label: 'Promotions', desc: 'New features and financial offers.' },
                                    ].map(pref => (
                                        <div key={pref.id} className="flex items-center justify-between p-4 rounded-xl bg-[#0A0A0F] border border-[#1E1E2A]">
                                            <div>
                                                <p className="font-medium">{pref.label}</p>
                                                <p className="text-xs text-gray-500">{pref.desc}</p>
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                className="w-5 h-5 accent-[#2563EB]" 
                                                checked={profile[pref.id] || false}
                                                onChange={e => setProfile({...profile, [pref.id]: e.target.checked})}
                                            />
                                        </div>
                                    ))}
                                    <div className="pt-4 flex justify-end">
                                        <Button onClick={() => handleUpdateProfile()} disabled={saving}>
                                            {saving ? 'Saving...' : 'Save Preferences'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    )}

                    {activeTab === 'security' && (
                        <Card className="p-6">
                            <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                                <Lock size={20} className="text-[#EF4444]" />
                                Security & Password
                            </h3>
                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <Input 
                                    label="New Password" 
                                    type="password" 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Min. 8 characters"
                                />
                                <Input 
                                    label="Confirm New Password" 
                                    type="password" 
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                />
                                <div className="pt-4 flex justify-end">
                                    <Button type="submit" variant="danger" disabled={saving || !password}>
                                        {saving ? 'Updating...' : 'Update Password'}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
