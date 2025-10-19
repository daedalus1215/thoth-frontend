<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" />

        <q-toolbar-title> Thoth Transcription Service </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
      
      <!-- Navigation Tabs -->
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="recorder" icon="mic" label="Live Recording" />
        <q-tab name="upload" icon="upload_file" label="File Upload" />
      </q-tabs>
    </q-header>
    
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const tab = ref('recorder')

// Watch for route changes to update tab
watch(() => route.path, (newPath) => {
  if (newPath === '/upload') {
    tab.value = 'upload'
  } else if (newPath === '/') {
    tab.value = 'recorder'
  }
}, { immediate: true })

// Watch for tab changes to navigate
watch(tab, (newTab) => {
  if (newTab === 'upload') {
    router.push('/upload')
  } else if (newTab === 'recorder') {
    router.push('/')
  }
})
</script>
