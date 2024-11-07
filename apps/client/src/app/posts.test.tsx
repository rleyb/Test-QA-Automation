import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Posts from './Posts';
import { useApiFetch } from '../hooks';
import { Post } from '@qa-assessment/shared';
import '@testing-library/jest-dom';

// Mocks
vi.mock('../hooks', () => ({
  useApiFetch: vi.fn(),
}));

describe('Posts', () => {
  it('renders loading state initially', () => {
    (useApiFetch as any).mockReturnValue({
      data: null,
      error: null,
      isLoading: true,
      get: vi.fn(),
      delete: vi.fn(),
    });

    render(<Posts />);
    expect(screen.getByText(/Loading posts.../i)).toBeInTheDocument();
  });

  it('renders error state when there is an error', () => {
    (useApiFetch as any).mockReturnValue({
      data: null,
      error: true,
      isLoading: false,
      get: vi.fn(),
      delete: vi.fn(),
    });

    render(<Posts />);
    expect(screen.getByText(/Error loading posts/i)).toBeInTheDocument();
  });

  it('renders posts when data is loaded', async () => {
    const postsMock: Post[] = [
      {
        id: '1',
        title: 'Post 1',
        content: 'This is the first post.',
        authorId: '123',
        createdAt: new Date('2024-11-07T00:00:00Z'),
        updatedAt: new Date('2024-11-07T00:00:00Z'),
      },
      {
        id: '2',
        title: 'Post 2',
        content: 'This is the second post.',
        authorId: '124',
        createdAt: new Date('2024-11-07T00:00:00Z'),
        updatedAt: new Date('2024-11-07T00:00:00Z'),
      },
    ];

    const usersMock = {
      '123': {
        id: '123',
        username: 'User 1',
        favoriteBook: {
          title: '1984',
          author_name: ['George Orwell'],
        },
      },
      '124': {
        id: '124',
        username: 'User 2',
        favoriteBook: {
          title: 'Brave New World',
          author_name: ['Aldous Huxley'],
        },
      },
    };

    (useApiFetch as any).mockReturnValueOnce({
      data: postsMock,
      error: null,
      isLoading: false,
      get: vi.fn(),
      delete: vi.fn(),
    });

    (useApiFetch as any).mockReturnValueOnce({
      data: usersMock,
      error: null,
      isLoading: false,
      get: vi.fn(),
      delete: vi.fn(),
    });

    render(<Posts />);

    // Verifica que los posts se rendericen correctamente
    await waitFor(() => {
      expect(screen.getByText('Post 1')).toBeInTheDocument();
      expect(screen.getByText('Post 2')).toBeInTheDocument();
      expect(screen.getByText('by George Orwell')).toBeInTheDocument();
      expect(screen.getByText('by Aldous Huxley')).toBeInTheDocument();
    });
  });

  it('handles post deletion correctly', async () => {
    const postsMock: Post[] = [
      {
        id: '1',
        title: 'Post 1',
        content: 'This is the first post.',
        authorId: '123',
        createdAt: new Date('2024-11-07T00:00:00Z'),
        updatedAt: new Date('2024-11-07T00:00:00Z'),
      },
    ];

    const usersMock = {
      '123': {
        id: '123',
        username: 'User 1',
        favoriteBook: {
          title: '1984',
          author_name: ['George Orwell'],
        },
      },
    };

    const deleteMock = vi.fn();

    (useApiFetch as any).mockReturnValueOnce({
      data: postsMock,
      error: null,
      isLoading: false,
      get: vi.fn(),
      delete: deleteMock,
    });

    (useApiFetch as any).mockReturnValueOnce({
      data: usersMock,
      error: null,
      isLoading: false,
      get: vi.fn(),
      delete: vi.fn(),
    });

    render(<Posts />);

    // Simula el clic en el botón de eliminar
    fireEvent.click(screen.getByRole('button', { name: /Delete/i }));

    // Verifica que la función deletePost haya sido llamada
    await waitFor(() => {
      expect(deleteMock).toHaveBeenCalledWith('api/posts/1');
    });
  });
});
