import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import healthRoutes from './routes/health.js';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api', healthRoutes);

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
