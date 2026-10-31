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

// CORS configuration supporting local Vite, production Vercel domains, and credentials
const corsOriginEnv = process.env.CORS_ORIGIN || process.env.FRONTEND_URL;
const allowedOrigins = corsOriginEnv
  ? corsOriginEnv.split(',').map((o) => o.trim()).filter(Boolean)
  : null;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, health checks, server-to-server)
      if (!origin) return callback(null, true);

      // If explicit origins are configured, validate against them
      if (allowedOrigins && allowedOrigins.length > 0) {
        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        // Allow Vercel preview deployments if main Vercel origin is allowed
        if (origin.endsWith('.vercel.app') && allowedOrigins.some((o) => o.includes('.vercel.app'))) {
          return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
      }

      // Default: dynamically allow the requesting origin so credentials & Vercel work seamlessly
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

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
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[SERVER ERROR]:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 BlockerGraph AI Server running on http://localhost:${PORT}`);
    console.log(`📊 Graph Engine & CPM Simulator initialized.`);
    console.log(`=======================================================`);
  });
}

export default app;
