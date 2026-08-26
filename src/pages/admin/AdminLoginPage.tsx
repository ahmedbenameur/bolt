import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { STORE_NAME } from '@/lib/constants';

export function AdminLoginPage() {
  const { signIn, session } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (session) {
    navigate('/admin/dashboard', { replace: true });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      notify('Identifiants incorrects', 'error');
    } else {
      notify('Connexion réussie');
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="font-display text-3xl font-bold">{STORE_NAME}</h1>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-ink-500">Administration</p>
        </div>
        <form onSubmit={handleSubmit} className="rounded-2xl border border-ink-100 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-900 text-white">
              <Lock className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tunisia.tn"
              />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input
                type="password"
                required
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="mt-6 btn-primary w-full">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <button
          onClick={() => navigate('/')}
          className="mt-6 flex w-full items-center justify-center gap-1 text-sm text-ink-500 hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à la boutique
        </button>
      </div>
    </div>
  );
}
