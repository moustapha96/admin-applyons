import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import path from 'path';

const isProd = process.env.NODE_ENV === "production";
const BACKEND_URL = process.env.VITE_BACKEND_URL ||
    (isProd ? 'https://back.applyons.com' : 'http://localhost:5000');

export default defineConfig({
    plugins: [
        react({
            jsxRuntime: 'automatic',
            jsxImportSource: 'react'
        })
    ],
    define: {
        // 'process.env': process.env,
        'import.meta.env.VITE_BACKEND_URL': JSON.stringify(BACKEND_URL)
    },
    optimizeDeps: {
        include: ['react', 'react-dom', 'react/jsx-runtime', 'react-router-dom', 'antd'],
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
        // rollupOptions: {
        //     output: {
        //         manualChunks: {
        //             vendor: ['react', 'react-dom', 'react-router-dom'],
        //             ui: ['antd', '@ant-design/icons'],
        //             utils: ['lodash', 'moment', 'axios']
        //         },
        //         // En développement, pas de hash pour éviter le cache
        //         entryFileNames: isProd ? `static/js/[name].[hash].js` : `static/js/[name].js`,
        //         chunkFileNames: isProd ? `static/js/[name].[hash].js` : `static/js/[name].js`,
        //         assetFileNames: isProd ? `static/[ext]/[name].[hash].[ext]` : `static/[ext]/[name].[ext]`
        //     }
        // },
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // 1) Tout ce qui vient de node_modules : on découpe intelligemment
                    if (id.includes("node_modules")) {

                        // SOLUTION DÉFINITIVE: Mettre TOUS les packages React dans le même chunk
                        // Cela garantit que React est toujours disponible avant qu'ils ne soient utilisés
                        
                        // React core (doit être en premier)
                        if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("react/jsx-runtime")) {
                            return "vendor_react";
                        }
                        
                        // Tous les packages qui dépendent de React (doivent être dans vendor_react)
                        if (
                            id.includes("react-router") || 
                            id.includes("react-router-dom") ||
                            id.includes("react-i18next") ||
                            id.includes("react-quill") ||
                            id.includes("react-icons") ||
                            id.includes("react-feather") ||
                            id.includes("react-apexcharts") ||
                            id.includes("react-countup") ||
                            id.includes("react-simple-maps") ||
                            id.includes("react-icons") ||
                            id.includes("@fullcalendar/react") ||
                            id.includes("simplebar-react") ||
                            id.includes("tiny-slider-react") ||
                            id.includes("yet-another-react-lightbox") ||
                            id.includes("@paypal/react-paypal-js") ||
                            id.includes("@stripe/react-stripe-js") ||
                            id.includes("@uiw/react-md-editor") ||
                            id.includes("antd") || 
                            id.includes("@ant-design")
                        ) {
                            return "vendor_react";
                        }

                        // Dates (moment est lourd, dayjs aussi selon plugins)
                        if (id.includes("moment") || id.includes("dayjs")) return "vendor_dates";

                        // Utils / HTTP
                        if (id.includes("lodash")) return "vendor_lodash";
                        if (id.includes("axios")) return "vendor_http";

                        // Charts (si tu en as)
                        if (id.includes("recharts") || id.includes("chart.js") || id.includes("echarts") || id.includes("apexcharts"))
                            return "vendor_charts";

                        // Editors (si tu en as)
                        if (id.includes("quill") || id.includes("draft-js") || id.includes("slate") || id.includes("ckeditor") || id.includes("tinymce"))
                            return "vendor_editor";

                        // PDF / docs (si tu en as)
                        if (id.includes("pdfjs-dist") || id.includes("jspdf") || id.includes("pdf-lib") || id.includes("docx"))
                            return "vendor_docs";

                        // Firebase (si tu en as)
                        if (id.includes("firebase")) return "vendor_firebase";

                        // Fallback : tout le reste des dépendances
                        return "vendor_misc";
                    }
                },

                // Tes noms de fichiers (inchangés)
                entryFileNames: isProd ? `static/js/[name].[hash].js` : `static/js/[name].js`,
                chunkFileNames: isProd ? `static/js/[name].[hash].js` : `static/js/[name].js`,
                assetFileNames: isProd ? `static/[ext]/[name].[hash].[ext]` : `static/[ext]/[name].[ext]`,
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
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Last-Modified': new Date().toUTCString(),
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
