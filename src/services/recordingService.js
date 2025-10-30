// Meeting recording service for handling screen and audio recording
class RecordingService {
  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.onDataAvailable = this.onDataAvailable.bind(this);
    this.onStop = this.onStop.bind(this);
  }

  async startRecording(stream) {
    try {
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      this.mediaRecorder = new MediaRecorder(stream, options);
      this.recordedChunks = [];
      
      this.mediaRecorder.ondataavailable = this.onDataAvailable;
      this.mediaRecorder.onstop = this.onStop;
      
      this.mediaRecorder.start(1000); // Collect data every second
      this.isRecording = true;
      
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      console.log('Recording stopped');
    }
  }

  onDataAvailable(event) {
    if (event.data.size > 0) {
      this.recordedChunks.push(event.data);
    }
  }

  onStop() {
    const blob = new Blob(this.recordedChunks, {
      type: 'video/webm'
    });
    this.recordedChunks = [];
    return blob;
  }

  async saveRecording(meetingId) {
    if (this.recordedChunks.length === 0) {
      throw new Error('No recording data available');
    }

    const blob = new Blob(this.recordedChunks, {
      type: 'video/webm'
    });

    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = `meeting-${meetingId}-${new Date().toISOString()}.webm`;
    a.click();

    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    this.recordedChunks = [];

    return blob;
  }

  // Generate meeting summary from recording (placeholder)
  async generateSummary(blob) {
    // In a real implementation, this would:
    // 1. Send the recording to a speech-to-text service
    // 2. Process the transcript with AI to generate a summary
    // 3. Return the summary text and key points
    return {
      duration: '00:00:00',
      participantCount: 0,
      transcript: 'Meeting transcript will be generated here',
      summary: 'Meeting summary will be generated here',
      keyPoints: ['Key points will be listed here'],
      actionItems: ['Action items will be listed here']
    };
  }
}

export default new RecordingService();