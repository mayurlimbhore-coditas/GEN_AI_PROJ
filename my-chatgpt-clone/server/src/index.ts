import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/index.js';

const app = express();

// CORS configuration
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'ChatGPT Clone API Server',
    status: 'running',
    endpoints: {
      health: 'GET /api/health',
      chat: 'POST /api/chat',
      stream: 'POST /api/chat/stream',
    },
  });
});

// API routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Frontend URL: ${config.frontendUrl}`);
  
  if (!config.openaiApiKey) {
    console.warn('⚠️  Warning: OPENAI_API_KEY is not set!');
  }
});

export default app;

