import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const CLIENTS = {
  "bella-dent": { token: "R6nC9vQ4xP2yH7tF3mK1aL8bJ0sZ5gD9" },
  "demo-cafe": { token: "ZK3fQx9uP1wC7aL0hY2sR8dM5vT4nB6" }
};

const N8N_BASE =
  "https://permasize.app.n8n.cloud/webhook/9259d8e0-8ba1-4e96-a2f5-1b95bd0c2c28/chatbot";

app.post("/api/chat/:clientId", async (req, res) => {
  const { clientId } = req.params;
  const { message, sessionId } = req.body;
  const client = CLIENTS[clientId];
  if (!client) return res.status(401).json({ message: "Unauthorized client" });

  try {
    const upstream = await fetch(`${N8N_BASE}/${clientId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Client-Token": client.token,
        "X-Session-Id": sessionId || `sess-${Date.now()}`
      },
      body: JSON.stringify({ message })
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error contacting assistant" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Proxy live on port ${port}`));
