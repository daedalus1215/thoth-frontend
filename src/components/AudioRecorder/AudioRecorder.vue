<template>
  <div class="audio-recorder">
    <q-btn
      :color="isRecording ? 'negative' : 'primary'"
      :icon="isRecording ? 'stop' : 'mic'"
      :label="isRecording ? 'Stop Recording' : 'Start Recording'"
      @click="toggleRecording"
    />

    <div v-if="transcription" class="transcription q-mt-md">
      <p>{{ transcription }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'

const isRecording = ref(false)
const transcription = ref('')
let mediaRecorder: MediaRecorder | null = null
let websocket: WebSocket | null = null

// Configure audio constraints
const audioConstraints = {
  audio: {
    sampleRate: 16000,
    channelCount: 1,
    echoCancellation: true,
    noiseSuppression: true,
  },
}

const initializeWebSocket = () => {
  websocket = new WebSocket('ws://localhost:8000/stream-audio')

  websocket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.transcription) {
      transcription.value = data.transcription
    }
  }

  websocket.onerror = (error) => {
    console.error('WebSocket error:', error)
    stopRecording()
  }

  websocket.onclose = () => {
    console.log('WebSocket connection closed')
    stopRecording()
  }
}

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(audioConstraints)

    // Initialize WebSocket connection
    initializeWebSocket()

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus',
    })

    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0 && websocket?.readyState === WebSocket.OPEN) {
        // Convert blob to Float32Array
        const arrayBuffer = await event.data.arrayBuffer()
        const audioData = await new AudioContext().decodeAudioData(arrayBuffer)
        const float32Array = audioData.getChannelData(0)

        // Send the audio data as bytes
        websocket.send(float32Array.buffer)
      }
    }

    // Set a small timeslice to get frequent chunks (e.g., 100ms)
    mediaRecorder.start(100)
    isRecording.value = true
  } catch (error) {
    console.error('Error starting recording:', error)
  }
}

const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
    mediaRecorder.stream.getTracks().forEach((track) => track.stop())
  }

  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.close()
  }

  isRecording.value = false
}

const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

// Cleanup on component unmount
onBeforeUnmount(() => {
  stopRecording()
})
</script>

<style scoped>
.audio-recorder {
  padding: 1rem;
}

.transcription {
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  white-space: pre-wrap;
}
</style>
