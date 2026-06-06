import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { AddExpenseProvider } from '../components/AddExpenseModal';

function renderLayout(children: React.ReactNode) {
  return render(
    <BrowserRouter>
      <AddExpenseProvider>
        <Layout>{children}</Layout>
      </AddExpenseProvider>
    </BrowserRouter>
  );
}

describe('Layout', () => {
  it('renders children', () => {
    renderLayout(<div>Test Content</div>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderLayout(<div>Content</div>);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Items')).toBeInTheDocument();
    expect(screen.getByText('Reportes')).toBeInTheDocument();
    expect(screen.getByText('Config')).toBeInTheDocument();
  });

  it('renders add expense button', () => {
    renderLayout(<div>Content</div>);
    expect(screen.getByLabelText('Agregar gasto')).toBeInTheDocument();
  });
});
