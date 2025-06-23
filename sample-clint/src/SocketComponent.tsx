import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

// Types
interface OnlineUser {
  id: string;
  socket: string;
  email: string; // Email address
  activeStatus: number; // Active status (e.g., "active" or "inactive")
}

const socket: Socket = io("http://localhost:7777", {
  autoConnect: false, // Disable auto connect
});

const OnlineUsers: React.FC = () => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [userId, setUserId] = useState<string>(
    () => localStorage.getItem("userId") || ""
  );
  const [isOnline, setIsOnline] = useState<boolean>(false);

  useEffect(() => {
    if (isOnline && userId) {
      socket.connect();
      socket.emit("login", userId);
    }

    const handleOnlineUsers = (users: OnlineUser[]) => {
      setOnlineUsers(users);
    };

    socket.on("onlineUsers", handleOnlineUsers);

    return () => {
      socket.off("onlineUsers", handleOnlineUsers);
    };
  }, [isOnline, userId]);

  const handleToggle = () => {
    if (!userId) return alert("Please enter your user ID first.");
    if (isOnline) {
      socket.disconnect();
    } else {
      socket.connect();
      socket.emit("login", userId);
    }
    setIsOnline(!isOnline);
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserId(value);
    localStorage.setItem("userId", value);
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h2>🟢 Online Users</h2>

      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <input
          type="text"
          placeholder="Enter your User ID"
          value={userId}
          onChange={handleUserIdChange}
          style={{ padding: "8px", border: "1px solid #ccc", borderRadius: 4 }}
        />
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input type="checkbox" checked={isOnline} onChange={handleToggle} />
          {isOnline ? "Online" : "Offline"}
        </label>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "1rem",
          border: "1px solid #ddd",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={thStyle}>#</th>
            <th style={thStyle}>User ID</th>
            <th style={thStyle}>Socket ID</th>
            <th style={thStyle}>Email</th> {/* Email Column */}
            <th style={thStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {onlineUsers.map((user, index) => (
            <tr key={user.socket}>
              <td style={tdStyle}>{index + 1}</td>
              <td style={tdStyle}>{user.id}</td>
              <td style={tdStyle}>{user.socket}</td>
              <td style={tdStyle}>{user.email}</td> {/* Display Email */}
              <td
                style={{
                  ...tdStyle,
                  color: user.activeStatus === 1 ? "green" : "red",
                }}
              >
                {user.activeStatus === 1 ? "✅ Online" : "❌ Offline"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {onlineUsers.length === 0 && (
        <p style={{ marginTop: "1rem", color: "gray" }}>
          No users online currently.
        </p>
      )}
    </div>
  );
};

const thStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "left",
};

const tdStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "8px",
};

export default OnlineUsers;
