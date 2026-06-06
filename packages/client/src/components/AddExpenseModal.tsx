import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { expensesApi, expenseItemsApi, ExpenseItem } from '../services/api';
import { useApi, useMutation } from '../hooks/useApi';
import { Modal, FormField, Input, Button } from './FormComponents';

interface AddExpenseContextType {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const AddExpenseContext = createContext<AddExpenseContextType>({
  open: () => {},
  close: () => {},
  isOpen: false
});

export function useAddExpense() {
  return useContext(AddExpenseContext);
}

export function AddExpenseProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <AddExpenseContext.Provider value={{ open, close, isOpen }}>
      {children}
      <AddExpenseModal isOpen={isOpen} onClose={close} />
    </AddExpenseContext.Provider>
  );
}

function AddExpenseModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { data: items, refetch: refetchItems } = useApi<ExpenseItem[]>(
    () => expenseItemsApi.getAll(),
    []
  );

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');

  const { mutate: createExpense, loading: creating } = useMutation(
    (data: { amount: number; description?: string; expenseItemId: string }) =>
      expensesApi.create(data)
  );

  useEffect(() => {
    if (isOpen) {
      refetchItems();
    }
  }, [isOpen, refetchItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(amount.replace(/\D/g, ''), 10);

    if (!amountNum || !selectedItemId) return;

    await createExpense({
      amount: amountNum,
      description: description || undefined,
      expenseItemId: selectedItemId
    });

    setAmount('');
    setDescription('');
    setSelectedItemId('');
    onClose();
    window.location.reload();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Gasto">
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

        <FormField label="Descripcion (opcional)">
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
            onClick={onClose}
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
  );
}
