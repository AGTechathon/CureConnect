const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

app.use(cors({
    origin: function(origin, callback) {
        callback(null, true); // allow all origins
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['set-cookie']
}));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI);

app.use("/", (req, res, next) => {
    res.status(404).json({
        status: "fail",
        ok: false,
        message: "No such route founded in server...💣💣💣",
    });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT,() => console.log(`Server running on port ${PORT}`));