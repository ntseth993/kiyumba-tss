// Simple WebSocket signaling client wrapper
class WSSignaling {
  constructor() {
    this.ws = null;
    this.url = null;
    this.callbacks = new Set();
    this.meetingId = null;
  }

  init(url, meetingId, userId) {
    if (this.ws) this.close();
    this.url = url;
    this.meetingId = meetingId;
    try {
      this.ws = new WebSocket(url);
      this.ws.onopen = () => {
        // announce join
        this.send({ type: 'join', meetingId, from: userId });
      };
      this.ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          this.callbacks.forEach(cb => cb(msg));
        } catch (e) {
          console.error('Invalid WS message', e);
        }
      };
      this.ws.onclose = () => {
        // no-op
      };
    } catch (err) {
      console.error('WebSocket init error', err);
      this.ws = null;
    }
  }

  send(message) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    try {
      this.ws.send(JSON.stringify(message));
    } catch (err) {
      console.error('WS send error', err);
    }
  }

  onMessage(cb) {
    this.callbacks.add(cb);
    return () => this.callbacks.delete(cb);
  }

  close() {
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
      this.ws = null;
    }
    this.callbacks.clear();
  }
}

export default new WSSignaling();
