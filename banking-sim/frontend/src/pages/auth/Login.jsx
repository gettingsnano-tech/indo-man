import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../../components/ui';

export default function Login() {
    const { login } = useAuth();
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
                <h1 className="text-2xl font-display font-bold text-white mb-2">Welcome Back</h1>
                <p className="text-gray-400 mb-6">Sign in to your vault to continue.</p>
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
