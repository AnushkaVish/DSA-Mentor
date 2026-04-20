
const express = require('express');
const app = express();
require('dotenv').config();

// Trust proxy for secure cookies on Render
app.set('trust proxy', 1);

const main = require('./config/db');
const redisClient  = require('./config/redis');

const cookieParser = require('cookie-parser');
const authRouter = require('./routes/userAuth');
const problemRouter = require('./routes/problemCreator');
const submitRouter = require('./routes/submit');
const cors = require('cors');
const aiRouter = require('./routes/aiChatting');
const videoRouter = require('./routes/videoCreator');
const interviewRoutes = require('./routes/interviewRoutes');
const contestRoutes = require("./routes/contestRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const courseProgressRoutes = require("./routes/courseProgressRoutes");

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        } else {
            // For localhost and other origins not in the list, allow them during development
            return callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cookie']
}));

app.use(express.json());
app.use(cookieParser());


// Routes
app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);
app.use('/ai',aiRouter);
app.use('/video',videoRouter);
// API routes
app.use('/api/interview', interviewRoutes);

app.use("/api/contests", contestRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/course-progress", courseProgressRoutes);

const InitalizeConnection = async () => {
    try {
        await main();
        console.log("DB Connected");
        
        // Start Server first so app is accessible
        app.listen(process.env.PORT, () => {
            console.log("Server listening at port number: " + process.env.PORT);
        });

        // Attempt Redis connection in background
        redisClient.connect().then(() => {
            console.log("Redis Connected Successfully ⚡");
        }).catch((err) => {
            console.error("Redis Connection Error: " + err.message);
            console.log("Network blocked port. API will still work without Redis.");
        });

    } catch (err) {
        console.log("Error: " + err);
    }
}


InitalizeConnection();
