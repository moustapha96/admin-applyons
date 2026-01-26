import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    server: {
        host: '0.0.0.0',
        port: 3000,
        proxy: {
            '^/api': {
                target: BACKEND_URL,
                changeOrigin: true,
            },
            '^/profiles': {
                target: BACKEND_URL,
                changeOrigin: true,
            },
            '^/settings': {
                target: BACKEND_URL,
                changeOrigin: true,
            },
            '^/documents': {
                target: BACKEND_URL,
                changeOrigin: true,
            },
            '^/uploads': {
                target: BACKEND_URL,
                changeOrigin: true,
            },
            '^/socket.io': {
                target: BACKEND_URL,
                ws: true,
                changeOrigin: true,
            },
        },
    },
    build: {
        outDir: '../admin.applyons.com',
    },
});