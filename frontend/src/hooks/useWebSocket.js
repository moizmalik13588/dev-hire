import { useEffect, useRef, useState } from "react";

const useWebSocket = () => {
  const ws = useRef(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    ws.current = new WebSocket(`ws://localhost:5000?token=${token}`);

    ws.current.onopen = () => console.log("🔌 WS Connected");

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type !== "CONNECTED") {
        setNotifications((prev) => [data, ...prev]);
      }
    };

    ws.current.onerror = (e) => console.error("WS Error:", e);

    return () => ws.current?.close();
  }, []);

  return { notifications };
};

export default useWebSocket;
