import { Routes, Route } from 'react-router-dom';
import { AddExpenseProvider } from './components/AddExpenseModal';
import { Dashboard } from './pages/Dashboard';
import { ExpenseItems } from './pages/ExpenseItems';
import { Expenses } from './pages/Expenses';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

function App() {
  return (
    <AddExpenseProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/items" element={<ExpenseItems />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </AddExpenseProvider>
  );
}

export default App;
