import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { 
  createPost, 
  getPosts, 
  addComment, 
  getCommentsByPost 
} from '../controllers/forum.controller';

const router = Router();

// Public routes
router.get('/posts', getPosts);
router.get('/posts/:postId/comments', getCommentsByPost);

// Protected routes
router.post('/posts', authenticate, createPost);
router.post('/posts/:postId/comments', authenticate, addComment);

export default router;
