const express = require("express");
const cors = require("cors");
require("dotenv").config();

const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require("./routes/auth");
const analyticsRoutes = require("./routes/analytics");
// filesRoutes will be required and initialized with `io` below
const usersRoutes = require('./routes/users');
const groupsRoutes = require('./routes/groups');

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/analytics", analyticsRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 4000;

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: process.env.CLIENT_ORIGIN || '*',
		methods: ['GET', 'POST']
	}
});

// Initialize routes that depend on io
const filesRoutes = require('./routes/files')(io);
app.use('/api/files', filesRoutes);
// users and groups
app.use('/api/users', usersRoutes);
app.use('/api/groups', groupsRoutes);

io.on('connection', (socket) => {
	console.log('socket connected', socket.id);
	socket.on('disconnect', () => console.log('socket disconnected', socket.id));
});

server.listen(PORT, () => console.log(`Server (with Socket.IO) running on port ${PORT}`));
