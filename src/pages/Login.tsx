import { useState } from 'react';
import { Swords, Loader2, Mail } from 'lucide-react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

export default function Login() {
  const { login } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await login(email);
    setLoading(false);
    if (err) { setError(err); return; }
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">

        {/* Brand */}
        <div className="flex flex-col items-center space-y-3">
          <div className="p-3 rounded-xl bg-purple-600/20 border border-purple-500/30">
            <Swords size={28} className="text-purple-400" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-100">GrimoireXBT</h1>
            <p className="text-sm text-gray-500">Your gamified trading journal</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
          {!sent ? (
            <>
              <div>
                <h2 className="text-base font-medium text-gray-100">Sign in</h2>
                <p className="text-xs text-gray-500 mt-1">We'll send a magic link to your email</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="trader@example.com"
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  {loading ? 'Sending…' : 'Send magic link'}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center py-4 space-y-3 text-center">
              <div className="p-3 rounded-full bg-emerald-400/10">
                <Mail size={24} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-100">Check your email</p>
                <p className="text-xs text-gray-500 mt-1">Magic link sent to <span className="text-gray-300">{email}</span></p>
              </div>
              <button onClick={() => setSent(false)} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                Use a different email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
