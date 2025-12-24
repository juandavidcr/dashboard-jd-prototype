import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login card', () => {
  render(<App />);
  const titleElement = screen.getByText(/Iniciar sesión/i);
  expect(titleElement).toBeInTheDocument();
});
