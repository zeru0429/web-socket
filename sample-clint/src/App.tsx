import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import OnlineUsers from "./SocketComponent";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div></div>
      <OnlineUsers />
      <h1>Vite + React</h1>
    </>
  );
}

export default App;
