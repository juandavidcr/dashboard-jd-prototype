const express = require("express");
const cors = require("cors");
require("dotenv").config();

const path = require('path');
const authRoutes = require("./routes/auth");
const analyticsRoutes = require("./routes/analytics");
const filesRoutes = require("./routes/files");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/files", filesRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
