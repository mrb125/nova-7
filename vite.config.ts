import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',
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
        start_url: '/',
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
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          levels: [
            './src/components/levels/Level01',
            './src/components/levels/Level02',
            './src/components/levels/LevelHintergrund',
            './src/components/levels/Level03',
            './src/components/levels/LevelBestrahlung',
            './src/components/levels/Level04',
            './src/components/levels/Level05',
            './src/components/levels/Level06',
            './src/components/levels/LevelNuklidkarte',
            './src/components/levels/LevelNuklearmedizin',
            './src/components/levels/Level07',
            './src/components/levels/Level08',
            './src/components/levels/LevelC14',
            './src/components/levels/Level09',
            './src/components/levels/LevelStrahlenkrankheit',
            './src/components/levels/Level10',
            './src/components/levels/Level11',
            './src/components/levels/LevelKernspaltung',
            './src/components/levels/LevelAtomkraftwerk',
            './src/components/levels/Level12',
          ],
        },
      },
    },
  },
})
