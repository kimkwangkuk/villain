import { render, screen } from '@testing-library/react';
import App from './App';

test('renders villain project title', () => {
  render(<App />);
  const titleElement = screen.getByText(/빌런 스토리/i);
  expect(titleElement).toBeInTheDocument();
});
