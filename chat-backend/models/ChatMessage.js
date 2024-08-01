const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    user: { type: String, required: true },
    message: { type: String, required: true },
    room: { type: String, required: true }, // New field
    timestamp: { type: Date, default: Date.now },
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;
