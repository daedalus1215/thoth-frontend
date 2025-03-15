<script setup>
import { ref } from 'vue'

const mediaRecorder = ref(null)
const audioChunks = ref([])
const isRecording = ref(false)
const audioUrl = ref(null)

const startRecording = async () => {
  try {
    // Request permission to access the microphone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    // Create a MediaRecorder instance to capture audio
    mediaRecorder.value = new MediaRecorder(stream)

    // Start recording
    mediaRecorder.value.start()
    isRecording.value = true
    audioChunks.value = []

    // When audio data is available, push it to the audioChunks array
    mediaRecorder.value.ondataavailable = (event) => {
      audioChunks.value.push(event.data)
    }

    // When the recording is stopped, create a blob URL from the audio chunks
    mediaRecorder.value.onstop = () => {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/wav' })
      audioUrl.value = URL.createObjectURL(audioBlob)

      // You can also send the audio to your backend API for ASR processing
      uploadAudio(audioBlob)
    }
  } catch (err) {
    console.error('Error accessing microphone: ', err)
  }
}

const stopRecording = () => {
  mediaRecorder.value.stop()
  isRecording.value = false
}

const uploadAudio = (blob) => {
  const formData = new FormData()
  formData.append('audio', blob)

  // Replace this with your backend endpoint
  fetch('http://localhost:8080/upload', {
    method: 'POST',
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Audio uploaded successfully:', data)
    })
    .catch((error) => {
      console.error('Error uploading audio:', error)
    })
}
</script>

<template>
  <q-page>
    <q-btn @click="startRecording" label="Start Recording" color="primary" />
    <q-btn
      @click="stopRecording"
      label="Stop Recording"
      color="secondary"
      :disable="!isRecording"
    />
    <audio v-if="audioUrl" :src="audioUrl" controls />
  </q-page>
</template>

<style scoped>
.q-btn {
  margin: 10px;
}
</style>
