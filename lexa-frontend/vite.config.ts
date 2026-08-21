import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    // SECURITY: Bind dev server to localhost to prevent network exposure.
    // Use --host flag explicitly if you need network access.
    host: "localhost",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  // SECURITY: Prevent accidental leakage of node environment variables
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
  assetsInclude: ['**/*.glb'],
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-toast',
            '@radix-ui/react-select',
            '@radix-ui/react-scroll-area',
          ],
        },
      },
    },
    // Increase chunk size warning limit since we have heavy 3D deps
    chunkSizeWarningLimit: 800,
    sourcemap: false,
  },
});
