import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-tabs', '@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-popover'],
          'chart-vendor': ['recharts'],
          'utils-vendor': ['date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority'],
          // Separate dashboard components into their own chunk
          'dashboard-components': [
            '/src/components/dashboard/SessionsSection',
            '/src/components/dashboard/SalesAnalyticsSection', 
            '/src/components/dashboard/EnhancedDiscountsDashboard'
          ]
        }
      }
    },
    // Increase chunk size warning limit since we're optimizing chunks
    chunkSizeWarningLimit: 1000
  },
  // Enable performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'recharts', 'date-fns'],
  }
}));
