// Live captions service using Web Speech API
class CaptionsService {
  constructor() {
    this.recognition = null;
    this.isSupported = 'webkitSpeechRecognition' in window;
    this.isRunning = false;
    this.onCaptionCallbacks = new Set();
    this.currentSpeaker = null;
  }

  initialize() {
    if (!this.isSupported) {
      throw new Error('Speech recognition is not supported in this browser');
    }

    // @ts-ignore - webkit prefix
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      const caption = {
        text: '',
        isFinal: false,
        speaker: this.currentSpeaker,
        timestamp: new Date().toISOString()
      };

      for (let i = event.resultIndex; i < event.results.length; i++) {
        caption.text = event.results[i][0].transcript;
        caption.isFinal = event.results[i].isFinal;
      }

      this.onCaptionCallbacks.forEach(callback => callback(caption));
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (this.isRunning) {
        this.restart();
      }
    };

    this.recognition.onend = () => {
      if (this.isRunning) {
        this.restart();
      }
    };
  }

  start(speaker = 'Unknown') {
    if (!this.recognition) {
      this.initialize();
    }

    this.currentSpeaker = speaker;
    this.isRunning = true;
    this.recognition.start();
  }

  stop() {
    if (this.recognition && this.isRunning) {
      this.isRunning = false;
      this.recognition.stop();
    }
  }

  restart() {
    this.stop();
    setTimeout(() => {
      if (this.isRunning) {
        this.start(this.currentSpeaker);
      }
    }, 1000);
  }

  onCaption(callback) {
    this.onCaptionCallbacks.add(callback);
    return () => this.onCaptionCallbacks.delete(callback);
  }

  changeSpeaker(speaker) {
    this.currentSpeaker = speaker;
  }

  // Save captions for the meeting
  saveCaptions(meetingId, captions) {
    const captionsText = captions
      .map(c => `[${new Date(c.timestamp).toLocaleTimeString()}] ${c.speaker}: ${c.text}`)
      .join('\n');

    const blob = new Blob([captionsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-${meetingId}-captions.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export default new CaptionsService();