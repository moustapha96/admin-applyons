import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import path from 'path';

const isProd = process.env.NODE_ENV === "production";
const BACKEND_URL = process.env.VITE_BACKEND_URL || (isProd ? 'https://back.applyons.com' : 'http://localhost:5000');

export default defineConfig({
    plugins: [
        react({
            jsxRuntime: 'automatic',
            jsxImportSource: 'react',
        }),
    ],
    define: {
        'import.meta.env.VITE_BACKEND_URL': JSON.stringify(BACKEND_URL),
    },
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react/jsx-runtime',
            'react-router-dom',
            'antd',
            'recharts',
            'apexcharts',
            'chart.js',
            'echarts',
        ],
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
                    buffer: true,
                }),
            ],
            define: {
                global: 'globalThis',
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            'stream': 'stream-browserify',
            'util': 'util/',
        },
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
                drop_debugger: isProd,
            },
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    // Regrouper les dépendances React et les bibliothèques associées
                    vendor_react: [
                        'react',
                        'react-dom',
                        'react/jsx-runtime',
                        'react-router-dom',
                        'antd',
                        'recharts',
                        'apexcharts',
                        'chart.js',
                        'echarts',
                    ],
                    // Regrouper les autres dépendances
                    vendor_utils: [
                        'lodash',
                        'axios',
                        'moment',
                    ],
                },
                entryFileNames: isProd ? `static/js/[name].[hash].js` : `static/js/[name].js`,
                chunkFileNames: isProd ? `static/js/[name].[hash].js` : `static/js/[name].js`,
                assetFileNames: isProd ? `static/[ext]/[name].[hash].[ext]` : `static/[ext]/[name].[ext]`,
            },
        },
        chunkSizeWarningLimit: 1000,
        assetsInlineLimit: 4096,
        cssCodeSplit: true,
    },
    server: {
        host: '0.0.0.0',
        port: 3000,
        open: true,
        strictPort: true,
        fs: {
            strict: true,
            allow: ['..'],
        },
        proxy: {
            '^/api': {
                target: BACKEND_URL,
                changeOrigin: true,
                secure: false,
                ws: true,
            },
            '^/profiles': {
                target: BACKEND_URL,
                changeOrigin: true,
                secure: false,
            },
            '^/settings': {
                target: BACKEND_URL,
                changeOrigin: true,
                secure: false,
            },
            '^/documents': {
                target: BACKEND_URL,
                changeOrigin: true,
                secure: false,
            },
            '^/uploads': {
                target: BACKEND_URL,
                changeOrigin: true,
                secure: false,
            },
            '^/socket.io': {
                target: BACKEND_URL,
                ws: true,
                changeOrigin: true,
            },
        },
    },
});
