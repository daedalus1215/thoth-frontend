<template>
  <q-page class="flex flex-center">
    <div class="text-center">
      <div class="text-h4 q-mb-md">
        <q-icon name="mic" class="q-mr-sm" />
        Live Audio Recording
      </div>
      <div class="text-subtitle1 text-grey-6 q-mb-lg">
        Record audio in real-time and get instant transcription
      </div>
      <AudioRecorder />
    </div>
  </q-page>
</template>

<script>
import AudioRecorder from 'components/AudioRecorder/AudioRecorder.vue'

export default {
  components: {
    AudioRecorder,
  },
}
</script>
