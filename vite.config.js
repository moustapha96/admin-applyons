/* eslint-disable no-dupe-keys */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

const isProd = process.env.NODE_ENV === "production";

// URL du backend adaptative selon l'environnement
const backendUrl = process.env.VITE_BACKEND_URL || 
    (isProd ? 'https://back.applyons.com' : 'http://localhost:5000');

export default defineConfig({
    plugins: [
        react(),
        // PWA désactivé pour éviter le cache
        // VitePWA({
        //     registerType: "autoUpdate",
        //     devOptions: {
        //         enabled: !isProd,
        //     },
        //     includeAssets: [
        //         "favicon.svg",
        //         "apple-touch-icon.png",
        //         "robots.txt",
        //         "logo-color.svg",
        //         "logo.png"
        //     ],
        //     workbox: {
        //         globPatterns: ["**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff2}"],
        //         runtimeCaching: [{
        //                 urlPattern: /^https:\/\/www\.applyons\.org\/.*\.(png|jpg|jpeg|svg|webp|ico|woff2?)$/i,
        //                 handler: "StaleWhileRevalidate",
        //                 options: {
        //                     cacheName: "applyons-image-assets",
        //                     expiration: {
        //                         maxEntries: 60,
        //                         maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
        //                     },
        //                 },
        //             },
        //             {
        //                 urlPattern: /^https:\/\/fonts\.googleapis\.com/,
        //                 handler: "StaleWhileRevalidate",
        //                 options: {
        //                     cacheName: "google-fonts-stylesheets",
        //                 },
        //             },
        //             {
        //                 urlPattern: /^https:\/\/fonts\.gstatic\.com/,
        //                 handler: "CacheFirst",
        //                 options: {
        //                     cacheName: "google-fonts-webfonts",
        //                     expiration: {
        //                         maxEntries: 20,
        //                         maxAgeSeconds: 365 * 24 * 60 * 60, // 1 an
        //                     },
        //                 },
        //             },
        //         ],
        //         navigateFallback: "/index.html",
        //         maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        //     },
        //     manifest: {
        //         name: "applyons",
        //         short_name: "applyons",
        //         description: "Plateforme dynamique de applyons",
        //         start_url: "/",
        //         scope: "/",
        //         display: "standalone",
        //         orientation: "portrait",
        //         background_color: "#ffffff",
        //         theme_color: "#0A2642",
        //         icons: [{
        //                 src: "/logo-200x200.png",
        //                 sizes: "200x200",
        //                 type: "image/png",
        //                 purpose: "any maskable"
        //             },
        //             {
        //                 src: "/logo-500x500.png",
        //                 sizes: "500x500",
        //                 type: "image/png",
        //                 purpose: "any maskable"
        //             }
        //         ]
        //     }
        // })
    ],
    define: {
        global: 'window'
    },
    optimizeDeps: {
        exclude: [
            '@fullcalendar/core',
            '@fullcalendar/daygrid',
            '@fullcalendar/timegrid',
            '@fullcalendar/react',
        ],
        esbuildOptions: {
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    process: true,
                    buffer: true
                })
            ]
        }
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    build: {
        outDir: "../build-admin/", // dossier de build spécifique à applyons
        assetsDir: "assets",
        emptyOutDir: true,
        sourcemap: !isProd,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ["react", "react-dom", "react-router-dom"],
                    ui: ["antd"],
                },
                // Ajouter un hash pour éviter le cache du navigateur
                entryFileNames: `assets/[name]-[hash].js`,
                chunkFileNames: `assets/[name]-[hash].js`,
                assetFileNames: `assets/[name]-[hash].[ext]`,
            },
        },
        minify: "terser",
        terserOptions: {
            compress: {
                drop_console: isProd,
            },
        },
        chunkSizeWarningLimit: 1000,
    },
    server: {
        host: true,
        port: 3000,
        open: true,
        // Headers pour désactiver le cache en développement
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        },
        proxy: {
            '/api': {
                target: backendUrl,
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
            '/profiles': {
                target: backendUrl,
                changeOrigin: true,
                secure: false,
            },
            '/settings': {
                target: backendUrl,
                changeOrigin: true,
                secure: false,
            },
            '/documents': {
                target: backendUrl,
                changeOrigin: true,
                secure: false,
            },
        },
    },
});