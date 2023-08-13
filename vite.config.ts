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
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        abberation: resolve(__dirname, 'src/abberation.ts')
      },
      name: '@observerly/astrometry'
    },
    rollupOptions: {
      external: ['./playground/*.ts'],
      input: {
        index: resolve(__dirname, 'src/index.ts'),
        abberation: resolve(__dirname, 'src/abberation.ts')
      },
      output: {
        preserveModules: false,
        sourcemap: true
      }
    }
  }
})

/*****************************************************************************************************************/
