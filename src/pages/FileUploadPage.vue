<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <q-card class="q-pa-md">
          <q-card-section>
            <div class="text-h5 q-mb-md text-center">
              <q-icon name="upload_file" class="q-mr-sm" />
              Audio File Transcription
            </div>
            <div class="text-subtitle2 text-center text-grey-6 q-mb-lg">
              Upload an audio file to get it transcribed using AI
            </div>
          </q-card-section>

          <q-card-section>
            <!-- File Upload Area -->
            <q-file
              v-model="selectedFile"
              label="Choose audio file"
              accept="audio/*"
              max-file-size="50000000"
              @rejected="onFileRejected"
              @update:model-value="onFileSelected"
              filled
              counter
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>

            <!-- Upload Button -->
            <div class="row justify-center q-mb-md">
              <q-btn
                color="primary"
                icon="cloud_upload"
                label="Upload & Transcribe"
                :loading="isUploading"
                :disable="!selectedFile || isUploading"
                @click="uploadAndTranscribe"
                size="lg"
              />
            </div>

            <!-- Progress Bar -->
            <q-linear-progress
              v-if="isUploading"
              indeterminate
              color="primary"
              class="q-mb-md"
            />

            <!-- Error Message -->
            <q-banner
              v-if="errorMessage"
              class="bg-negative text-white q-mb-md"
              rounded
            >
              <template v-slot:avatar>
                <q-icon name="error" />
              </template>
              {{ errorMessage }}
            </q-banner>

            <!-- Success Message -->
            <q-banner
              v-if="successMessage"
              class="bg-positive text-white q-mb-md"
              rounded
            >
              <template v-slot:avatar>
                <q-icon name="check_circle" />
              </template>
              {{ successMessage }}
            </q-banner>

            <!-- Transcription Results -->
            <div v-if="transcription" class="q-mt-md">
              <div class="text-h6 q-mb-sm">
                <q-icon name="text_fields" class="q-mr-sm" />
                Transcription Result
              </div>
              
              <q-input
                v-model="transcription"
                type="textarea"
                label="Transcribed Text"
                readonly
                filled
                rows="8"
                class="q-mb-sm"
              />
              
              <div class="row justify-between items-center">
                <div class="text-caption text-grey-6">
                  Word count: {{ wordCount }}
                </div>
                <q-btn
                  color="secondary"
                  icon="content_copy"
                  label="Copy"
                  size="sm"
                  @click="copyToClipboard"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- File Information Card -->
        <q-card v-if="selectedFile" class="q-mt-md">
          <q-card-section>
            <div class="text-h6 q-mb-sm">
              <q-icon name="info" class="q-mr-sm" />
              File Information
            </div>
            <div class="text-body2">
              <div><strong>Name:</strong> {{ selectedFile.name }}</div>
              <div><strong>Size:</strong> {{ formatFileSize(selectedFile.size) }}</div>
              <div><strong>Type:</strong> {{ selectedFile.type }}</div>
              <div><strong>Last Modified:</strong> {{ formatDate(selectedFile.lastModified) }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { transcriptionAPI } from 'src/services/transcriptionAPI'

const $q = useQuasar()

// Reactive state
const selectedFile = ref<File | null>(null)
const transcription = ref<string>('')
const isUploading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Computed properties
const wordCount = computed(() => {
  if (!transcription.value) return 0
  return transcription.value.trim().split(/\s+/).filter(word => word.length > 0).length
})

// Methods
const onFileSelected = (file: File | null) => {
  selectedFile.value = file
  clearMessages()
}

const onFileRejected = (rejectedEntries: any[]) => {
  const rejection = rejectedEntries[0]
  if (rejection.failedPropValidation === 'max-file-size') {
    errorMessage.value = 'File size exceeds 50MB limit'
  } else {
    errorMessage.value = 'Invalid file type. Please select an audio file.'
  }
}

const uploadAndTranscribe = async () => {
  if (!selectedFile.value) return

  isUploading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  transcription.value = ''

  try {
    const result = await transcriptionAPI.transcribeFile(selectedFile.value)
    transcription.value = result.transcription
    successMessage.value = 'File transcribed successfully!'
    
    $q.notify({
      type: 'positive',
      message: 'Transcription completed!',
      icon: 'check_circle',
      position: 'top'
    })

  } catch (error) {
    console.error('Upload error:', error)
    errorMessage.value = error instanceof Error ? error.message : 'An error occurred during transcription'
    
    $q.notify({
      type: 'negative',
      message: 'Transcription failed',
      icon: 'error',
      position: 'top'
    })
  } finally {
    isUploading.value = false
  }
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(transcription.value)
    $q.notify({
      type: 'positive',
      message: 'Transcription copied to clipboard!',
      icon: 'content_copy',
      position: 'top'
    })
  } catch (error) {
    console.error('Copy failed:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to copy to clipboard',
      icon: 'error',
      position: 'top'
    })
  }
}

const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString()
}
</script>

<style scoped>
.q-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.text-h5 {
  font-weight: 600;
}

.text-subtitle2 {
  font-size: 0.875rem;
}
</style>
