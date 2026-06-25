import axios from 'axios';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { API_URL } from '../config/api';

const LS_USER_ID_KEY = 'user_id';
const LS_TOKEN_KEY = 'access_token';

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isLogin = useMemo(() => mode === 'login', [mode]);

  useEffect(() => {
    setError(null);
  }, [mode]);

  const inFlightRef = useRef(false);

  const submit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    if (inFlightRef.current) return;
    e.preventDefault();
    setError(null);
    setLoading(true);

    const credentials = {
      username: username.trim(),
      password,
    };

    try {
      if (isLogin) {
        const loginRes = await axios.post<{
          user_id: number | string;
          access_token: string;
        }>(
          `${API_URL}/login`,
          credentials,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const userId = loginRes.data?.user_id;
        if (!userId) {
          throw new Error('Resposta do servidor inválida: user_id ausente.');
        }

        const accessToken = loginRes.data?.access_token;
        if (!accessToken) {
          throw new Error(
            'Resposta do servidor inválida: access_token ausente.'
          );
        }

        localStorage.setItem(LS_USER_ID_KEY, String(userId));
        localStorage.setItem(LS_TOKEN_KEY, String(accessToken));
        window.location.reload();
        return;
      }

      await axios.post<{ user_id: number | string }>(
        `${API_URL}/register`,
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const loginRes = await axios.post<{
        user_id: number | string;
        access_token: string;
      }>(
        `${API_URL}/login`,
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const userId = loginRes.data?.user_id;
      if (!userId) {
        throw new Error('Resposta do servidor inválida: user_id ausente.');
      }

      const accessToken = loginRes.data?.access_token;
      if (!accessToken) {
        throw new Error(
          'Resposta do servidor inválida: access_token ausente.'
        );
      }

      localStorage.setItem(LS_USER_ID_KEY, String(userId));
      localStorage.setItem(LS_TOKEN_KEY, String(accessToken));
      window.location.reload();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          'Falha ao autenticar.';

        setError(msg);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Falha ao autenticar.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md premium-card rounded-2xl p-8 flex flex-col items-center">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center">
          CalorieDiary
        </h2>

        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-2">
          {isLogin
            ? 'Faça login para continuar'
            : 'Crie sua conta em segundos'}
        </p>

        <div className="flex items-center justify-center gap-3 mt-6 mb-7">
          <span
            className={`text-xs font-semibold ${isLogin ? 'text-violet-600' : 'text-slate-400'}`}
          >
            Login
          </span>

          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!isLogin}
              onChange={(e) =>
                setMode(e.target.checked ? 'register' : 'login')
              }
              className="sr-only"
            />

            <div className="w-14 h-8 bg-slate-200 dark:bg-slate-800 rounded-full p-1 transition">
              <div
                className={`w-6 h-6 rounded-full shadow transition-all ${!isLogin
                  ? 'translate-x-6 bg-emerald-500'
                  : 'bg-violet-600'
                  }`}
              />
            </div>
          </label>

          <span
            className={`text-xs font-semibold ${!isLogin ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            Cadastro
          </span>
        </div>

        <form onSubmit={submit} className="w-full flex flex-col items-stretch space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 text-center">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex: joao"
              className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition text-sm text-center"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 text-center">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition text-sm text-center"
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
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl gradient-violet hover:opacity-90 active:scale-[0.98] text-white font-semibold text-base transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-violet-500/30"
          >
            {loading
              ? 'Enviando...'
              : isLogin
                ? 'Entrar'
                : 'Cadastrar'}
          </button>
        </form>
      </div>
    </div>
  );
}