const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

const ChatMessage = require('./models/ChatMessage');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Replace with your frontend URL
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization", "my-custom-header"], // Add your custom header here
        credentials: true
    }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json());

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/react-login-tut", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Failed to connect to MongoDB", err);
});

// WebSocket events
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    socket.on('message', async (data) => {
        const { user, message, room } = data;
        const chatMessage = new ChatMessage({
            user,
            message,
            room,
        });

        await chatMessage.save();

        io.to(room).emit('message', chatMessage);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Route to get messages
app.get('/messages/:room', async (req, res) => {
    const { room } = req.params;
    try {
        const messages = await ChatMessage.find({ room });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages', error });
    }
});

// Default route
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
