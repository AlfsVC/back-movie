import express from 'express';
import { sendMessage, getMessages } from '../controllers/messageController.js';

const router = express.Router();

router.post('/', sendMessage);
router.get('/:matchId', getMessages);
router.get('/friend/:friendId', getMessages);

export default router;
