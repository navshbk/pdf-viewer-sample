<template>
  <div class="app-container">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <h1 class="app-title">PDF Viewer</h1>
        <div class="header-controls">
          <input 
            type="file" 
            ref="fileInput" 
            @change="handleFileUpload" 
            accept=".pdf"
            class="file-input"
            aria-label="Select PDF file to upload"
          />
          <button @click="$refs.fileInput.click()" class="upload-btn" aria-label="Upload PDF file">
            📁 Upload PDF
          </button>
          <!-- <button @click="loadTestPdf" class="upload-btn" style="margin-left: 0.5rem;" aria-label="Load test PDF for demonstration">
            🧪 Load Test PDF
          </button> -->
          <div class="page-info" v-if="totalPages > 0">
            Page {{ currentPage }} of {{ totalPages }}
            <span class="layout-indicator" :title="isMobile ? 'Mobile Layout (1-up)' : 'Desktop Layout (2-up)'">
              {{ isMobile ? '📱' : '🖥️' }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="main-content">
      <!-- PDF Viewer -->
      <main class="pdf-viewer">
        <div v-if="!pdfUrl && !error" class="upload-prompt">
          <div class="upload-icon">📄</div>
          <h2>Upload a PDF to get started</h2>
          <p>Click the upload button above to select a PDF file</p>
        </div>
        
        <div v-if="error" class="error-message">
          <div class="error-icon">⚠️</div>
          <h2>Error</h2>
          <p>{{ error }}</p>
          <button @click="error = null" class="retry-btn">Try Again</button>
        </div>
        
        <div v-else-if="pdfUrl" class="pdf-container">
          <!-- Controls - only show when pages are loaded -->
          <div v-if="totalPages > 0" class="viewer-controls">
            <div class="nav-section">
              <button @click="previousPage" :disabled="currentPage <= 1" class="nav-btn" aria-label="Go to previous page">
                ← Previous
              </button>
              <button @click="nextPage" :disabled="currentPage >= totalPages" class="nav-btn" aria-label="Go to next page">
                Next →
              </button>
            </div>
            
            <div class="page-navigation">
              <input 
                v-model.number="currentPage" 
                @change="goToPage(currentPage)"
                type="number" 
                min="1" 
                :max="totalPages"
                class="page-input"
                :aria-label="`Go to page (1 to ${totalPages})`"
              />
              <span class="page-separator" aria-label="Total pages">/ {{ totalPages }}</span>
            </div>
            
            <div class="zoom-controls">
              <button @click="handleMobileZoom('out')" class="zoom-btn" title="Zoom Out" aria-label="Zoom out">-</button>
              <span class="zoom-level" @click="resetZoom" title="Click to reset zoom" role="button" tabindex="0" @keydown.enter="resetZoom" @keydown.space="resetZoom">{{ Math.round(zoom * 100) }}%</span>
              <button @click="handleMobileZoom('in')" class="zoom-btn" title="Zoom In" aria-label="Zoom in">+</button>
            </div>
            
            <div class="layout-info">
              <small>{{ isMobile ? 'Mobile (1-up)' : 'Desktop (2-up)' }}</small>
            </div>
          </div>
          
          <!-- PDF Content Area -->
          <div class="pdf-content-area">
            <div class="pdf-pages" :class="{ 'mobile-zoom': isMobile }" :style="isMobile ? {} : { transform: `scale(${zoom})` }">
              <div 
                v-for="pageNum in visiblePages" 
                :key="pageNum"
                class="pdf-page"
                :class="{ 'flip-animation': pageNum === currentPage }"
              >
                <VuePdfEmbed 
                  :source="pdfUrl" 
                  :page="pageNum"
                  @loaded="onPageLoaded"
                  @error="onPdfError"
                  @rendered="onPageRendered"
                  class="page-content"
                  :style="isMobile ? { transform: `scale(${zoom})` } : {}"
                />
              </div>
            </div>
            
            <!-- Loading overlay -->
            <div v-if="totalPages === 0" class="loading-overlay">
              <div class="loading-pdf">
                <div class="loading-spinner"></div>
                <p>Loading PDF pages...</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'

// Reactive state
const fileInput = ref(null)
const pdfUrl = ref('')
const currentPage = ref(1)
const totalPages = ref(0)
const zoom = ref(1)
const isLoading = ref(false)
const error = ref(null)
const pageLoadTimeout = ref(null)

// Reactive state for responsive behavior
const isMobile = ref(false)

// Computed properties
const visiblePages = computed(() => {
  console.log('Computing visible pages:', { 
    totalPages: totalPages.value, 
    currentPage: currentPage.value, 
    pdfUrl: pdfUrl.value,
    isMobile: isMobile.value 
  })
  
  // Always show at least page 1 if PDF URL exists
  if (pdfUrl.value && totalPages.value === 0) {
    return [1]
  }
  
  // If no PDF URL, return empty array
  if (!pdfUrl.value) {
    return []
  }
  
  // Mobile: show only current page (1-up layout)
  if (isMobile.value) {
    return [currentPage.value]
  }
  
  // Desktop: show two pages side by side (2-up layout)
  const pages = []
  if (currentPage.value % 2 === 1) {
    // Odd page - show current and next
    pages.push(currentPage.value)
    if (currentPage.value + 1 <= totalPages.value) {
      pages.push(currentPage.value + 1)
    }
  } else {
    // Even page - show previous and current
    if (currentPage.value - 1 >= 1) {
      pages.push(currentPage.value - 1)
    }
    pages.push(currentPage.value)
  }
  
  console.log('Visible pages:', pages)
  return pages
})

// Methods
const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  console.log('File selected:', file)
  
  if (file && file.type === 'application/pdf') {
    try {
      isLoading.value = true
      error.value = null
      
      const url = URL.createObjectURL(file)
      console.log('PDF URL created:', url)
      pdfUrl.value = url
      currentPage.value = 1
      totalPages.value = 0 // Reset pages count
      
      // Let the VuePdfEmbed component handle page count detection
      console.log('PDF URL set, page count will be determined by component')
      
      console.log('PDF URL set, page count:', totalPages.value)
      
      // Set a timeout to show error if page count is not determined within 10 seconds
      if (totalPages.value === 0) {
        pageLoadTimeout.value = setTimeout(() => {
          if (totalPages.value === 0) {
            console.log('Page count timeout reached, trying manual detection')
            // Try manual page detection
            manualPageDetection()
          }
        }, 10000)
      }
    } catch (err) {
      error.value = 'Failed to load PDF file'
      console.error('Error loading PDF:', err)
    } finally {
      isLoading.value = false
    }
  } else {
    error.value = 'Please select a valid PDF file'
  }
}

const loadTestPdf = async () => {
  try {
    console.log('Loading test PDF...')
    isLoading.value = true
    error.value = null
    
    pdfUrl.value = '/test.pdf'
    currentPage.value = 1
    totalPages.value = 0
    
    console.log('Test PDF URL set:', pdfUrl.value)
    console.log('Current page:', currentPage.value)
    console.log('Total pages:', totalPages.value)
    
    // Test if the PDF file is accessible
    try {
      const response = await fetch('/test.pdf')
      console.log('PDF fetch response:', response.status, response.ok)
      if (!response.ok) {
        throw new Error('PDF file not found or not accessible')
      }
      
      console.log('PDF file is accessible, VuePdfEmbed should load it')
      
    } catch (fetchError) {
      console.error('Error fetching PDF:', fetchError)
      error.value = 'Failed to load test PDF'
    }
    
  } catch (error) {
    console.error('Error loading test PDF:', error)
    error.value = 'Failed to load test PDF'
  } finally {
    isLoading.value = false
  }
}

const onPageLoaded = (event) => {
  console.log('Page loaded event:', event)
  console.log('Event type:', typeof event)
  console.log('Event keys:', event ? Object.keys(event) : 'No event')
  
  // If we don't have the total pages count yet, try to get it from the event
  if (totalPages.value === 0) {
    let pageCount = 0
    
    // Try different ways to get page count from the event
    if (event && event.numPages) {
      pageCount = event.numPages
      console.log('Got total pages from event.numPages:', pageCount)
    } else if (event && event.document && event.document.numPages) {
      pageCount = event.document.numPages
      console.log('Got total pages from event.document.numPages:', pageCount)
    } else if (event && event.pdf && event.pdf.numPages) {
      pageCount = event.pdf.numPages
      console.log('Got total pages from event.pdf.numPages:', pageCount)
    } else if (event && event.target && event.target.numPages) {
      pageCount = event.target.numPages
      console.log('Got total pages from event.target.numPages:', pageCount)
    } else if (event && event.pageNumber) {
      // Sometimes the event contains the page number
      console.log('Event contains page number:', event.pageNumber)
      // Try to detect if this is the last page by attempting to load the next page
      if (event.pageNumber === 1) {
        setTimeout(() => {
          // Try to load page 2
          currentPage.value = 2
        }, 1000)
      }
    }
    
    // If we got page count from event, use it
    if (pageCount > 0) {
      totalPages.value = pageCount
      console.log('Total pages set from event:', totalPages.value)
      // Clear timeout since we got the page count
      if (pageLoadTimeout.value) {
        clearTimeout(pageLoadTimeout.value)
        pageLoadTimeout.value = null
      }
    } else {
      console.log('No page count found in event, will try to detect pages dynamically')
      // If no page count found, try to detect by attempting to load page 2
      if (currentPage.value === 1) {
        setTimeout(() => {
          if (totalPages.value === 0) {
            // Try to load page 2 to see if it exists
            currentPage.value = 2
            setTimeout(() => {
              if (totalPages.value === 0) {
                // If still no page count, assume it's a single page PDF
                totalPages.value = 1
                currentPage.value = 1
                console.log('Assuming single page PDF')
                // Clear timeout
                if (pageLoadTimeout.value) {
                  clearTimeout(pageLoadTimeout.value)
                  pageLoadTimeout.value = null
                }
              }
            }, 2000)
          }
        }, 1000)
      }
    }
  }
}

const onPdfError = (error) => {
  console.error('PDF loading error:', error)
  error.value = 'Error loading PDF: ' + (error.message || 'Unknown error')
}

// Manual page detection function
const manualPageDetection = () => {
  console.log('Starting manual page detection...')
  let pageCount = 1
  let maxPages = 100 // Safety limit
  
  const tryPage = (pageNum) => {
    if (pageNum > maxPages) {
      console.log('Reached max pages limit, setting total pages to:', pageCount)
      totalPages.value = pageCount
      currentPage.value = 1
      return
    }
    
    // Try to load the page
    currentPage.value = pageNum
    console.log('Trying to load page:', pageNum)
    
    // Wait a bit and check if the page loaded successfully
    setTimeout(() => {
      // If we're still on the same page, it probably loaded successfully
      if (currentPage.value === pageNum) {
        pageCount = pageNum
        console.log('Page', pageNum, 'loaded successfully, trying next page...')
        tryPage(pageNum + 1)
      } else {
        // Page didn't load, this is probably the end
        console.log('Page', pageNum, 'did not load, total pages:', pageCount)
        totalPages.value = pageCount
        currentPage.value = 1
      }
    }, 1000)
  }
  
  tryPage(1)
}

// Page rendered event handler
const onPageRendered = (event) => {
  console.log('Page rendered event:', event)
  console.log('Current page:', currentPage.value)
  
  // If we don't have total pages yet, try to detect them
  if (totalPages.value === 0) {
    // Try to load the next page to see if it exists
    setTimeout(() => {
      if (totalPages.value === 0) {
        currentPage.value = currentPage.value + 1
        setTimeout(() => {
          if (totalPages.value === 0) {
            // If still no total pages, assume this is the last page
            totalPages.value = currentPage.value - 1
            currentPage.value = 1
            console.log('Detected total pages:', totalPages.value)
            // Clear timeout
            if (pageLoadTimeout.value) {
              clearTimeout(pageLoadTimeout.value)
              pageLoadTimeout.value = null
            }
          }
        }, 2000)
      }
    }, 1000)
  }
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const zoomIn = () => {
  zoom.value = Math.min(zoom.value + 0.25, 3)
  console.log('Zoom in:', zoom.value)
}

const zoomOut = () => {
  zoom.value = Math.max(zoom.value - 0.25, 0.25)
  console.log('Zoom out:', zoom.value)
}

const resetZoom = () => {
  zoom.value = 1
  console.log('Zoom reset to:', zoom.value)
}

// Mobile-specific zoom handling
const handleMobileZoom = (direction) => {
  if (isMobile.value) {
    // Smaller zoom steps for mobile
    const step = 0.15
    if (direction === 'in') {
      zoom.value = Math.min(zoom.value + step, 2.5)
    } else {
      zoom.value = Math.max(zoom.value - step, 0.3)
    }
    console.log('Mobile zoom:', direction, zoom.value)
  } else {
    // Desktop zoom
    if (direction === 'in') {
      zoomIn()
    } else {
      zoomOut()
    }
  }
}

// Initialize keyboard navigation
onMounted(() => {
  
  // Responsive detection
  const checkMobile = () => {
    isMobile.value = window.innerWidth <= 768
    console.log('Screen size changed:', window.innerWidth, 'Mobile:', isMobile.value)
  }
  
  // Initial check
  checkMobile()
  
  // Listen for window resize
  window.addEventListener('resize', checkMobile)
  
  // Keyboard navigation
  const handleKeydown = (e) => {
    if (e.key === 'ArrowLeft') {
      previousPage()
    } else if (e.key === 'ArrowRight') {
      nextPage()
    } else if (e.key === '+') {
      zoomIn()
    } else if (e.key === '-') {
      zoomOut()
    }
  }
  
  window.addEventListener('keydown', handleKeydown)
  
  // Store references for cleanup
  window._pdfViewerResizeHandler = checkMobile
  window._pdfViewerKeydownHandler = handleKeydown
})

// Cleanup on unmount to prevent memory leaks
onUnmounted(() => {
  // Clear timeout if it exists
  if (pageLoadTimeout.value) {
    clearTimeout(pageLoadTimeout.value)
  }
  
  // Remove event listeners
  if (window._pdfViewerResizeHandler) {
    window.removeEventListener('resize', window._pdfViewerResizeHandler)
  }
  if (window._pdfViewerKeydownHandler) {
    window.removeEventListener('keydown', window._pdfViewerKeydownHandler)
  }
  
  // Clean up PDF URL to prevent memory leaks
  if (pdfUrl.value && pdfUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(pdfUrl.value)
  }
  
  console.log('PDF viewer cleanup completed')
})

// Styles are now externalized to CSS files
</script>

<style>
@import '../assets/css/main.css';
@import '../assets/css/components/pdf-viewer.css';
@import '../assets/css/components/mobile.css';
</style>