import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import path from 'path';

const isProd = process.env.NODE_ENV === "production";
const BACKEND_URL = process.env.VITE_BACKEND_URL || 
    (isProd ? 'https://back.applyons.com' : 'http://localhost:5000');

export default defineConfig({
    plugins: [
        react()
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
                // En développement, pas de hash pour éviter le cache
                entryFileNames: isProd ? `static/js/[name].[hash].js` : `static/js/[name].js`,
                chunkFileNames: isProd ? `static/js/[name].[hash].js` : `static/js/[name].js`,
                assetFileNames: isProd ? `static/[ext]/[name].[hash].[ext]` : `static/[ext]/[name].[ext]`
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
