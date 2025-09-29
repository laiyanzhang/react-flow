import react from '@vitejs/plugin-react';
/* eslint import/no-nodejs-modules: ["error", {"allow": ["path"]}] */
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv } from 'vite';
import viteCompression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const baseURL = env.VITE_API_BASE_URL;

  return {
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    baseURL,
    resolve: {
      alias: [
        { find: /^~/, replacement: '' },
        { find: '@', replacement: path.join(__dirname, 'src') },
      ],
    },
    server: {
      port: 2001,
      proxy: {
        '/user-server': {
          target: `https://gapi-test.idealead.com/`,
          // target: `https://gapi.idealead.com/`,
          changeOrigin: true,
        },
        '/api': {
          target: `https://gapi-test.idealead.com/game-ai-editor-center/`,
          // target: `https://gapi.idealead.com/game-ai-editor-center/`,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, ''),
        },
      },
      host: true,
    },
    css: {
      preprocessorOptions: {
        less: {
          additionalData: (content, loaderContext) => {
            // 只对非 CSS Module 文件全局注入
            if (!loaderContext.includes('.module.less')) {
              return `@import "@/styles/_variables.less";`;
            }
            return content;
          },
          javascriptEnabled: true,
        },
      },
    },
    plugins: [
      react(),
      viteCompression({
        verbose: true,
        algorithm: 'brotliCompress',
        ext: '.br',
        deleteOriginFile: false,
      }),
      visualizer({
        open: false,
        // template (string, default treemap) - sunburst, treemap, network, raw-data, list, flamegraph
        gzipSize: true,
        brotliSize: true,
      }),
      // 生成打包体积分析报告
    ],
    build: {
      chunkSizeWarningLimit: 1500, // 调高至 10500KB
      treeshake: {
        preset: 'recommended',
        manualPureFunctions: ['styled', 'local', 'console.log'],
      },
      sourcemap: false,
      rollupOptions: {
        output: {
          experimentalMinChunkSize: 100_000,
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          manualChunks(id) {
            if (id.includes('node_modules/refractor')) {
              return 'refractor';
            }

            if (id.includes('node_modules/katex')) {
              return 'katex';
            }
          },
        },
      },
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'react-router-dom',
          '@tanstack/react-router',
          'zustand',
          'antd',
          'framer-motion',
          'fetch',
        ],
      },
      esbuild: {
        drop: mode === 'production' ? ['console', 'debugger'] : [],
      },
    },
  };
});
