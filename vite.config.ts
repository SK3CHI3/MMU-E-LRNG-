import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
// Temporarily disabled VitePWA to fix infinite reload loops
// import { VitePWA } from 'vite-plugin-pwa';
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins: PluginOption[] = [
    react(),
    // Temporarily disabled VitePWA to fix infinite reload loops in production
    // The service worker was causing automatic reloads on deployment
    // VitePWA({
    //   registerType: 'prompt',
    //   includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
    //   manifest: false, // Use the existing manifest.json file
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
    //     maximumFileSizeToCacheInBytes: 5000000, // 5MB
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/.*\.supabase\.co\//,
    //         handler: 'NetworkFirst',
    //         options: {
    //           cacheName: 'api-cache',
    //           networkTimeoutSeconds: 10,
    //           cacheableResponse: {
    //             statuses: [0, 200]
    //           }
    //         }
    //       },
    //       {
    //         urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
    //         handler: 'StaleWhileRevalidate',
    //         options: {
    //           cacheName: 'google-fonts-stylesheets'
    //         }
    //       },
    //       {
    //         urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'google-fonts-webfonts',
    //           expiration: {
    //             maxEntries: 30,
    //             maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
    //           }
    //         }
    //       }
    //     ],
    //     skipWaiting: false, // Let our code handle this manually for better UX
    //     clientsClaim: false, // Let our code handle this manually
    //     cleanupOutdatedCaches: true,
    //     // Add version-based cache invalidation
    //     additionalManifestEntries: [
    //       {
    //         url: '/manifest.json',
    //         revision: null
    //       }
    //     ],
    //     // Import custom service worker extensions
    //     importScripts: ['/sw-custom.js']
    //   },
    //   devOptions: {
    //     enabled: true,
    //     type: 'module'
    //   }
    // })
  ];

  // Only load lovable-tagger in development mode
  if (mode === 'development') {
    try {
      const { componentTagger } = await import("lovable-tagger");
      plugins.push(componentTagger());
    } catch (error) {
      console.warn("lovable-tagger not available, skipping...");
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      // Optimize build for production
      target: 'esnext',
      minify: 'terser',
      sourcemap: false,

      // Chunk splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
            supabase: ['@supabase/supabase-js'],
            router: ['react-router-dom'],
            charts: ['recharts'],
            utils: ['date-fns', 'clsx', 'tailwind-merge']
          },
          // Optimize asset naming
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || [];
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[ext]/[name]-[hash][extname]`;
          }
        }
      },

      // Terser options for better compression
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: true,
        },
      },

      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
    },

    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@supabase/supabase-js',
        'date-fns',
        'recharts'
      ],
    },

    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
  };
});
