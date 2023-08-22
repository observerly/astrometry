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
    env: {
      TZ: 'UTC'
    },
    watch: false,
    setupFiles: ['./tests/setup.ts'],
    passWithNoTests: true,
    threads: false
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true
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
        abberation: resolve(__dirname, 'src/abberation.ts'),
        astrometry: resolve(__dirname, 'src/astrometry.ts'),
        common: resolve(__dirname, 'src/common.ts'),
        constants: resolve(__dirname, 'src/constants.ts'),
        coordinates: resolve(__dirname, 'src/coordinates'),
        earth: resolve(__dirname, 'src/earth.ts'),
        epoch: resolve(__dirname, 'src/epoch.ts'),
        moon: resolve(__dirname, 'src/moon.ts'),
        nutation: resolve(__dirname, 'src/nutation.ts'),
        precession: resolve(__dirname, 'src/precession.ts'),
        refraction: resolve(__dirname, 'src/refraction.ts'),
        seeing: resolve(__dirname, 'src/seeing.ts'),
        sun: resolve(__dirname, 'src/sun.ts')
      },
      name: '@observerly/astrometry'
    },
    rollupOptions: {
      external: ['./playground/*.ts'],
      input: {
        index: resolve(__dirname, 'src/index.ts'),
        abberation: resolve(__dirname, 'src/abberation.ts'),
        astrometry: resolve(__dirname, 'src/astrometry.ts'),
        common: resolve(__dirname, 'src/common.ts'),
        constants: resolve(__dirname, 'src/constants.ts'),
        coordinates: resolve(__dirname, 'src/coordinates'),
        earth: resolve(__dirname, 'src/earth.ts'),
        epoch: resolve(__dirname, 'src/epoch.ts'),
        moon: resolve(__dirname, 'src/moon.ts'),
        nutation: resolve(__dirname, 'src/nutation.ts'),
        precession: resolve(__dirname, 'src/precession.ts'),
        refraction: resolve(__dirname, 'src/refraction.ts'),
        seeing: resolve(__dirname, 'src/seeing.ts'),
        sun: resolve(__dirname, 'src/sun.ts')
      },
      output: {
        preserveModules: false,
        sourcemap: true
      }
    }
  }
})

/*****************************************************************************************************************/
