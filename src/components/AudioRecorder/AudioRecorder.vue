<template>
  <div class="audio-recorder">
    <div class="controls q-mb-md">
      <q-btn
        :color="isRecording ? 'negative' : 'primary'"
        :icon="isRecording ? 'stop' : 'mic'"
        :label="isRecording ? 'Stop Recording' : 'Start Recording'"
        @click="toggleRecording"
        class="q-mr-sm"
      />
      <q-btn
        color="secondary"
        icon="clear"
        label="Clear"
        @click="clearTranscription"
        :disable="!transcription"
      />
    </div>

    <div v-if="transcription" class="transcription q-mt-md">
      <p>{{ transcription }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'

const isRecording = ref(false)
const transcription = ref('')
let websocket: WebSocket | null = null
let audioContext: AudioContext | null = null
let mediaStreamSource: MediaStreamAudioSourceNode | null = null
let processor: ScriptProcessorNode | null = null

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
      // Append new transcription with a space
      transcription.value = transcription.value
        ? `${transcription.value} ${data.transcription}`
        : data.transcription
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

const clearTranscription = () => {
  transcription.value = ''
}

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(audioConstraints)

    // Initialize WebSocket connection
    initializeWebSocket()

    // Create Audio Context
    audioContext = new AudioContext({
      sampleRate: 16000,
    })

    // Create source from stream
    mediaStreamSource = audioContext.createMediaStreamSource(stream)

    // Create script processor for raw audio data
    processor = audioContext.createScriptProcessor(4096, 1, 1)

    processor.onaudioprocess = (e) => {
      if (websocket?.readyState === WebSocket.OPEN) {
        const inputData = e.inputBuffer.getChannelData(0)
        websocket.send(inputData.buffer)
      }
    }

    // Connect the nodes
    mediaStreamSource.connect(processor)
    processor.connect(audioContext.destination)

    isRecording.value = true
  } catch (error) {
    console.error('Error starting recording:', error)
  }
}

const stopRecording = () => {
  if (processor) {
    processor.disconnect()
    processor = null
  }

  if (mediaStreamSource) {
    mediaStreamSource.disconnect()
    mediaStreamSource = null
  }

  if (audioContext) {
    audioContext.close()
    audioContext = null
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
  max-height: 400px;
  overflow-y: auto;
}

.controls {
  display: flex;
  align-items: center;
}
</style>
