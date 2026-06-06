import { useState } from 'react';
import { expenseItemsApi, ExpenseItem } from '../services/api';
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

export function ExpenseItems() {
  const { data: items, loading, refetch } = useApi<ExpenseItem[]>(
    () => expenseItemsApi.getAll(),
    []
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');

  const { mutate: createItem, loading: creating } = useMutation(
    (data: { name: string; monthlyBudget: number }) => expenseItemsApi.create(data)
  );

  const { mutate: updateItem, loading: updating } = useMutation(
    (data: { id: string; name: string; monthlyBudget: number }) =>
      expenseItemsApi.update(data.id, { name: data.name, monthlyBudget: data.monthlyBudget })
  );

  const { mutate: deleteItem } = useMutation(
    (id: string) => expenseItemsApi.delete(id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const budgetNum = parseInt(budget.replace(/\D/g, ''), 10);

    if (!name || !budgetNum) return;

    if (editingItem) {
      await updateItem({ id: editingItem.id, name, monthlyBudget: budgetNum });
    } else {
      await createItem({ name, monthlyBudget: budgetNum });
    }

    setIsModalOpen(false);
    setEditingItem(null);
    setName('');
    setBudget('');
    refetch();
  };

  const handleEdit = (item: ExpenseItem) => {
    setEditingItem(item);
    setName(item.name);
    setBudget(item.monthlyBudget.toString());
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este item?')) {
      await deleteItem(id);
      refetch();
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setName('');
    setBudget('');
    setIsModalOpen(true);
  };

  return (
    <Layout>
      <div className="p-4 max-w-lg mx-auto space-y-6">
        <header className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Items de Gasto</h1>
            <p className="text-sm text-slate-500 mt-1">Define tus categorías y presupuestos</p>
          </div>
          <Button onClick={openCreateModal}>+ Nuevo</Button>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <span className="text-slate-500 animate-pulse">Cargando...</span>
          </div>
        ) : items && items.length > 0 ? (
          <div className="space-y-3">
            {items.map(item => (
              <div
                key={item.id}
                className="bg-slate-900 rounded-xl p-4 border border-slate-800"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-200">{item.name}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Presupuesto: {formatCurrency(item.monthlyBudget)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 rounded-xl p-8 border border-slate-800 text-center">
            <p className="text-slate-500">No hay items de gasto</p>
            <p className="text-sm text-slate-600 mt-1">
              Crea tu primer item para comenzar
            </p>
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingItem ? 'Editar Item' : 'Nuevo Item'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Nombre">
              <Input
                placeholder="Ej: Supermercado"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Presupuesto mensual">
              <Input
                type="number"
                placeholder="100000"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                required
                min="1"
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
                loading={creating || updating}
                className="flex-1"
              >
                {editingItem ? 'Guardar' : 'Crear'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
