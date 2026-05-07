'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? 'Error al iniciar sesión');
        return;
      }

      router.push('/inicio');
      router.refresh();
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary-light/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-secondary-light/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[var(--radius-2xl)] bg-gradient-to-br from-primary-light to-primary shadow-md mb-5">
            <Home size={36} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-text tracking-tight">Mudanza</h1>
          <p className="text-text-muted text-sm mt-2">Duvan & Kata — Octubre 2026</p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="bg-surface rounded-[var(--radius-2xl)] p-7 shadow-[var(--shadow-lg)] border border-border-light"
        >
          <div className="mb-5">
            <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-border bg-surface-alt text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light/40 text-sm"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-border bg-surface-alt text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light/40 text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-[var(--radius-md)] bg-error/15 border border-error/30 text-error-dark text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-[var(--radius-md)] bg-gradient-to-r from-primary to-primary-dark text-white font-semibold text-sm shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:brightness-105 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-text-muted mt-6">
          Hecho con amor para nuestra mudanza
        </p>
      </div>
    </div>
  );
}
