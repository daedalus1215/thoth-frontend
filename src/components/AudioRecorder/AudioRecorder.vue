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
        class="q-mr-sm"
      />
      <q-btn
        color="info"
        icon="refresh"
        label="Check Mic"
        @click="initializeMicrophoneStatus"
        size="sm"
      />
    </div>

    <!-- Microphone Status -->
    <div v-if="microphoneStatus" class="q-mb-md">
      <q-banner
        :class="microphoneStatus.available ? 'bg-positive text-white' : 'bg-negative text-white'"
        rounded
      >
        <template v-slot:avatar>
          <q-icon :name="microphoneStatus.available ? 'mic' : 'mic_off'" />
        </template>
        <div v-if="microphoneStatus.available">
          Microphone available ({{ microphoneStatus.devices?.length || 0 }} device(s))
        </div>
        <div v-else>Microphone issue: {{ microphoneStatus.error }}</div>
      </q-banner>
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
const microphoneStatus = ref<{ available: boolean; error?: string; devices?: any[] } | null>(null)
let websocket: WebSocket | null = null
let audioContext: AudioContext | null = null
let mediaStreamSource: MediaStreamAudioSourceNode | null = null
let processor: ScriptProcessorNode | null = null

// Configure audio constraints - start with basic constraints
const audioConstraints = {
  audio: true, // Start with basic audio access
}

// Fallback constraints if the first attempt fails
const fallbackConstraints = {
  audio: {
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

const checkMicrophoneAvailability = async () => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { available: false, error: 'getUserMedia not supported' }
    }

    // Check if we can enumerate devices
    const devices = await navigator.mediaDevices.enumerateDevices()
    const audioInputs = devices.filter((device) => device.kind === 'audioinput')

    if (audioInputs.length === 0) {
      return { available: false, error: 'No audio input devices found' }
    }

    return { available: true, devices: audioInputs }
  } catch (error) {
    return { available: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

const startRecording = async () => {
  try {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('getUserMedia is not supported in this browser')
    }

    // Try to get media stream with fallback constraints
    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia(audioConstraints)
    } catch (firstError) {
      console.warn('First attempt failed, trying fallback constraints:', firstError)
      try {
        stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints)
      } catch (secondError) {
        console.warn('Fallback attempt failed, trying basic audio:', secondError)
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      }
    }

    // Initialize WebSocket connection
    initializeWebSocket()

    // Create Audio Context with fallback sample rate
    try {
      audioContext = new AudioContext({
        sampleRate: 16000,
      })
    } catch (contextError) {
      console.warn('Failed to create AudioContext with 16kHz, using default:', contextError)
      audioContext = new AudioContext()
    }

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
    console.log('Recording started successfully')
  } catch (error: any) {
    console.error('Error starting recording:', error)

    // Provide user-friendly error messages
    if (error.name === 'NotFoundError') {
      console.error('No microphone found. Please check your microphone connection.')
    } else if (error.name === 'NotAllowedError') {
      console.error('Microphone access denied. Please allow microphone access.')
    } else if (error.name === 'NotSupportedError') {
      console.error('Microphone not supported in this browser.')
    } else {
      console.error('Unknown error accessing microphone:', error.message)
    }
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

// Initialize microphone status on component mount
const initializeMicrophoneStatus = async () => {
  microphoneStatus.value = await checkMicrophoneAvailability()
}

// Initialize when component mounts
initializeMicrophoneStatus()

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
