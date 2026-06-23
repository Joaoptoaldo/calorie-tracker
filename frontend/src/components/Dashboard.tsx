import { useEffect, useState, useCallback } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import LogForm from './LogForm';

const API_URL = 'http://localhost:5000/api';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Summary {
  food_calories: number;
  workout_calories: number;
  net_balance: number;
}

interface LogEntry {
  id: number;
  description: string;
  category: 'food' | 'workout';
  calories: number;
  date: string;
}

// ─── Design tokens ──────────────────────────────────────────────────────────

const CHART_COLORS = {
  food: '#8b5cf6',
  workout: '#10b981',
};

const CATEGORY_LABEL: Record<string, string> = {
  food: '🍽️ Alimentação',
  workout: '🏋️ Treino',
};

// ─── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  gradient,
  suffix = 'kcal',
  animClass = '',
}: {
  label: string;
  value: number;
  icon: string;
  gradient: string;
  suffix?: string;
  animClass?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 shadow-lg ${animClass}`}
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 ${gradient} opacity-90`} />
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />

      <div className="relative z-10 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/70">
            {label}
          </span>
          <span className="text-2xl">{icon}</span>
        </div>
        <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {value.toLocaleString('pt-BR')}
        </span>
        <span className="text-sm font-medium text-white/60">{suffix}</span>
      </div>
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────

interface DashboardProps {
  refreshKey?: number;
}

export default function Dashboard({ refreshKey = 0 }: DashboardProps) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, logsRes] = await Promise.all([
        fetch(`${API_URL}/summary`).then((r) => r.json()),
        fetch(`${API_URL}/logs`).then((r) => r.json()),
      ]);
      setSummary(summaryRes as Summary);
      setLogs(logsRes as LogEntry[]);
    } catch {
      setError(
        'Não foi possível carregar os dados. Verifique se o backend está rodando na porta 5000.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  const handleDelete = async (logId: number) => {
    try {
      const response = await fetch(`${API_URL}/logs/${logId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir o registro.');
      }
      
      // Update logs list state instantly without reloading
      setLogs((prev) => prev.filter((log) => log.id !== logId));

      // Re-fetch summary in background to update stat cards and pie chart
      const summaryRes = await fetch(`${API_URL}/summary`).then((r) => r.json());
      setSummary(summaryRes as Summary);
    } catch (err: any) {
      alert(err.message ?? 'Não foi possível excluir o registro.');
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <div className="w-12 h-12 rounded-full border-[3px] border-violet-500/30 border-t-violet-500 animate-spin" />
        <span className="text-sm text-gray-400 font-medium">
          Carregando dados...
        </span>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="glass-card rounded-2xl shadow-xl p-10 flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        <p className="text-red-500 dark:text-red-400 max-w-md text-sm leading-relaxed">
          {error}
        </p>
        <button
          id="retry-fetch"
          onClick={fetchData}
          className="mt-1 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-all active:scale-[0.97] shadow-md shadow-violet-500/25"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // ── Derived data ──────────────────────────────────────────────────────────
  const chartData =
    summary && (summary.food_calories > 0 || summary.workout_calories > 0)
      ? [
          { name: 'Consumidas', value: summary.food_calories, key: 'food' },
          { name: 'Queimadas', value: summary.workout_calories, key: 'workout' },
        ].filter((d) => d.value > 0)
      : [];

  const netBalance = summary?.net_balance ?? 0;

  return (
    <div className="space-y-8">
      {/* ── Stat Cards Row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          label="Consumidas"
          value={summary?.food_calories ?? 0}
          icon="🍽️"
          gradient="gradient-violet"
          animClass="animate-fade-in"
        />
        <StatCard
          label="Queimadas"
          value={summary?.workout_calories ?? 0}
          icon="🔥"
          gradient="gradient-emerald"
          animClass="animate-fade-in-delay-1"
        />
        <StatCard
          label="Saldo Líquido"
          value={netBalance}
          icon="⚖️"
          gradient={netBalance >= 0 ? 'gradient-amber' : 'gradient-emerald'}
          suffix={netBalance >= 0 ? 'kcal excedentes' : 'kcal deficit'}
          animClass="animate-fade-in-delay-2"
        />
      </div>

      {/* ── Main Layout Grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Pie Chart and LogForm stacked */}
        <div className="flex flex-col gap-8">
          {/* Pie Chart Card */}
          <div className="premium-card rounded-2xl p-7 animate-fade-in-delay-2">
            <h2 className="text-base font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg gradient-violet flex items-center justify-center text-sm text-white shadow">
                📊
              </span>
              Proporção Calórica
            </h2>

            {chartData.length === 0 ? (
              <div className="flex flex-col items-center py-14 text-gray-400 text-sm gap-3">
                <span className="text-4xl">📭</span>
                <span>Nenhum dado registrado ainda.</span>
                <span className="text-xs text-gray-300 dark:text-gray-600">
                  Adicione um registro para ver o gráfico
                </span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    strokeWidth={0}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.key}
                        fill={CHART_COLORS[entry.key as keyof typeof CHART_COLORS]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      `${value.toLocaleString('pt-BR')} kcal`,
                    ]}
                    contentStyle={{
                      borderRadius: '14px',
                      border: 'none',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                      padding: '10px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={10}
                    formatter={(value) => (
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-1">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* LogForm Card */}
          <LogForm onSuccess={fetchData} />
        </div>

        {/* Right Column: Recent Logs */}
        <div className="premium-card rounded-2xl p-7 animate-fade-in-delay-3">
          <h2 className="text-base font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg gradient-emerald flex items-center justify-center text-sm text-white shadow">
              📋
            </span>
            Histórico Recente
          </h2>

          {logs.length === 0 ? (
            <div className="flex flex-col items-center py-14 text-gray-400 text-sm gap-3">
              <span className="text-4xl">📭</span>
              <span>Nenhum registro encontrado.</span>
            </div>
          ) : (
            <ul className="space-y-2" id="log-list">
              {logs.slice(0, 8).map((log) => (
                <li
                  key={log.id}
                  className="flex items-center justify-between py-3.5 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800/60 group"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <span
                      className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-300 group-hover:scale-105 ${
                        log.category === 'food'
                          ? 'bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400 border border-red-500/10 dark:border-red-500/20'
                          : 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/10 dark:border-emerald-500/20'
                      }`}
                    >
                      {log.category === 'food' ? '🍽️' : '🏋️'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {log.description}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {CATEGORY_LABEL[log.category]} ·{' '}
                        {new Date(log.date + 'T00:00:00').toLocaleDateString(
                          'pt-BR'
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`flex-shrink-0 text-sm font-bold tabular-nums ${
                        log.category === 'food'
                          ? 'text-red-500 dark:text-red-400'
                          : 'text-emerald-500 dark:text-emerald-400'
                      }`}
                    >
                      {log.category === 'food' ? '+' : '−'}
                      {log.calories.toLocaleString('pt-BR')}
                      <span className="text-xs font-medium ml-0.5 opacity-60">
                        kcal
                      </span>
                    </span>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100"
                      title="Excluir registro"
                      aria-label="Excluir registro"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
