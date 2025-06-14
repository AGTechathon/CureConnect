const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-forwarded-proto'],
    exposedHeaders: ['set-cookie'],
    optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI);

// Routes
const user = require('./routes/userRoute');
app.use("/api/v1", user);

// 404 handler
app.use("/", (req, res, next) => {
    res.status(404).json({
        status: "fail",
        ok: false,
        message: "No such route founded in server...💣💣💣",
    });
});

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT,() => console.log(`Server running on port ${PORT}`));