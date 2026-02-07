import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('react-toastify')) {
              return 'ui-vendor';
            }
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'form-vendor';
            }
            // Other node_modules go into vendor chunk
            return 'vendor';
          }
          // Large page chunks
          if (id.includes('PostCampaign') || id.includes('CampaignDetailInfluencer')) {
            return 'campaign-pages';
          }
          if (id.includes('InfluencerDetail')) {
            return 'influencer-pages';
          }
          if (id.includes('BrandDetail')) {
            return 'brand-pages';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB
  },
})
