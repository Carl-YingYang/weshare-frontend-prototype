import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, AlertCircle, Loader2 } from 'lucide-react';
import { apiFetch } from '../api/client'; // Import natin yung ginawa mong API Client!

export default function Login() {
    const navigate = useNavigate();

    const [isRegistering, setIsRegistering] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Para sa loading spinner
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState('');

    // Auto-generate initials galing sa Username (e.g., "Carl Nieva" -> "CN")
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (!isRegistering) {
                // 🟢 TOTOONG LOGIN API CALL
                const response = await apiFetch('/Auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password }),
                });

                // I-save ang totoong JWT token!
                localStorage.setItem('weshare_token', response.token);
                navigate('/feed');

            } else {
                // 🔵 TOTOONG REGISTER API CALL
                const initials = getInitials(username);
                const response = await apiFetch('/Auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ email, username, password, role, initials }),
                });

                // I-save ang totoong JWT token!
                localStorage.setItem('weshare_token', response.token);
                navigate('/feed');
            }
        } catch (err: any) {
            // Kapag nag-throw ng error ang backend (e.g., "Email already in use")
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[28px] p-10 w-full max-w-[420px] relative z-10 shadow-2xl">
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <LayoutGrid className="text-white w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-white tracking-tight">Weshare</span>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-xl font-bold text-white">{isRegistering ? 'Create your workspace' : 'Welcome back'}</h2>
                    <p className="text-xs text-slate-400 mt-1">{isRegistering ? 'Join your team today.' : 'Enter your details to access your account.'}</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <p className="text-xs font-medium text-rose-400 leading-snug">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegistering && (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Full Name</label>
                                <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Carl Nieva" className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Job Role</label>
                                <input type="text" required value={role} onChange={(e) => setRole(e.target.value)} placeholder="AI Engineer" className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" />
                            </div>
                        </>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Work Email</label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="carl@weshare.io" className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Password</label>
                        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" />
                    </div>

                    <button disabled={isLoading} type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all mt-6 disabled:opacity-70 flex items-center justify-center gap-2">
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isRegistering ? 'Create Account' : 'Access Workspace'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button onClick={() => { setIsRegistering(!isRegistering); setError(''); }} type="button" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
                        {isRegistering ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
                    </button>
                </div>
            </div>
        </div>
    );
}