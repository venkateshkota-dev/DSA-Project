"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const booking_1 = __importDefault(require("./routes/booking"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Enable CORS so client running on Vite (usually port 5173) can talk to server (port 5000)
app.use((0, cors_1.default)({
    origin: '*', // For development, allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Routes
app.use('/api', booking_1.default);
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
