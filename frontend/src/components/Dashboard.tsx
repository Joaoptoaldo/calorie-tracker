import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const API_URL = 'http://localhost:5000/api';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Constants ────────────────────────────────────────────────────────────────

const CHART_COLORS = {
  food: '#8b5cf6',    // violet
  workout: '#10b981', // emerald
};

const CATEGORY_LABEL: Record<string, string> = {
  food: '🍽️ Alimentação',
  workout: '🏋️ Treino',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow p-5 gap-1"
      style={{ borderTopColor: color, borderTopWidth: 3 }}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-2xl font-bold text-gray-800 dark:text-white">
        {value.toLocaleString('pt-BR')}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface DashboardProps {
  refreshKey?: number; // increment to force data re-fetch from parent
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
        axios.get<Summary>(`${API_URL}/summary`),
        axios.get<LogEntry[]>(`${API_URL}/logs`),
      ]);
      setSummary(summaryRes.data);
      setLogs(logsRes.data);
    } catch {
      setError(
        'Não foi possível carregar os dados. Verifique se o backend está rodando em http://localhost:5000.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
        <div className="w-10 h-10 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
        <span className="text-sm">Carregando dados...</span>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="text-4xl">⚠️</span>
        <p className="text-red-500 dark:text-red-400 max-w-sm text-sm">{error}</p>
        <button
          id="retry-fetch"
          onClick={fetchData}
          className="mt-2 px-5 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // ── Chart data ─────────────────────────────────────────────────────────────
  const chartData =
    summary && (summary.food_calories > 0 || summary.workout_calories > 0)
      ? [
          { name: 'Consumidas', value: summary.food_calories, key: 'food' },
          { name: 'Queimadas', value: summary.workout_calories, key: 'workout' },
        ].filter((d) => d.value > 0)
      : [];

  const netBalance = summary?.net_balance ?? 0;
  const balanceColor =
    netBalance > 0
      ? 'text-amber-500'
      : netBalance < 0
      ? 'text-emerald-500'
      : 'text-gray-500';

  return (
    <div className="space-y-6">
      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Consumidas"
          value={summary?.food_calories ?? 0}
          color={CHART_COLORS.food}
          icon="🍽️"
        />
        <StatCard
          label="Queimadas"
          value={summary?.workout_calories ?? 0}
          color={CHART_COLORS.workout}
          icon="🔥"
        />
        <div
          className="flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow p-5 gap-1"
          style={{ borderTopWidth: 3, borderTopColor: netBalance >= 0 ? '#f59e0b' : '#10b981' }}
        >
          <span className="text-2xl">⚖️</span>
          <span id="net-balance" className={`text-2xl font-bold ${balanceColor}`}>
            {netBalance >= 0 ? '+' : ''}
            {netBalance.toLocaleString('pt-BR')}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
            Saldo Líquido
          </span>
        </div>
      </div>

      {/* ── Pie Chart ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-100 dark:border-gray-800 p-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <span>🥧</span> Proporção Calórica
        </h2>

        {chartData.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-gray-400 text-sm gap-2">
            <span className="text-3xl">📭</span>
            <span>Nenhum dado registrado ainda.</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={CHART_COLORS[entry.key as keyof typeof CHART_COLORS]}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value.toLocaleString('pt-BR')} kcal`]}
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                }}
              />
              <Legend
                formatter={(value) => (
                  <span className="text-sm text-gray-600 dark:text-gray-300">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Recent Logs ────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-100 dark:border-gray-800 p-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <span>📋</span> Histórico Recente
        </h2>

        {logs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            Nenhum registro encontrado.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800" id="log-list">
            {logs.slice(0, 10).map((log) => (
              <li
                key={log.id}
                className="flex items-center justify-between py-3 gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style={{
                      backgroundColor:
                        log.category === 'food'
                          ? 'rgba(139,92,246,0.12)'
                          : 'rgba(16,185,129,0.12)',
                      color:
                        log.category === 'food'
                          ? CHART_COLORS.food
                          : CHART_COLORS.workout,
                    }}
                  >
                    {log.category === 'food' ? '🍽️' : '🏋️'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                      {log.description}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {CATEGORY_LABEL[log.category]} ·{' '}
                      {new Date(log.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <span
                  className="flex-shrink-0 text-sm font-bold"
                  style={{
                    color:
                      log.category === 'food'
                        ? CHART_COLORS.food
                        : CHART_COLORS.workout,
                  }}
                >
                  {log.category === 'food' ? '+' : '-'}
                  {log.calories.toLocaleString('pt-BR')} kcal
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
