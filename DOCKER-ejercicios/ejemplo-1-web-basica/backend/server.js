const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'appuser',
    password: process.env.DB_PASSWORD || 'securepassword',
    database: process.env.DB_NAME || 'appdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;

// Inicializar pool de conexiones
async function initDatabase() {
    try {
        pool = mysql.createPool(dbConfig);
        console.log('✅ Conexión a MySQL establecida');
    } catch (error) {
        console.error('❌ Error conectando a MySQL:', error);
        process.exit(1);
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Endpoint para obtener usuarios
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, email, created_at FROM users');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({ success: false, error: 'Error al obtener usuarios' });
    }
});

// Endpoint para crear usuario
app.post('/api/users', async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ success: false, error: 'Nombre y email son requeridos' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO users (name, email) VALUES (?, ?)',
            [name, email]
        );
        res.status(201).json({
            success: true,
            data: { id: result.insertId, name, email }
        });
    } catch (error) {
        console.error('Error creando usuario:', error);
        res.status(500).json({ success: false, error: 'Error al crear usuario' });
    }
});

// Endpoint para obtener estadísticas
app.get('/api/stats', async (req, res) => {
    try {
        const [countResult] = await pool.query('SELECT COUNT(*) as total FROM users');
        const [recentResult] = await pool.query(
            'SELECT COUNT(*) as recent FROM users WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)'
        );

        res.json({
            success: true,
            data: {
                totalUsers: countResult[0].total,
                recentUsers: recentResult[0].recent
            }
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
    }
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
});

// Iniciar servidor
async function startServer() {
    await initDatabase();

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

// Manejo de señales de terminación
process.on('SIGTERM', async () => {
    console.log('SIGTERM recibido, cerrando servidor...');
    if (pool) await pool.end();
    process.exit(0);
});

startServer();
