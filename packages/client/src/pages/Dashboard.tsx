import { expensesApi, Summary, Expense } from '../services/api';
import { useApi } from '../hooks/useApi';
import { Layout } from '../components/Layout';
import { ProgressBar } from '../components/ProgressBar';
import { Link } from 'react-router-dom';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(amount);
}

export function Dashboard() {
  const { data: summary, loading: summaryLoading } = useApi<Summary>(
    () => expensesApi.getSummary(),
    []
  );

  const { data: expenses, loading: expensesLoading } = useApi<Expense[]>(
    () => expensesApi.getAll(),
    []
  );

  const loading = summaryLoading || expensesLoading;

  return (
    <Layout>
      <div className="p-4 max-w-lg mx-auto space-y-6">
        <header className="pt-4">
          <h1 className="text-3xl font-bold text-servo-400">Servo</h1>
          <p className="text-slate-500 mt-1">Control de Gastos Mensuales</p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <span className="text-slate-500 animate-pulse">Cargando...</span>
          </div>
        ) : summary ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
                <p className="text-sm text-slate-500">Gastado</p>
                <p className="text-2xl font-bold text-servo-400 mt-1">
                  {formatCurrency(summary.totalSpent)}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  de {formatCurrency(summary.totalBudget)}
                </p>
              </div>

              <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
                <p className="text-sm text-slate-500">Disponible</p>
                <p className={`text-2xl font-bold mt-1 ${
                  summary.totalRemaining >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatCurrency(summary.totalRemaining)}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {summary.totalRemaining >= 0 ? 'restante' : 'sobre presupuesto'}
                </p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
              <ProgressBar value={summary.totalSpent} max={summary.totalBudget} size="lg" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-200">Items de Gasto</h2>
                <Link to="/items" className="text-sm text-servo-400 hover:text-servo-300">
                  Ver todos →
                </Link>
              </div>

              {summary.items.length === 0 ? (
                <div className="bg-slate-900 rounded-xl p-8 border border-slate-800 text-center">
                  <p className="text-slate-500">No hay items de gasto</p>
                  <Link
                    to="/items"
                    className="text-servo-400 hover:text-servo-300 text-sm mt-2 inline-block"
                  >
                    Crear item
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {summary.items.slice(0, 5).map(item => (
                    <Link
                      key={item.id}
                      to="/expenses"
                      className="block bg-slate-900 rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-200">{item.name}</span>
                        <span className={`text-sm font-mono ${
                          item.remaining >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatCurrency(item.remaining)}
                        </span>
                      </div>
                      <ProgressBar value={item.spent} max={item.monthlyBudget} size="sm" showLabel={false} />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {expenses && expenses.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-200">Últimos Gastos</h2>
                  <Link to="/expenses" className="text-sm text-servo-400 hover:text-servo-300">
                    Ver todos →
                  </Link>
                </div>

                <div className="space-y-2">
                  {expenses.slice(0, 5).map(expense => (
                    <div
                      key={expense.id}
                      className="bg-slate-900 rounded-xl p-4 border border-slate-800"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-200">
                            {expense.description || expense.expenseItemName}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {expense.expenseItemName} • {new Date(expense.date).toLocaleDateString('es-CL')}
                          </p>
                        </div>
                        <span className="text-red-400 font-mono">
                          -{formatCurrency(expense.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-slate-900 rounded-xl p-8 border border-slate-800 text-center">
            <p className="text-slate-500">Error al cargar datos</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
