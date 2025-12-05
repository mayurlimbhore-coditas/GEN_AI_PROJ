import { Router } from 'express';
import { chatController } from '../controllers/chat.controller.js';

const router = Router();

// POST /api/chat - Non-streaming chat completion
router.post('/', chatController.chat);

// POST /api/chat/stream - Streaming chat completion
router.post('/stream', chatController.chatStream);

export default router;

