import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Profile from './profile';
import { useApiFetch } from '../hooks';
import { Book } from '../components/book-search';
import '@testing-library/jest-dom';


// Definición del tipo ExtendedUser localmente
type ExtendedUser = {
  id: string;
  username: string;
  favoriteBook?: {
    title: string;
    author_name?: string[];
  };
};

// Mocks
vi.mock('../hooks', () => ({
  useApiFetch: vi.fn(),
}));

describe('Profile', () => {
  it('renders loading state initially', () => {
    (useApiFetch as any).mockReturnValue({
      data: null,
      error: null,
      isLoading: true,
      get: vi.fn(),
      put: vi.fn(),
    });

    render(<Profile />);
    expect(screen.getByText(/Loading profile.../i)).toBeInTheDocument();
  });

  it('renders error state when there is an error', () => {
    (useApiFetch as any).mockReturnValue({
      data: null,
      error: true,
      isLoading: false,
      get: vi.fn(),
      put: vi.fn(),
    });

    render(<Profile />);
    expect(screen.getByText(/Error loading profile/i)).toBeInTheDocument();
  });

  it('displays user information when data is loaded', async () => {
    (useApiFetch as any).mockReturnValue({
      data: {
        id: '123',
        username: 'TestUser',
        favoriteBook: {
          title: 'The Great Gatsby',
          author_name: ['F. Scott Fitzgerald'],
        },
      } as ExtendedUser,
      error: null,
      isLoading: false,
      get: vi.fn(),
      put: vi.fn(),
    });

    render(<Profile />);

    expect(screen.getByText('TestUser')).toBeInTheDocument();
    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByText('by F. Scott Fitzgerald')).toBeInTheDocument();
  });

  it('allows editing favorite book', async () => {
    const putMock = vi.fn();
    const getMock = vi.fn();

    (useApiFetch as any).mockReturnValue({
      data: {
        id: '123',
        username: 'TestUser',
        favoriteBook: {
          title: 'The Great Gatsby',
          author_name: ['F. Scott Fitzgerald'],
        },
      } as ExtendedUser,
      error: null,
      isLoading: false,
      get: getMock,
      put: putMock,
    });

    render(<Profile />);
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    // Simula la selección de un nuevo libro
    const newBook: Book = { key: '12A' , title: '1984', author_name: ['George Orwell'] };
    await waitFor(() => {
      putMock.mockResolvedValueOnce(newBook);
      fireEvent.click(screen.getByText('1984'));
    });

    expect(putMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ favoriteBook: newBook })
    );
    expect(getMock).toHaveBeenCalled();
  });
});
