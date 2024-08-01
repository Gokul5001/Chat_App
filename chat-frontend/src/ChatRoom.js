import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import './ChatRoom.css';  // Importing the CSS file

const socket = io('http://localhost:5000', {
    withCredentials: true,
    extraHeaders: {
        "my-custom-header": "abcd"
    }
});

const ChatRoom = () => {
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState('');
    const [message, setMessage] = useState('');
    const [room, setRoom] = useState('default');

    const fetchMessages = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:5000/messages/${room}`);
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }, [room]);

    const sendMessage = () => {
        socket.emit('message', { user, message, room });
        setMessage('');
    };

    useEffect(() => {
        socket.emit('joinRoom', room);

        socket.on('message', (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        fetchMessages();
        return () => {
            socket.off('message');
        };
    }, [room, fetchMessages]);

    return (
        <div className="chat-room">
            <h2>Chat Room</h2>
            <div className="room-input">
                <input
                    type="text"
                    placeholder="Room name"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                />
            </div>
            <div className="message-list">
                <ul>
                    {messages.map((message, index) => (
                        <li key={message._id} className={`message-item ${index % 2 === 0 ? 'left' : 'right'}`}>
                            <strong>{message.user}:</strong> {message.message}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="message-input">
                <input
                    type="text"
                    placeholder="Your name"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatRoom;
