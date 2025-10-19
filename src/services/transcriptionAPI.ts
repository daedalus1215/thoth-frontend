// API service for transcription endpoints
export class TranscriptionAPI {
  private baseURL: string

  constructor(baseURL: string = 'http://localhost:8000') {
    this.baseURL = baseURL
  }

  /**
   * Upload and transcribe a single audio file
   */
  async transcribeFile(file: File): Promise<{ transcription: string }> {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${this.baseURL}/transcribe/`, {
        method: 'POST',
        body: formData,
        // Add headers for CORS
        headers: {
          'Accept': 'application/json',
        },
        // Ensure credentials are included if needed
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      // Handle CORS and network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the transcription service. Please check if the backend is running and CORS is configured correctly.')
      }
      throw error
    }
  }

  /**
   * Upload and transcribe multiple audio files
   */
  async transcribeBatch(files: File[]): Promise<{ transcriptions: Array<{ filename: string; transcription: string }>; count: number }> {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })

    try {
      const response = await fetch(`${this.baseURL}/transcribe/batch`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the transcription service. Please check if the backend is running and CORS is configured correctly.')
      }
      throw error
    }
  }

  /**
   * Get performance information
   */
  async getPerformanceInfo(): Promise<{
    status: string
    performance: {
      device: string
      mixed_precision: string
      num_processes: number
    }
    audio_config: {
      sample_rate: number
      buffer_duration: number
    }
  }> {
    try {
      const response = await fetch(`${this.baseURL}/performance`, {
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the transcription service. Please check if the backend is running and CORS is configured correctly.')
      }
      throw error
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the transcription service. Please check if the backend is running and CORS is configured correctly.')
      }
      throw error
    }
  }
}

// Export a default instance
export const transcriptionAPI = new TranscriptionAPI()