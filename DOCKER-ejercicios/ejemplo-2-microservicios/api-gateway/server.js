const express = require('express');
const axios = require('axios');
const redis = require('redis');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 4000;

// Configuración de Redis
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
});

redisClient.on('error', (err) => console.error('Redis Error:', err));
redisClient.connect();

// Middleware
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 requests por ventana
    message: 'Demasiadas peticiones desde esta IP'
});
app.use(limiter);

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// URLs de servicios
const SERVICES = {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
    users: process.env.USERS_SERVICE_URL || 'http://localhost:4002',
    products: process.env.PRODUCTS_SERVICE_URL || 'http://localhost:4003'
};

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Middleware de autenticación
async function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    try {
        const response = await axios.post(`${SERVICES.auth}/verify`, { token });
        req.user = response.data.user;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Token inválido' });
    }
}

// Rutas de autenticación
app.post('/api/auth/login', async (req, res) => {
    try {
        const response = await axios.post(`${SERVICES.auth}/login`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.error || 'Error en autenticación'
        });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const response = await axios.post(`${SERVICES.auth}/register`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.error || 'Error en registro'
        });
    }
});

// Rutas de usuarios (protegidas)
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        // Intentar obtener de caché
        const cacheKey = 'users:all';
        const cached = await redisClient.get(cacheKey);

        if (cached) {
            return res.json(JSON.parse(cached));
        }

        const response = await axios.get(`${SERVICES.users}/users`);

        // Guardar en caché por 5 minutos
        await redisClient.setEx(cacheKey, 300, JSON.stringify(response.data));

        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.error || 'Error obteniendo usuarios'
        });
    }
});

app.get('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        const response = await axios.get(`${SERVICES.users}/users/${req.params.id}`);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.error || 'Error obteniendo usuario'
        });
    }
});

// Rutas de productos (protegidas)
app.get('/api/products', authenticateToken, async (req, res) => {
    try {
        const cacheKey = 'products:all';
        const cached = await redisClient.get(cacheKey);

        if (cached) {
            return res.json(JSON.parse(cached));
        }

        const response = await axios.get(`${SERVICES.products}/products`);
        await redisClient.setEx(cacheKey, 300, JSON.stringify(response.data));

        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.error || 'Error obteniendo productos'
        });
    }
});

app.post('/api/products', authenticateToken, async (req, res) => {
    try {
        const response = await axios.post(`${SERVICES.products}/products`, req.body);

        // Invalidar caché
        await redisClient.del('products:all');

        res.status(201).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.error || 'Error creando producto'
        });
    }
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API Gateway corriendo en puerto ${PORT}`);
});
