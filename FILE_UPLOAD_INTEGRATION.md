# Frontend Integration - File Upload Tab

## Overview

A new **File Upload** tab has been added to the Thoth frontend that allows users to upload audio files and get them transcribed using the backend's `transcribe_file` endpoint.

## Features

### 🎵 **File Upload Tab**
- **Drag & Drop**: Easy file selection with visual feedback
- **File Validation**: Supports all audio formats (WAV, MP3, FLAC, M4A, OGG)
- **Size Limit**: 50MB maximum file size
- **Progress Indicator**: Visual feedback during upload and processing

### 📝 **Transcription Display**
- **Read-only Textarea**: Shows the transcribed text
- **Word Count**: Displays the number of words in the transcription
- **Copy to Clipboard**: One-click copy functionality
- **File Information**: Shows file details (name, size, type, date)

### 🔄 **User Experience**
- **Loading States**: Clear visual feedback during processing
- **Error Handling**: User-friendly error messages
- **Success Notifications**: Toast notifications for successful operations
- **Responsive Design**: Works on desktop and mobile devices

## File Structure

```
src/
├── pages/
│   ├── IndexPage.vue          # Live recording tab
│   └── FileUploadPage.vue     # File upload tab (NEW)
├── services/
│   └── transcriptionAPI.ts    # API service layer (NEW)
├── layouts/
│   └── MainLayout.vue         # Updated with tabs
└── router/
    └── routes.ts              # Updated with new route
```

## API Integration

### Backend Endpoint Used
- **POST** `/transcribe/` - Single file transcription
- **GET** `/performance` - Performance monitoring (available)
- **GET** `/health` - Health check (available)

### Request Flow
```
Frontend File Upload → transcriptionAPI.transcribeFile() → 
Backend /transcribe/ → AcceleratedWhisperTranscriptionEngine → 
Transcription Result → Frontend Display
```

## Usage

### 1. **Navigate to File Upload Tab**
- Click the "File Upload" tab in the header
- Or navigate directly to `/upload`

### 2. **Select Audio File**
- Click "Choose audio file" button
- Or drag and drop an audio file
- Supported formats: WAV, MP3, FLAC, M4A, OGG

### 3. **Upload & Transcribe**
- Click "Upload & Transcribe" button
- Wait for processing (progress bar shows activity)
- View results in the textarea below

### 4. **Copy Results**
- Click "Copy" button to copy transcription to clipboard
- Use the word count to verify completeness

## Technical Details

### **API Service Layer**
```typescript
// Clean separation of concerns
export class TranscriptionAPI {
  async transcribeFile(file: File): Promise<{ transcription: string }>
  async transcribeBatch(files: File[]): Promise<BatchResult>
  async getPerformanceInfo(): Promise<PerformanceInfo>
  async healthCheck(): Promise<HealthStatus>
}
```

### **Error Handling**
- **File Size**: Shows error for files > 50MB
- **File Type**: Validates audio file formats
- **Network**: Handles connection errors gracefully
- **Backend**: Displays server error messages

### **State Management**
- **Reactive State**: Vue 3 Composition API
- **Loading States**: Prevents multiple simultaneous uploads
- **Error States**: Clear error messaging
- **Success States**: Positive feedback

## Styling

### **Quasar Components Used**
- `q-file` - File upload component
- `q-btn` - Action buttons
- `q-card` - Content containers
- `q-input` - Textarea for results
- `q-banner` - Error/success messages
- `q-linear-progress` - Loading indicator
- `q-tabs` - Navigation tabs

### **Responsive Design**
- **Mobile**: Single column layout
- **Tablet**: Optimized spacing
- **Desktop**: Full-width with centered content

## Future Enhancements

### **Planned Features**
- **Batch Upload**: Multiple file processing
- **Download Results**: Save transcriptions as text files
- **Audio Preview**: Play uploaded audio before transcription
- **Format Selection**: Choose output format (plain text, SRT, VTT)
- **History**: Save and manage previous transcriptions

### **Performance Optimizations**
- **Chunked Upload**: For large files
- **Compression**: Client-side audio compression
- **Caching**: Cache recent transcriptions
- **Offline Support**: Service worker integration

## Testing

### **Manual Testing**
1. Upload various audio formats
2. Test file size limits
3. Verify error handling
4. Check responsive design
5. Test copy functionality

### **Automated Testing** (Future)
- Unit tests for API service
- Component tests for file upload
- E2E tests for complete flow
- Performance tests for large files

## Troubleshooting

### **Common Issues**
1. **CORS Errors**: Ensure backend allows frontend origin
2. **File Size**: Check 50MB limit
3. **File Format**: Verify audio file format
4. **Network**: Check backend connectivity

### **Debug Mode**
- Open browser DevTools
- Check Network tab for API calls
- View Console for error messages
- Monitor Performance tab for timing

The file upload tab provides a seamless way to transcribe audio files using your hexagonal architecture backend! 🎉
