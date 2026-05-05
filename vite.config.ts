import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // './' damit Assets auch in Subdirs (z.B. mrbl.4lima.de/nova-7/) auflösen
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['avatars/*.png', 'scenes/*.jpg', 'intro.mp4'],
      manifest: {
        name: 'U.S.S. Blankenagel — Radioaktivität',
        short_name: 'nova-7',
        description: 'Interaktives Lernspiel zu Radioaktivität und Kernphysik',
        theme_color: '#060d1f',
        background_color: '#060d1f',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        icons: [
          { src: 'vite.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'vite.svg', sizes: '512x512', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg}'],
        runtimeCaching: [
          {
            urlPattern: /\.mp4$/,
            handler: 'CacheFirst',
            options: { cacheName: 'videos', expiration: { maxEntries: 2 } },
          },
        ],
      },
    }),
  ],
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        // Automatisches Chunking by-path — kein Pflegen einer Level-Liste mehr nötig.
        // Neue Levels werden ohne Config-Änderung in den richtigen Chunk gepackt.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'motion'
            if (id.includes('react-router')) return 'router'
            if (id.includes('react') || id.includes('scheduler')) return 'vendor'
            return 'deps'
          }
          if (id.includes('/components/levels/')) return 'levels'
          if (id.includes('/components/minigames/')) return 'minigames'
          if (id.includes('/pages/Teacher')) return 'teacher'
        },
      },
    },
  },
})
