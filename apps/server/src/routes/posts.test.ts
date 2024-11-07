import request from 'supertest';
import express from 'express';
import { postsRoutes } from './posts';
import { postRepository } from '../database';
import { authMiddleware, getSession } from '../lib';

jest.mock('../database', () => ({
  postRepository: {
    all: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../lib', () => ({
  authMiddleware: jest.fn(() => (req: any, res: any, next: any) => next()),
  getSession: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use('/posts', postsRoutes);

describe('Posts Router', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /posts', () => {
    it('should return all posts', async () => {
      const mockPosts = [{ id: '1', title: 'Test Post' }];
      (postRepository.all as jest.Mock).mockResolvedValue(mockPosts);

      const response = await request(app).get('/posts');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPosts);
    });
  });

  describe('GET /posts/:postId', () => {
    it('should return a post if found', async () => {
      const mockPost = { id: '1', title: 'Test Post' };
      (postRepository.find as jest.Mock).mockResolvedValue(mockPost);

      const response = await request(app).get('/posts/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPost);
    });

    it('should return 404 if post is not found', async () => {
      (postRepository.find as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/posts/2');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Post not found' });
    });
  });

  describe('POST /posts', () => {
    it('should create a new post if data is valid', async () => {
      const mockPost = { title: 'New Post', content: 'Content here' };
      const mockCreatedPost = { ...mockPost, id: '1' };
      const mockSession = { userId: '1' };
      
      (getSession as jest.Mock).mockResolvedValue(mockSession);
      (postRepository.create as jest.Mock).mockResolvedValue(mockCreatedPost);

      const response = await request(app)
        .post('/posts')
        .send(mockPost);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockCreatedPost);
    });

    it('should return 422 if data is invalid', async () => {
      const response = await request(app)
        .post('/posts')
        .send({ title: '' }); // Invalid data

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('PUT /posts/:postId', () => {
    it('should update a post if data is valid', async () => {
      const mockPost = { id: '1', title: 'Updated Post', content: 'Updated content' };
      (postRepository.find as jest.Mock).mockResolvedValue(mockPost);
      (postRepository.update as jest.Mock).mockResolvedValue(mockPost);

      const response = await request(app)
        .put('/posts/1')
        .send({ title: 'Updated Post', content: 'Updated content' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPost);
    });

    it('should return 404 if post to update is not found', async () => {
      (postRepository.find as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/posts/2')
        .send({ title: 'Non-existent Post' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Post not found' });
    });
  });

  describe('DELETE /posts/:postId', () => {
    it('should delete a post if found', async () => {
      (postRepository.delete as jest.Mock).mockResolvedValueOnce(undefined);

      const response = await request(app).delete('/posts/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Post deleted' });
    });

    it('should return 404 if post to delete is not found', async () => {
      (postRepository.delete as jest.Mock).mockRejectedValue(new Error('Post not found'));

      const response = await request(app).delete('/posts/2');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Post not found' });
    });
  });
});
