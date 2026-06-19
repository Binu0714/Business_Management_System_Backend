import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import repRoutes from './routes/repRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/reps', repRoutes);
app.use('/api/suppliers', supplierRoutes);

app.get('/api/health', (req, res) => {
  res.json({ message: "BMS Backend is Live" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));