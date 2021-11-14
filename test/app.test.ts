import request from 'supertest';
import app from '../src/app';

describe('Test the root path', () => {
  test('It should respond with only headers', async () => {
    const response = await request(app).get(
      '/?headers={"content-type": "application/json", "a": "a"}'
    );
    expect(response.headers['content-type']).toBe('application/json');
    expect(response.headers['a']).toBe('a');
  });
  test('It should respond with only headers and body', async () => {
    const response = await request(app).get(
      '/?headers={"Content-Type": "application/json"}&body={"type": "text", "data": {"name": "echo-server", "author": "yoshipi"}}'
    );
    expect(response.headers['content-type']).toBe('application/json');
    expect(response.body.name).toBe('echo-server');
  });
});
