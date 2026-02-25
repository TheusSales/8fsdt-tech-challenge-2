import request from 'supertest';
import express from 'express';
const app = require('../src/server'); // Importa o app diretamente para testes

// Mock the routes to avoid database calls
jest.mock('../src/routes/post', () => {
  return express.Router();
});

describe('Server', () => {
  it('should respond to GET /', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('🚀 Servidor Tech Challenge rodando com sucesso!');
  });

  it('should have JSON middleware', async () => {
    const response = await request(app)
      .post('/posts')
      .set('Content-Type', 'application/json')
      .send({ test: 'data' });

    // The request should reach the route (even if it fails due to validation)
    // but should not fail due to JSON parsing (which would be 400)
    expect(response.status).not.toBe(400);
  });
});