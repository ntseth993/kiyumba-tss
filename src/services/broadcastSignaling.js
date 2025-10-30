// Simple BroadcastChannel signaling for local testing
// Use this only for local testing across same-origin tabs.

class BroadcastSignaling {
  constructor() {
    this.channel = null;
    this.channelName = null;
    this.callbacks = new Set();
  }

  init(channelName) {
    if (this.channel) this.close();
    this.channelName = channelName;
    try {
      this.channel = new BroadcastChannel(channelName);
      this.channel.onmessage = (e) => {
        const msg = e.data;
        this.callbacks.forEach(cb => cb(msg));
      };
    } catch (err) {
      console.error('BroadcastChannel not available:', err);
      this.channel = null;
    }
  }

  send(message) {
    if (!this.channel) return;
    try {
      this.channel.postMessage(message);
    } catch (err) {
      console.error('Error sending via BroadcastChannel:', err);
    }
  }

  onMessage(cb) {
    this.callbacks.add(cb);
    return () => this.callbacks.delete(cb);
  }

  close() {
    if (this.channel) {
      try { this.channel.close(); } catch (e) {}
      this.channel = null;
    }
    this.callbacks.clear();
  }
}

export default new BroadcastSignaling();
