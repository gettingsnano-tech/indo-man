import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../../components/ui';

import { useBankSettings } from '../../context/BankSettingsContext';

export default function Login() {
    const { login } = useAuth();
    const { publicSettings } = useBankSettings();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await login(email, password);
            if (user.is_admin) {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F] p-4">
            <Card className="w-full max-w-md p-8">
                <div className="flex flex-col items-center mb-6">
                    {publicSettings.bank_logo ? (
                        <img src={publicSettings.bank_logo} alt="Bank Logo" className="h-16 mb-4 object-contain" />
                    ) : (
                        <div className="h-16 w-16 bg-[#2563EB]/20 text-[#2563EB] rounded-2xl flex items-center justify-center mb-4 text-2xl font-bold">
                            {publicSettings?.bank_name?.charAt(0) || 'B'}
                        </div>
                    )}
                    <h1 className="text-2xl font-display font-bold text-white text-center">{publicSettings?.bank_name || 'Banking Platform'}</h1>
                </div>
                <p className="text-gray-400 mb-6 text-center">Sign in to your vault to continue.</p>
                {error && <div className="bg-[#EF4444]/10 text-[#EF4444] p-3 rounded-lg mb-4 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    <Button type="submit" className="w-full">Sign In</Button>
                </form>
                <div className="mt-6 text-center text-sm text-gray-400">
                    Don't have an account? <Link to="/register" className="text-[#2563EB] hover:text-[#2563EB]/80 transition-colors">Register here</Link>
                </div>
            </Card>
        </div>
    );
}
