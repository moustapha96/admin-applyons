/* eslint-disable no-dupe-keys */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

const isProd = process.env.NODE_ENV === "production";
const BACKEND_URL = process.env.VITE_BACKEND_URL || 
    (isProd ? 'https://back.applyons.com' : 'http://localhost:5000');

// Configuration du cache pour les assets statiques
const staticAssetsCache = {
    name: 'static-assets',
    handler: 'CacheFirst',
    options: {
        cacheName: 'static-assets-v1',
        expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
        },
        cacheableResponse: {
            statuses: [0, 200]
        }
    }
};

// Configuration du cache pour les API
const apiCache = {
    name: 'api-cache',
    handler: 'NetworkFirst',
    options: {
        cacheName: 'api-cache-v1',
        networkTimeoutSeconds: 10,
        expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 5, // 5 minutes
        },
        cacheableResponse: {
            statuses: [0, 200],
            headers: {
                'x-cacheable': 'true'
            }
        }
    }
};

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff2,woff,ttf}'],
                runtimeCaching: [
                    // Cache des assets statiques
                    {
                        urlPattern: /^https?:\/\/(localhost|www\.applyons\.(com|org))\/.*\.(js|css|json|html|ico|svg|png|jpg|jpeg|gif|webp|woff2?|ttf|eot)$/i,
                        handler: staticAssetsCache.handler,
                        options: staticAssetsCache.options
                    },
                    // Cache des API
                    {
                        urlPattern: new RegExp(`^${BACKEND_URL}/api/`),
                        handler: apiCache.handler,
                        options: {
                            ...apiCache.options,
                            backgroundSync: {
                                name: 'api-queue',
                                options: {
                                    maxRetentionTime: 60 * 24 // 24 heures
                                }
                            }
                        }
                    },
                    // Google Fonts
                    {
                        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts',
                            expiration: {
                                maxEntries: 20,
                                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    }
                ],
                skipWaiting: true,
                clientsClaim: true,
                cleanupOutdatedCaches: true,
                maximumFileSizeToCacheInBytes: 8 * 1024 * 1024, // 8MB
                sourcemap: !isProd,
                mode: isProd ? 'production' : 'development',
                navigateFallback: '/index.html',
                navigateFallbackDenylist: [/^\/api/, /^\/__/],
                // Optimisation des stratégies de précache
                runtimeCaching: [
                    {
                        urlPattern: /^https?:\/\/.*\.(png|jpg|jpeg|svg|gif|webp)$/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'images-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 jours
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /^https?:\/\/.*\.(woff2?|ttf|eot)$/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'fonts-cache',
                            expiration: {
                                maxEntries: 20,
                                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    }
                ]
            },
            manifest: {
                name: 'Applyons',
                short_name: 'Applyons',
                description: 'Plateforme dynamique Applyons',
                theme_color: '#0A2642',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: '/logo-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: '/logo-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: '/logo-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable',
                        platform: 'webapp',
                        target: 'default'
                    }
                ],
                shortcuts: [
                    {
                        name: 'Tableau de bord',
                        short_name: 'Dashboard',
                        description: 'Accéder au tableau de bord',
                        url: '/dashboard',
                        icons: [{ src: '/icons/dashboard-192x192.png', sizes: '192x192' }]
                    }
                ],
                screenshots: [],
                categories: ['business', 'productivity'],
                iarc_rating_id: '',
                prefer_related_applications: false,
                related_applications: [],
                scope_extensions: [],
                id: '/',
                protocol_handlers: [],
                share_target: {
                    action: '/share',
                    method: 'GET',
                    enctype: 'application/x-www-form-urlencoded',
                    params: {
                        title: 'title',
                        text: 'text',
                        url: 'url'
                    }
                },
                edge_side_panel: {
                    preferred_width: 375
                },
                file_handlers: [],
                handle_links: 'preferred',
                launch_handler: {
                    client_mode: ['auto', 'navigate-new', 'navigate-existing']
                },
                new_params: '',
                scope_extensions: []
            },
            devOptions: {
                enabled: !isProd,
                type: 'module',
                navigateFallback: 'index.html',
                suppressWarnings: true,
                webmanifestCache: false
            },
            includeAssets: [
                'favicon.ico',
                'robots.txt',
                'apple-touch-icon.png',
                'safari-pinned-tab.svg',
                'site.webmanifest',
                '**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff2,woff,ttf}'
            ],
            strategies: 'injectManifest',
            srcDir: 'src',
            filename: 'service-worker.js',
            outDir: 'dist',
            base: '/',
            // Activation de la compression des assets
            buildExcludes: [/\/.*\.map$/, /^manifest.*\.js(?:on)?$/],
            // Désactivation du cache pour les fichiers de développement
            disable: !isProd,
            // Activation de la régénération automatique du service worker
            selfDestroying: true,
            // Configuration du mode hors ligne
            workbox: {
                sourcemap: !isProd,
                mode: isProd ? 'production' : 'development',
                cleanupOutdatedCaches: true,
                skipWaiting: true,
                clientsClaim: true,
                navigateFallback: '/index.html',
                runtimeCaching: [
                    {
                        urlPattern: /^https?:\/\/api\.applyons\.com\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            networkTimeoutSeconds: 10,
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 5 // 5 minutes
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                                headers: {
                                    'x-cacheable': 'true'
                                }
                            }
                        }
                    },
                    {
                        urlPattern: /^https?:\/\/.*\.(png|jpg|jpeg|svg|gif|webp)$/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'images',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 jours
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /^https?:\/\/.*\.(woff2?|ttf|eot)$/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'fonts',
                            expiration: {
                                maxEntries: 20,
                                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 jours
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    }
                ]
            },
            // Configuration du manifest
            manifestFilename: 'site.webmanifest',
            // Désactivation du cache pour le développement
            disableDevLogs: true,
            // Configuration des stratégies de mise à jour
            registerType: 'prompt',
            // Activation de la mise à jour automatique
            selfDestroying: false,
            // Configuration du mode développement
            devOptions: {
                enabled: !isProd,
                type: 'module',
                navigateFallback: 'index.html',
                suppressWarnings: true,
                webmanifestCache: false
            },
            // Configuration des stratégies de cache
            strategies: 'generateSW',
            // Configuration des stratégies de mise à jour
            registerType: 'autoUpdate',
            // Désactivation du cache pour les fichiers de développement
            disable: !isProd,
            // Activation de la compression des assets
            buildExcludes: [/\/.*\.map$/, /^manifest.*\.js(?:on)?$/],
            // Configuration du mode hors ligne
            workbox: {
                sourcemap: !isProd,
                mode: isProd ? 'production' : 'development',
                cleanupOutdatedCaches: true,
                skipWaiting: true,
                clientsClaim: true,
                navigateFallback: '/index.html',
                runtimeCaching: [
                    {
                        urlPattern: /^https?:\/\/api\.applyons\.com\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            networkTimeoutSeconds: 10,
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 5 // 5 minutes
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                                headers: {
                                    'x-cacheable': 'true'
                                }
                            }
                        }
                    },
                    {
                        urlPattern: /^https?:\/\/.*\.(png|jpg|jpeg|svg|gif|webp)$/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'images',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 jours
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /^https?:\/\/.*\.(woff2?|ttf|eot)$/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'fonts',
                            expiration: {
                                maxEntries: 20,
                                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 jours
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    }
                ]
            },
            // Configuration du manifest
            manifestFilename: 'site.webmanifest',
            // Désactivation du cache pour le développement
            disableDevLogs: true,
            // Configuration des stratégies de mise à jour
            registerType: 'prompt',
            // Activation de la mise à jour automatique
            selfDestroying: false,
            // Configuration du mode développement
            devOptions: {
                enabled: !isProd,
                type: 'module',
                navigateFallback: 'index.html',
                suppressWarnings: true,
                webmanifestCache: false
            }
        })
    ],
    define: {
        'process.env': process.env,
        'import.meta.env.VITE_BACKEND_URL': JSON.stringify(BACKEND_URL)
    },
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom'],
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
            ],
            define: {
                global: 'globalThis'
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            'stream': 'stream-browserify',
            'util': 'util/'
        }
    },
    build: {
        outDir: '../build-admin',
        assetsDir: 'static',
        emptyOutDir: true,
        sourcemap: !isProd,
        minify: isProd ? 'terser' : false,
        terserOptions: {
            compress: {
                drop_console: isProd,
                drop_debugger: isProd
            }
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    ui: ['antd', '@ant-design/icons'],
                    utils: ['lodash', 'moment', 'axios']
                },
                entryFileNames: `static/js/[name].[hash].js`,
                chunkFileNames: `static/js/[name].[hash].js`,
                assetFileNames: `static/[ext]/[name].[hash].[ext]`
            }
        },
        chunkSizeWarningLimit: 1000,
        assetsInlineLimit: 4096,
        cssCodeSplit: true,
        reportCompressedSize: false,
        commonjsOptions: {
            transformMixedEsModules: true
        }
    },
    server: {
        host: '0.0.0.0',
        port: 3000,
        open: true,
        strictPort: true,
        fs: {
            strict: true,
            allow: ['..']
        },
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
        },
        proxy: {
            '^/api': {
                target: BACKEND_URL,
                changeOrigin: true,
                secure: false,
                ws: true,
                configure: (proxy, _options) => {
                    proxy.on('error', (err, _req, _res) => {
                        console.error('Proxy error:', err);
                    });
                    proxy.on('proxyReq', (proxyReq, req, _res) => {
                        console.log('Sending Request to the Target:', req.method, req.url);
                    });
                    proxy.on('proxyRes', (proxyRes, req, _res) => {
                        console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
                    });
                }
            },
            '^/profiles': {
                target: BACKEND_URL,
                changeOrigin: true,
                secure: false
            },
            '^/settings': {
                target: BACKEND_URL,
                changeOrigin: true,
                secure: false
            },
            '^/documents': {
                target: BACKEND_URL,
                changeOrigin: true,
                secure: false
            },
            '^/uploads': {
                target: BACKEND_URL,
                changeOrigin: true,
                secure: false
            },
            '^/socket.io': {
                target: BACKEND_URL,
                ws: true,
                changeOrigin: true
            }
        }
    },
});