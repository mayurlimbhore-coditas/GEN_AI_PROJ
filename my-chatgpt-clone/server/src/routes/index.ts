import { Router } from 'express';
import chatRoutes from './chat.routes.js';

const router = Router();

// Health check endpoint
router.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Chat routes
router.use('/chat', chatRoutes);

export default router;

