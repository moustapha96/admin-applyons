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
        VitePWA({
            registerType: "autoUpdate",
            devOptions: {
                enabled: true,
                type: "module",
            },
            includeAssets: [
                "favicon.svg",
                "apple-touch-icon.png",
                "robots.txt",
                "logo-color.svg",
                "logo.png"
            ],
            workbox: {
                // Stratégie NetworkFirst pour éviter la rétention de cache
                globPatterns: ["**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff2}"],
                // Désactiver le cache des fichiers statiques en production
                skipWaiting: true,
                clientsClaim: true,
                // Utiliser NetworkFirst pour toujours vérifier les mises à jour
                runtimeCaching: [
                    {
                        // Pour les images externes, utiliser NetworkFirst avec cache court
                        urlPattern: /^https:\/\/www\.applyons\.org\/.*\.(png|jpg|jpeg|svg|webp|ico|woff2?)$/i,
                        handler: "NetworkFirst",
                        options: {
                            cacheName: "applyons-image-assets",
                            expiration: {
                                maxEntries: 20,
                                maxAgeSeconds: 24 * 60 * 60, // 1 jour seulement
                            },
                            networkTimeoutSeconds: 10,
                        },
                    },
                    {
                        // Fonts Google avec cache minimal
                        urlPattern: /^https:\/\/fonts\.googleapis\.com/,
                        handler: "NetworkFirst",
                        options: {
                            cacheName: "google-fonts-stylesheets",
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 jours
                            },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com/,
                        handler: "NetworkFirst",
                        options: {
                            cacheName: "google-fonts-webfonts",
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 jours
                            },
                        },
                    },
                ],
                navigateFallback: "/index.html",
                navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
                // Limiter la taille du cache
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB au lieu de 10MB
                // Nettoyer les anciens caches
                cleanupOutdatedCaches: true,
            },
            manifest: {
                name: "applyons",
                short_name: "applyons",
                description: "Plateforme dynamique de applyons",
                start_url: "/",
                scope: "/",
                display: "standalone",
                orientation: "portrait",
                background_color: "#ffffff",
                theme_color: "#0A2642",
                icons: [{
                        src: "/logo-200x200.png",
                        sizes: "200x200",
                        type: "image/png",
                        purpose: "any maskable"
                    },
                    {
                        src: "/logo-500x500.png",
                        sizes: "500x500",
                        type: "image/png",
                        purpose: "any maskable"
                    }
                ]
            }
        })
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
                // Hash long pour forcer les mises à jour et éviter le cache
                entryFileNames: `assets/[name]-[hash:8].js`,
                chunkFileNames: `assets/[name]-[hash:8].js`,
                assetFileNames: `assets/[name]-[hash:8].[ext]`,
            },
        },
        minify: "terser",
        terserOptions: {
            compress: {
                drop_console: isProd,
            },
        },
        chunkSizeWarningLimit: 1000,
        // Désactiver le cache du build
        assetsInlineLimit: 0,
    },
    server: {
        host: true,
        port: 3000,
        open: true,
        // Headers pour désactiver complètement le cache
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Last-Modified': new Date().toUTCString(),
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