# PDF Viewer - Vue 3 Nuxt 3

A modern, polished PDF viewer built with Vue 3 and Nuxt 3, featuring a two-page desktop layout with smooth flip animations and responsive design.

## Features

- 📄 **PDF Upload & Viewing**: Upload and view PDF files with high-quality rendering
- 📖 **Two-Page Layout**: Desktop view shows two pages side by side for better reading experience
- 🎭 **Flip Animations**: Smooth page flip animations when navigating
- 🔍 **Zoom Controls**: Zoom in/out functionality with percentage display
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⌨️ **Keyboard Navigation**: Use arrow keys to navigate pages
- 🎨 **Modern UI**: Beautiful gradient design with smooth transitions
- 📋 **Page Navigation**: Jump to specific pages or use thumbnail navigation
- 🎛️ **Collapsible Sidebar**: Toggle sidebar for more viewing space
- 🧪 **Test PDF**: Built-in test PDF for immediate demonstration

## Quick Start

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher (or yarn 1.22.0+)
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Installation

1. **Clone or download this project**
   ```bash
   git clone <repository-url>
   cd pdf-viewer-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## Available Commands

### Development
```bash
npm run dev          # Start development server with hot reload
npm run dev -- --host # Start with network access (for mobile testing)
```

### Build & Production
```bash
npm run build        # Build for production
npm run generate     # Generate static site
npm run preview      # Preview production build locally
```

### Maintenance
```bash
npm run postinstall  # Prepare Nuxt (runs automatically after npm install)
```

## Architecture

### Technology Stack
- **Frontend Framework**: Vue 3 (Composition API)
- **Full-Stack Framework**: Nuxt 3
- **PDF Rendering**: vue-pdf-embed + pdfjs-dist
- **Styling**: CSS3 with custom properties
- **Build Tool**: Vite (via Nuxt)
- **Package Manager**: npm

### Project Structure
```
pdf-viewer-app/
├── app/
│   └── app.vue              # Main application component (521 lines)
├── assets/
│   └── css/
│       ├── main.css         # Global styles and variables
│       └── components/
│           ├── mobile.css   # Mobile-specific styles
│           └── pdf-viewer.css # PDF viewer component styles
├── components/
│   └── PdfPage.vue          # Individual PDF page component (149 lines)
├── public/
│   └── test.pdf            # Sample PDF for testing
├── nuxt.config.ts          # Nuxt configuration
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

### Key Components

#### App.vue (Main Component)
- **State Management**: Uses Vue 3 Composition API with reactive refs
- **PDF Handling**: File upload, URL creation, page management
- **Responsive Logic**: Mobile/desktop layout switching
- **Navigation**: Page controls, zoom, keyboard shortcuts
- **Error Handling**: Comprehensive error states and recovery

#### PdfPage.vue (Page Component)
- **PDF Rendering**: Wraps vue-pdf-embed for individual pages
- **Loading States**: Loading spinners and error handling
- **Animations**: Flip animations for page transitions
- **Responsive**: Mobile-optimized scaling

### CSS Architecture
- **Modular Structure**: Separated by component and device type
- **Custom Properties**: CSS variables for theming
- **Responsive Design**: Mobile-first approach with breakpoints
- **Animations**: CSS transitions and keyframes for smooth UX

## Configuration

### Nuxt Configuration (nuxt.config.ts)
```typescript
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,  // Client-side only for PDF handling
  vite: {
    optimizeDeps: {
      include: ['vue-pdf-embed', 'pdfjs-dist']
    }
  }
})
```

### Key Configuration Decisions
- **SSR Disabled**: PDF.js requires client-side execution
- **Vite Optimization**: Pre-bundles PDF libraries for performance
- **DevTools Enabled**: Enhanced development experience

## Trade-offs & Design Decisions

### Performance Optimizations
- ✅ **Lazy Loading**: Pages load on-demand
- ✅ **Memory Management**: URL.revokeObjectURL() for cleanup
- ✅ **Responsive Images**: Different scaling for mobile/desktop
- ⚠️ **Bundle Size**: PDF.js adds ~2MB to bundle

### User Experience
- ✅ **Progressive Enhancement**: Works without JavaScript for basic viewing
- ✅ **Accessibility**: ARIA labels, keyboard navigation
- ✅ **Error Recovery**: Graceful error handling with retry options
- ⚠️ **Initial Load**: PDF.js library takes time to initialize

### Technical Decisions
- ✅ **Vue 3 Composition API**: Better TypeScript support, smaller bundle
- ✅ **Nuxt 3**: Modern framework with excellent DX
- ✅ **vue-pdf-embed**: Simplified PDF integration
- ⚠️ **Client-side Only**: No SSR support for PDF viewing

## Known Limitations

### Browser Support
- **Required**: Modern browsers with ES2020+ support
- **PDF.js Dependencies**: Web Workers, Canvas API, File API
- **Mobile**: iOS Safari 14+, Android Chrome 90+

### Feature Limitations
- **Annotations**: No built-in annotation support
- **Search**: No text search functionality
- **Printing**: Relies on browser print functionality
- **Forms**: PDF forms not fully supported
- **Digital Signatures**: Not validated

### Performance Considerations
- **Page Count**: Very large PDFs (>1000 pages) may be slow
- **Image-heavy PDFs**: May cause rendering delays
- **Memory Usage**: Each page consumes memory until garbage collection
- **Network**: Large PDFs require good connection for upload

## Development Guidelines

### Code Style
- **Vue 3 Composition API**: Use `<script setup>` syntax
- **TypeScript**: Optional but recommended
- **CSS**: BEM methodology for component styles
- **Comments**: JSDoc for complex functions
