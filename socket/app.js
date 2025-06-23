import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import query from "./config/db.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const onlineUsers = [];

app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ Server is working");
});

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("login", async (userId) => {
    if (!userId) return;

    // Check if the user exists in the database
    const userExists = await query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    if (userExists.length === 0) {
      console.log("❌ User not found:", userId);
      socket.emit("loginError", "User not found");
      return;
    }

    // Get user details from the database
    const { email, status } = userExists[0]; // Assuming email and status are in the user record

    // Check if the user is active
    if (status !== "active") {
      console.log("❌ User is inactive:", userId);
      socket.emit("loginError", "User is inactive");
      return;
    }

    // Remove any duplicate for this socket or user
    const indexBySocket = onlineUsers.findIndex((u) => u.socket === socket.id);
    if (indexBySocket !== -1) onlineUsers.splice(indexBySocket, 1);

    const indexById = onlineUsers.findIndex((u) => u.id === userId);
    if (indexById !== -1) onlineUsers.splice(indexById, 1);

    // Create the user object with additional details
    const user = {
      id: userId,
      socket: socket.id,
      email: email,
      first_name: userExists[0].first_name,
      last_name: userExists[0].last_name,
      status: status,
    };
    onlineUsers.push(user);

    console.log("✅ User logged in:", user);
    io.emit("onlineUsers", onlineUsers);
  });

  socket.on("disconnect", () => {
    const index = onlineUsers.findIndex((u) => u.socket === socket.id);
    if (index !== -1) {
      const disconnectedUser = onlineUsers[index];
      onlineUsers.splice(index, 1);
      console.log(`🔴 User ${disconnectedUser.id} disconnected`);
      io.emit("onlineUsers", onlineUsers);
    }
  });
});

const PORT = process.env.PORT || 7777;
httpServer.listen(PORT, () => {
  console.log(`⚙️ Server running at http://localhost:${PORT}`);
});
