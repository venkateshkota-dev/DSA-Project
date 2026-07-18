import express from 'express';
import cors from 'cors';
import bookingRouter from './routes/booking';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so client running on Vite (usually port 5173) can talk to server (port 5000)
app.use(cors({
  origin: '*', // For development, allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api', bookingRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date() });
});

app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(` CineBook Backend Running on Port ${PORT} `);
  console.log(` API Endpoint: http://localhost:${PORT}/api `);
  console.log(`========================================`);
});
