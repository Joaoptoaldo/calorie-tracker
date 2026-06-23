import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

const API_URL = 'http://localhost:5000/api';
const LS_USER_ID_KEY = 'user_id';

export default function Auth() {

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isLogin = useMemo(() => mode === 'login', [mode]);

  useEffect(() => {
    setError(null);
  }, [mode]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        username: username.trim(),
        password,
      };

      const endpoint = isLogin ? '/login' : '/register';

      const res = await axios.post(`${API_URL}${endpoint}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      const userId = res.data?.user_id;
      if (!userId) {
        throw new Error('Resposta do servidor inválida: user_id ausente.');
      }

      localStorage.setItem(LS_USER_ID_KEY, String(userId));
      window.location.reload();
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao autenticar.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md premium-card rounded-2xl p-8">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center mb-2">
          CalorieDiary
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
          {isLogin ? 'Faça login para continuar' : 'Crie sua conta em segundos'}
        </p>

        <div className="flex items-center justify-center gap-3 mb-6">
          <span className={`text-xs font-semibold ${isLogin ? 'text-violet-600' : 'text-slate-400'}`}>Login</span>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!isLogin}
              onChange={(e) => setMode(e.target.checked ? 'register' : 'login')}
              className="sr-only"
            />
            <div className="w-14 h-8 bg-slate-200 dark:bg-slate-800 rounded-full p-1 transition">
              <div
                className={`w-6 h-6 rounded-full shadow transition-all ${!isLogin ? 'translate-x-6 bg-emerald-500' : 'bg-violet-600'
                  }`}
              />
            </div>
          </label>
          <span className={`text-xs font-semibold ${!isLogin ? 'text-emerald-600' : 'text-slate-400'}`}>Cadastro</span>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex: joao"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition text-sm"
              required
            />
          </div>

          {error && (
            <div className="flex items-start gap-2.5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3">
              <span className="mt-0.5">⚠️</span>
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl gradient-violet hover:opacity-90 active:scale-[0.98] text-white font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25"
          >
            {loading ? 'Enviando...' : isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

