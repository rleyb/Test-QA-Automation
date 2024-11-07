import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, Mock } from 'vitest';
import { useParams } from 'react-router-dom';
import PostFormWithData from './post-form-with-data';
import { useApiFetch } from '../hooks';
import '@testing-library/jest-dom';
import PostForm from './post-form';

// Mocks
vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
}));
vi.mock('../hooks', () => ({
  useApiFetch: vi.fn(),
}));
vi.mock('./post-form', () => ({
    default: vi.fn(() => <div>Post Form Component</div>),}));  

describe('PostFormWithData', () => {
  it('renders loading state initially', () => {
    (useParams as Mock).mockReturnValue({ postId: '1' });
    (useApiFetch as any).mockReturnValue({
      data: null,
      error: null,
      isLoading: true,
      get: vi.fn(),
    });

    render(<PostFormWithData />);
    expect(screen.getByText(/Loading post.../i)).toBeInTheDocument();
  });

  it('renders error state when there is an error', () => {
    (useParams as Mock).mockReturnValue({ postId: '1' });
    (useApiFetch as any).mockReturnValue({
      data: null,
      error: 'Error fetching post',
      isLoading: false,
      get: vi.fn(),
    });

    render(<PostFormWithData />);
    expect(screen.getByText(/Error fetching post/i)).toBeInTheDocument();
  });

  it('renders PostForm with post data when data is loaded', async () => {
    (useParams as Mock).mockReturnValue({ postId: '1' });
    const mockGet = vi.fn();
    (useApiFetch as any).mockReturnValue({
      data: {
        id: '1',
        title: 'Sample Post',
        content: 'This is a sample post content.',
        authorId: '123',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      error: null,
      isLoading: false,
      get: mockGet,
    });

    render(<PostFormWithData />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/posts/1');
    });
    expect(screen.getByText('Post Form Component')).toBeInTheDocument();
  });
});
