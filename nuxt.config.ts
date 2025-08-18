// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: [],
  modules: [],
  components: true,
  app: {
    head: {
      title: 'PDF Viewer - Vue 3 Nuxt 3',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A modern PDF viewer built with Vue 3 and Nuxt 3' }
      ]
    }
  },
  vite: {
    optimizeDeps: {
      include: ['vue-pdf-embed', 'pdfjs-dist']
    }
  },
  ssr: false
})
