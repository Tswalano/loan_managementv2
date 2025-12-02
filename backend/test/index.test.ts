const request = require('supertest');

const API_URL = 'https://8bp49x30ql.execute-api.af-south-1.amazonaws.com/prod/'; // Replace with your actual API Gateway URL

describe('API Endpoints', () => {
    let accessToken: string;

    it('should login successfully with valid credentials', async () => {
        const response = await request(API_URL)
            .post('/login')
            .send({ email: 'moganegb@gmail.com', password: 'Tswalano@42' });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Login successful');
        expect(response.body).toHaveProperty('token');
        accessToken = response.body.token;
    });

    it('should fail login with invalid credentials', async () => {
        const response = await request(API_URL)
            .post('/login')
            .send({ email: 'test@example.com', password: 'wrongpassword' });
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
    });

    it('should fail logout without access token', async () => {
        const response = await request(API_URL).post('/logout');
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
    });

    it('should access protected route with valid token', async () => {
        const response = await request(API_URL)
            .get('/protected')
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Protected route');
        expect(response.body).toHaveProperty('user');
    });

    it('should fail to access protected route without token', async () => {
        const response = await request(API_URL).get('/protected');
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
    });
});