import request from 'supertest';
import express from 'express';
import { Router } from 'express';
import { userRepository, sessionRepository } from '../database';

// Mock de los repositorios
jest.mock('../database', () => ({
  userRepository: {
    find: jest.fn(),
    update: jest.fn(),
    register: jest.fn(),
  },
  sessionRepository: {
    create: jest.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use('/users', Router); 

describe('Users Router', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users/:userId', () => {
    it('should return user data if user exists', async () => {
      // Mock de usuario
      const mockUser = { id: '1', favoriteBook: JSON.stringify({ title: '1984', author: 'George Orwell' }) };
      (userRepository.find as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).get('/users/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: '1',
        favoriteBook: { title: '1984', author: 'George Orwell' },
      });
    });

    it('should return 404 if user is not found', async () => {
      (userRepository.find as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/users/2');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'User not found' });
    });
  });

  describe('PUT /users/:userId', () => {
    it('should update user if data is valid', async () => {
      const mockUser = { id: '1', favoriteBook: JSON.stringify({ title: '1984', author: 'George Orwell' }) };
      (userRepository.find as jest.Mock).mockResolvedValue(mockUser);
      (userRepository.update as jest.Mock).mockResolvedValue({
        id: '1',
        favoriteBook: JSON.stringify({ title: 'Brave New World', author: 'Aldous Huxley' }),
      });

      const response = await request(app)
        .put('/users/1')
        .send({ favoriteBook: { title: 'Brave New World', author: 'Aldous Huxley' } });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: '1',
        favoriteBook: { title: 'Brave New World', author: 'Aldous Huxley' },
      });
    });

    it('should return 422 if data is invalid', async () => {
      const response = await request(app)
        .put('/users/1')
        .send({ favoriteBook: 'Invalid Data' });

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /users', () => {
    it('should register a new user and create a session', async () => {
      const mockUser = { id: '1', username: 'newuser' };
      const mockSession = { token: 'abcdef123456' };

      (userRepository.register as jest.Mock).mockResolvedValue(mockUser);
      (sessionRepository.create as jest.Mock).mockResolvedValue(mockSession);

      const response = await request(app)
        .post('/users')
        .send({ username: 'newuser', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSession);
    });

    it('should return 422 if registration data is invalid', async () => {
      const response = await request(app)
        .post('/users')
        .send({ username: 'newuser' }); // Missing password

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('errors');
    });
  });
});
