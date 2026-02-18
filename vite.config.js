import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Plugin : injecte un timestamp dans index.html pour invalider le cache à chaque build
function noCacheIndexPlugin() {
    return {
        name: 'no-cache-index',
        transformIndexHtml(html) {
            const comment = `<!-- build: ${Date.now()} -->`;
            return html.replace('</head>', `${comment}\n</head>`);
        },
    };
}

export default defineConfig({
    plugins: [react(), noCacheIndexPlugin()],
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
            '^/passport': {
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
        rollupOptions: {
            output: {
                entryFileNames: 'assets/[name]-[hash].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash][extname]',
            },
        },
        // Chaque build produit des noms de fichiers uniques (hash) = pas de cache obsolète
    },
});