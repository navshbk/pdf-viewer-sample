<template>
  <div 
    class="pdf-page-wrapper"
    :class="{ 'flip-animation': isActive }"
  >
    <div class="pdf-page">
      <VuePdfEmbed 
        :source="source" 
        :page="pageNumber"
        @loaded="onPageLoaded"
        @error="onError"
        class="page-content"
      />
      <div v-if="loading" class="page-loading">
        <div class="loading-spinner"></div>
        <span>Loading page {{ pageNumber }}...</span>
      </div>
      <div v-if="error" class="page-error">
        <span>Error loading page {{ pageNumber }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'

const props = defineProps({
  source: {
    type: [String, Object],
    required: true
  },
  pageNumber: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['loaded', 'error'])

const loading = ref(true)
const error = ref(false)

const onPageLoaded = (event) => {
  console.log('PdfPage loaded event:', event)
  loading.value = false
  error.value = false
  emit('loaded', event)
}

const onError = (err) => {
  loading.value = false
  error.value = true
  emit('error', err)
}
</script>

<style scoped>
.pdf-page-wrapper {
  position: relative;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  min-height: 400px;
}

.pdf-page-wrapper:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.pdf-page {
  position: relative;
  width: 100%;
  height: 100%;
}

.page-content {
  display: block;
  width: 100%;
  height: 100%;
}

.page-loading,
.page-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #666;
  font-weight: 500;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.page-error {
  color: #dc3545;
}

.flip-animation {
  animation: flipIn 0.6s ease-out;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes flipIn {
  0% {
    transform: rotateY(-90deg);
    opacity: 0;
  }
  100% {
    transform: rotateY(0deg);
    opacity: 1;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .pdf-page-wrapper {
    min-height: 300px;
  }
  
  .pdf-page-wrapper:hover {
    transform: none;
  }
}
</style>
