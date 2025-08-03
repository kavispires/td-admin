import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import commonjs from 'vite-plugin-commonjs';
import svgr from 'vite-plugin-svgr';
import vitetsConfigPaths from 'vite-tsconfig-paths';
import checker from 'vite-plugin-checker';

export default defineConfig({
  base: '/td-admin/',
  plugins: [
    react(),
    vitetsConfigPaths(),
    commonjs(),
    svgr({
      include: [
        'src/**/*.svg',
      ],
    }),
    checker({
      typescript: {
        tsconfigPath: 'tsconfig.json',
        buildMode: false,
      },
    }),
  ],
  server: {
    open: true, // automatically open the app in the browser
    port: 3001,
  },
  resolve: {
    alias: {
      screens: path.resolve(__dirname, './src/screens'),
      'styles': path.resolve(__dirname, 'src/styles'),
      // Add aliases for rc-util to avoid issues with module resolution (antd dependency)
      'rc-util': path.resolve(__dirname, './node_modules/rc-util'),
      'rc-util/es': path.resolve(__dirname, './node_modules/rc-util/es'),
      'rc-util/lib': path.resolve(__dirname, './node_modules/rc-util/lib'),
    },
  },
  build: {
    outDir: 'build',
  },
});
