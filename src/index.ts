import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import rentalRoutes from './routes/rental.routes';
import produceRoutes from './routes/produce.routes';
import orderRoutes from './routes/order.routes';
import forumRoutes from './routes/forum.routes';
import plantRoutes from './routes/plant.routes';
import { sendResponse } from './utils/response';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiting for sensitive routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/produce', produceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/plants', plantRoutes);

// Root route
app.get('/', (req, res) => {
  sendResponse(res, 200, true, 'Urban Farm API is running');
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  sendResponse(res, 500, false, 'Internal Server Error', null, err.message);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;