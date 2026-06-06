import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProgressBar } from '../components/ProgressBar';

describe('ProgressBar', () => {
  it('renders with correct percentage', () => {
    render(<ProgressBar value={50} max={100} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('shows over budget message when value exceeds max', () => {
    render(<ProgressBar value={120} max={100} />);
    expect(screen.getByText('Sobre presupuesto')).toBeInTheDocument();
  });

  it('hides label when showLabel is false', () => {
    render(<ProgressBar value={50} max={100} showLabel={false} />);
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });
});
