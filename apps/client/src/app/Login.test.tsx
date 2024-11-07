import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, Mock } from 'vitest';
import { useNavigate } from 'react-router-dom';
import Login from './Login';
import { useFetch, useStorage } from '../hooks';
import '@testing-library/jest-dom';

// Mock de dependencias
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    actual,
    useNavigate: vi.fn(),
  };
});

vi.mock('../hooks', () => ({
  useFetch: vi.fn(() => ({
    fetch: vi.fn(),
    isLoading: false,
    error: null,
  })),
  useStorage: vi.fn().mockReturnValue({ set: vi.fn() }),
}));

describe('Login Component', () => {
  it('renders the form initially with empty fields', () => {
    render(<Login />);
    
    expect(screen.getByPlaceholderText(/Username/i)).toHaveValue('');
    expect(screen.getByPlaceholderText(/Password/i)).toHaveValue('');
    expect(screen.getByText(/Sign in/i)).toBeInTheDocument();
  });

  it('shows loading state when submitting form', async () => {
    const mockNavigate = vi.fn();
    const mockFetch = vi.fn().mockResolvedValue({});
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    (useFetch as Mock).mockReturnValue({
      fetch: mockFetch,
      isLoading: true,
      error: null,
    });

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/Username/i), {
      target: { value: 'user123' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByText(/Sign in/i));

    expect(screen.getByText(/Signing in.../i)).toBeInTheDocument();
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it('displays error message when login fails', async () => {
    const mockNavigate = vi.fn();
    const mockFetch = vi.fn().mockResolvedValue({ error: 'Invalid credentials' });
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    (useFetch as Mock).mockReturnValue({
      fetch: mockFetch,
      isLoading: false,
      error: 'Invalid credentials',
    });

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/Username/i), {
      target: { value: 'user123' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByText(/Sign in/i));

    expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
  });

  it('navigates to /posts on successful login', async () => {
    const mockNavigate = vi.fn();
    const mockFetch = vi.fn().mockResolvedValue({
      data: { sessionId: 'abc123' },
    });
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    (useFetch as Mock).mockReturnValue({
      fetch: mockFetch,
      isLoading: false,
      error: null,
    });

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/Username/i), {
      target: { value: 'user123' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByText(/Sign in/i));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/posts');
    });
  });
});
