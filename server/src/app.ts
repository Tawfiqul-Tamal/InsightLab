import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import { healthRouter } from './routes/health';
import { handleAnalyze } from './routes/analyze';
import { handleTrain } from './routes/train';

export const app = express();

// CORS configuration
const clientUrl = process.env.CLIENT_URL;
app.use(
  cors({
    origin: clientUrl && clientUrl !== '*' ? clientUrl : '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer memory storage with 4MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 4 * 1024 * 1024, // 4MB
  },
});

// Root & Health check
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'InsightLab API is running', health: '/api/health' });
});
app.use('/api', healthRouter);
app.use('/', healthRouter);

// API Endpoints with Multer file upload
app.post('/api/analyze', upload.single('file'), handleAnalyze);
app.post('/analyze', upload.single('file'), handleAnalyze);

app.post('/api/train', upload.single('file'), handleTrain);
app.post('/train', upload.single('file'), handleTrain);

// Global Error Handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'File size exceeds 4MB limit' });
      return;
    }
    res.status(400).json({ error: `File upload error: ${err.message}` });
    return;
  }

  const message = err instanceof Error ? err.message : 'Internal Server Error';
  res.status(500).json({ error: message });
});
