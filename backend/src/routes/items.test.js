const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const itemsRouter = require('./items');

// Mock fs.promises
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/items', itemsRouter);

// Error handling middleware for tests
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error'
  });
});

// Sample test data
const mockItems = [
  { id: 1, name: 'Test Item 1', category: 'Test', price: 100 },
  { id: 2, name: 'Test Item 2', category: 'Test', price: 200 },
  { id: 3, name: 'Another Item', category: 'Other', price: 300 }
];

describe('Items Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/items', () => {
    it('should return paginated items', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app)
        .get('/api/items')
        .expect(200);

      expect(response.body.items).toBeDefined();
      expect(response.body.pagination).toBeDefined();
      expect(response.body.items).toHaveLength(3);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.totalItems).toBe(3);
      expect(fs.readFile).toHaveBeenCalledTimes(1);
    });

    it('should filter items by search query', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app)
        .get('/api/items?q=test')
        .expect(200);

      expect(response.body.items).toHaveLength(2);
      expect(response.body.items[0].name).toBe('Test Item 1');
      expect(response.body.items[1].name).toBe('Test Item 2');
      expect(response.body.pagination.totalItems).toBe(2);
    });

    it('should limit results when limit is provided', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app)
        .get('/api/items?limit=2')
        .expect(200);

      expect(response.body.items).toHaveLength(2);
      expect(response.body.items[0].id).toBe(1);
      expect(response.body.items[1].id).toBe(2);
      expect(response.body.pagination.limit).toBe(2);
    });

    it('should combine search and limit', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app)
        .get('/api/items?q=item&limit=1')
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].name).toBe('Test Item 1');
      expect(response.body.pagination.totalItems).toBe(3); // 3 items match 'item'
    });

    it('should handle pagination correctly', async () => {
      const manyItems = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
        category: 'Test',
        price: 100 + i
      }));
      fs.readFile.mockResolvedValue(JSON.stringify(manyItems));

      const response = await request(app)
        .get('/api/items?page=2&limit=10')
        .expect(200);

      expect(response.body.items).toHaveLength(10);
      expect(response.body.items[0].id).toBe(11);
      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.hasNextPage).toBe(true);
      expect(response.body.pagination.hasPreviousPage).toBe(true);
    });

    it('should handle file read errors', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));

      const response = await request(app)
        .get('/api/items')
        .expect(500);
    });
  });

  describe('GET /api/items/:id', () => {
    it('should return a specific item by id', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app)
        .get('/api/items/2')
        .expect(200);

      expect(response.body).toEqual(mockItems[1]);
    });

    it('should return 404 for non-existent item', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app)
        .get('/api/items/999')
        .expect(404);

      expect(response.body.error).toBe('Item not found');
    });

    it('should handle invalid id format', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app)
        .get('/api/items/invalid')
        .expect(404);
    });

    it('should handle file read errors', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));

      const response = await request(app)
        .get('/api/items/1')
        .expect(500);
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item', async () => {
      const newItem = { name: 'New Item', category: 'New', price: 150 };
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.writeFile.mockResolvedValue();

      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .expect(201);

      expect(response.body).toMatchObject(newItem);
      expect(response.body.id).toBeDefined();
      expect(fs.writeFile).toHaveBeenCalledTimes(1);
    });

    it('should handle empty request body', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.writeFile.mockResolvedValue();

      const response = await request(app)
        .post('/api/items')
        .send({})
        .expect(201);

      expect(response.body.id).toBeDefined();
    });

    it('should handle file read errors', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));

      const response = await request(app)
        .post('/api/items')
        .send({ name: 'Test' })
        .expect(500);
    });

    it('should handle file write errors', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.writeFile.mockRejectedValue(new Error('Write failed'));

      const response = await request(app)
        .post('/api/items')
        .send({ name: 'Test' })
        .expect(500);
    });
  });
});