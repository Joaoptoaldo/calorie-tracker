import { useState } from 'react';

const API_URL = 'http://localhost:5000/api';

const CATEGORIES = [
  { value: 'food', label: '🍽️ Alimentação', hint: 'Calorias ingeridas' },
  { value: 'workout', label: '🏋️ Treino', hint: 'Calorias queimadas' },
];

type LogFormProps = {
  onSuccess?: () => void;
};

export default function LogForm({ onSuccess }: LogFormProps) {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'food' | 'workout'>('food');
  const [calories, setCalories] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedCategory = CATEGORIES.find((c) => c.value === category)!;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const caloriesNum = parseInt(calories, 10);
    if (!description.trim()) {
      setError('A descrição é obrigatória.');
      return;
    }
    if (isNaN(caloriesNum) || caloriesNum <= 0) {
      setError('Informe um valor de calorias válido (número positivo).');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          category,
          calories: caloriesNum,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao salvar o registro');
      }

      setDescription('');
      setCalories('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message ?? 'Erro de comunicação com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-card rounded-2xl p-7">
      {/* Section header */}
      <h2 className="text-base font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-lg gradient-violet flex items-center justify-center text-sm text-white shadow">
          📝
        </span>
        Novo Registro
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5" id="log-form">
        {/* Category toggle */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Categoria
          </label>
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                id={`category-${cat.value}`}
                onClick={() => setCategory(cat.value as 'food' | 'workout')}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  category === cat.value
                    ? cat.value === 'food'
                      ? 'gradient-violet text-white shadow-md shadow-violet-500/25'
                      : 'gradient-emerald text-white shadow-md shadow-emerald-500/25'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 ml-1">
            {selectedCategory.hint}
          </p>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
          >
            Descrição
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              category === 'food'
                ? 'Ex: Frango grelhado com arroz'
                : 'Ex: Corrida 30 min'
            }
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition text-sm"
          />
        </div>

        {/* Calories */}
        <div>
          <label
            htmlFor="calories"
            className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
          >
            Calorias (kcal)
          </label>
          <input
            id="calories"
            type="number"
            min="1"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="Ex: 450"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition text-sm"
          />
        </div>

        {/* Feedback */}
        {error && (
          <div className="flex items-start gap-2.5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3">
            <span className="mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2.5 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl px-4 py-3">
            <span>✅</span>
            <span>Registro adicionado com sucesso!</span>
          </div>
        )}

        {/* Submit */}
        <button
          id="submit-log"
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl gradient-violet hover:opacity-90 active:scale-[0.98] text-white font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25"
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
          ) : null}
          {loading ? 'Salvando...' : 'Salvar Registro'}
        </button>
      </form>
    </div>
  );
}
