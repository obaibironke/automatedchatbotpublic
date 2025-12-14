import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const CLIENTS = {
  "bella-dent": { token: "Secret" },
  "demo-cafe": { token: "Secret" }
};

const N8N_BASE =
  "Secret";

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
