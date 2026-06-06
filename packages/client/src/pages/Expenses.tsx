import { useState } from 'react';
import { expensesApi, expenseItemsApi, Expense, ExpenseItem } from '../services/api';
import { useApi, useMutation } from '../hooks/useApi';
import { Layout } from '../components/Layout';
import { Modal, FormField, Input, Button } from '../components/FormComponents';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(amount);
}

export function Expenses() {
  const { data: expenses, loading, refetch } = useApi<Expense[]>(
    () => expensesApi.getAll(),
    []
  );

  const { data: items } = useApi<ExpenseItem[]>(
    () => expenseItemsApi.getAll(),
    []
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');

  const { mutate: createExpense, loading: creating } = useMutation(
    (data: { amount: number; description?: string; expenseItemId: string }) =>
      expensesApi.create(data)
  );

  const { mutate: deleteExpense } = useMutation(
    (id: string) => expensesApi.delete(id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(amount.replace(/\D/g, ''), 10);

    if (!amountNum || !selectedItemId) return;

    await createExpense({
      amount: amountNum,
      description: description || undefined,
      expenseItemId: selectedItemId
    });

    setIsModalOpen(false);
    setAmount('');
    setDescription('');
    setSelectedItemId('');
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este gasto?')) {
      await deleteExpense(id);
      refetch();
    }
  };

  const groupedExpenses = expenses?.reduce((acc, expense) => {
    const date = new Date(expense.date).toLocaleDateString('es-CL');
    if (!acc[date]) acc[date] = [];
    acc[date].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);

  return (
    <Layout>
      <div className="p-4 max-w-lg mx-auto space-y-6">
        <header className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Gastos</h1>
            <p className="text-sm text-slate-500 mt-1">Registra tus gastos del mes</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>+ Nuevo</Button>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <span className="text-slate-500 animate-pulse">Cargando...</span>
          </div>
        ) : expenses && expenses.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedExpenses || {}).map(([date, dayExpenses]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-slate-500 mb-2">{date}</h3>
                <div className="space-y-2">
                  {dayExpenses.map(expense => (
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
                            {expense.expenseItemName}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-red-400 font-mono">
                            -{formatCurrency(expense.amount)}
                          </span>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="text-slate-500 hover:text-red-400 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 rounded-xl p-8 border border-slate-800 text-center">
            <p className="text-slate-500">No hay gastos este mes</p>
            <p className="text-sm text-slate-600 mt-1">
              Registra tu primer gasto
            </p>
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Nuevo Gasto"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Item de gasto">
              <select
                value={selectedItemId}
                onChange={e => setSelectedItemId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-servo-500"
                required
              >
                <option value="">Seleccionar item</option>
                {items?.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Monto">
              <Input
                type="number"
                placeholder="25000"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                min="1"
              />
            </FormField>

            <FormField label="Descripción (opcional)">
              <Input
                placeholder="Ej: Compra semanal"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </FormField>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={creating}
                className="flex-1"
              >
                Registrar
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
