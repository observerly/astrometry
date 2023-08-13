/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/typescript-vite-template
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

/// <reference types="vitest" />

/*****************************************************************************************************************/

import { defineConfig } from 'vite'

import typescript from '@rollup/plugin-typescript'

import { resolve } from 'path'

/*****************************************************************************************************************/

export default defineConfig({
  test: {
    watch: false,
    setupFiles: ['./tests/setup.ts'],
    passWithNoTests: true,
    threads: false
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json'
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, '/src')
    }
  },
  build: {
    outDir: './dist',
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/index.ts'),
      name: '@observerly/typescript-vite-template',
      // the proper extensions will be added
      fileName: 'typescript-vite-template'
    },
    rollupOptions: {
      external: ['./playground/*.ts'],
      output: {
        sourcemap: true
      }
    }
  }
})

/*****************************************************************************************************************/