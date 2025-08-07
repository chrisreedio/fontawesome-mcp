import request from 'supertest';
import app from '../src/server';

describe('HTTP Server', () => {
    test('should return health status', async () => {
        const response = await request(app)
            .get('/health')
            .expect(200);

        expect(response.body).toHaveProperty('status', 'healthy');
        expect(response.body).toHaveProperty('timestamp');
    });

    test('should perform fuzzy search via API', async () => {
        const response = await request(app)
            .post('/api/search')
            .send({ query: 'home', limit: 3 })
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body.length).toBeLessThanOrEqual(3);

        // Verify result structure
        const firstResult = response.body[0];
        expect(firstResult).toHaveProperty('name');
        expect(firstResult).toHaveProperty('style');
        expect(firstResult).toHaveProperty('label');
    });

    test('should get specific icon via API', async () => {
        const response = await request(app)
            .post('/api/icon')
            .send({ name: 'house', style: 'solid' })
            .expect(200);

        expect(response.body).toHaveProperty('name', 'house');
        expect(response.body).toHaveProperty('style', 'solid');
        expect(response.body).toHaveProperty('svg');
        expect(response.body.svg).toContain('<svg');
        expect(response.body.svg).toContain('</svg>');
    });

    test('should handle invalid search parameters', async () => {
        const response = await request(app)
            .post('/api/search')
            .send({}) // Missing query parameter
            .expect(400);

        expect(response.body).toHaveProperty('error');
    });

    test('should handle invalid icon parameters', async () => {
        const response = await request(app)
            .post('/api/icon')
            .send({ name: 'house' }) // Missing style parameter
            .expect(400);

        expect(response.body).toHaveProperty('error');
    });

    test('should return SVG directly', async () => {
        const response = await request(app)
            .get('/svg/solid/house.svg')
            .expect(200);

        expect(response.headers['content-type']).toBe('image/svg+xml; charset=utf-8');
        const svgText = response.text ?? (Buffer.isBuffer(response.body) ? response.body.toString('utf8') : String(response.body));
        expect(svgText).toContain('<svg');
        expect(svgText).toContain('</svg>');
    });

    test('should handle MCP tools/list via RPC', async () => {
        const response = await request(app)
            .post('/rpc')
            .send({
                jsonrpc: '2.0',
                id: 1,
                method: 'tools/list',
                params: {}
            })
            .expect(200);

        expect(response.body).toHaveProperty('jsonrpc', '2.0');
        expect(response.body).toHaveProperty('id', 1);
        expect(response.body).toHaveProperty('result');
        expect(response.body.result).toHaveProperty('tools');
        expect(response.body.result.tools).toHaveLength(2);
    });

    test('should handle MCP tool call via RPC', async () => {
        const response = await request(app)
            .post('/rpc')
            .send({
                jsonrpc: '2.0',
                id: 2,
                method: 'tools/call',
                params: {
                    name: 'fuzzySearch',
                    arguments: {
                        query: 'home',
                        limit: 2
                    }
                }
            })
            .expect(200);

        expect(response.body).toHaveProperty('jsonrpc', '2.0');
        expect(response.body).toHaveProperty('id', 2);
        expect(response.body).toHaveProperty('result');
        expect(response.body.result).toHaveProperty('content');

        const searchResults = JSON.parse(response.body.result.content[0].text);
        expect(Array.isArray(searchResults)).toBe(true);
        expect(searchResults.length).toBeGreaterThan(0);
        expect(searchResults.length).toBeLessThanOrEqual(2);
    });
});