import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import projectsRouter from './routes/projects.js';
import tasksRouter from './routes/tasks.js';
import dependenciesRouter from './routes/dependencies.js';
import simulationRouter from './routes/simulation.js';
import analyticsRouter from './routes/analytics.js';
import demoRouter from './routes/demo.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
// Enable CORS for client
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
// Request logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (req.originalUrl.startsWith('/api')) {
            console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
        }
    });
    next();
});
// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'BlockerGraph AI Core Engine',
        timestamp: new Date().toISOString()
    });
});
// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/projects/:projectId/tasks', tasksRouter);
app.use('/api/projects/:projectId/dependencies', dependenciesRouter);
app.use('/api/projects/:projectId/simulate', simulationRouter);
app.use('/api/projects/:projectId/analytics', analyticsRouter);
app.use('/api/demo', demoRouter);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 BlockerGraph AI Server running on http://localhost:${PORT}`);
    console.log(`📊 Graph Engine & CPM Simulator initialized.`);
    console.log(`=======================================================`);
});
export default app;
