// Simple WebSocket signaling server for WebRTC
// Usage: node signaling-server.js

const WebSocket = require('ws');
const port = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port });

// Map meetingId => Set of clients
const meetings = new Map();

wss.on('connection', (ws, req) => {
  ws.id = Math.random().toString(36).slice(2, 9);
  ws.meetingId = null;
  ws.userId = null;

  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message);
      if (msg.type === 'join' && msg.meetingId) {
        ws.meetingId = msg.meetingId;
        ws.userId = msg.from || ws.id;
        if (!meetings.has(msg.meetingId)) meetings.set(msg.meetingId, new Set());
        meetings.get(msg.meetingId).add(ws);
        return;
      }

      // Broadcast to other clients in same meeting
      const set = meetings.get(msg.meetingId);
      if (!set) return;

      set.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(msg));
        }
      });
    } catch (err) {
      console.error('Invalid message', err);
    }
  });

  ws.on('close', () => {
    if (ws.meetingId && meetings.has(ws.meetingId)) {
      meetings.get(ws.meetingId).delete(ws);
      if (meetings.get(ws.meetingId).size === 0) meetings.delete(ws.meetingId);
    }
  });
});

console.log(`Signaling server running on ws://localhost:${port}`);
