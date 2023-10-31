/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/typescript-vite-template
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

/// <reference types="vitest" />

/*****************************************************************************************************************/

import { defineConfig, type UserConfig } from 'vite'

import typescript from '@rollup/plugin-typescript'

import { resolve } from 'path'

/*****************************************************************************************************************/

const modules = [
  'abberation',
  'astrometry',
  'common',
  'constants',
  'constellations',
  'coordinates',
  'earth',
  'ecliptic',
  'epoch',
  'galactic',
  'humanize',
  'moon',
  'night',
  'nutation',
  'observation',
  'orbit',
  'planets',
  'precession',
  'projection',
  'refraction',
  'seeing',
  'sun',
  'temporal',
  'transit'
]

/*****************************************************************************************************************/

const entrypoints = Object.assign(
  {
    index: resolve(__dirname, 'src/index.ts')
  },
  ...modules.map(module => {
    return {
      [module]: resolve(__dirname, `src/${module}.ts`)
    }
  })
) satisfies UserConfig['build']['rollupOptions']['input']

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
      entry: entrypoints,
      name: '@observerly/astrometry'
    },
    rollupOptions: {
      external: ['./playground/*.ts'],
      input: entrypoints,
      output: {
        preserveModules: false,
        sourcemap: true
      }
    }
  }
})

/*****************************************************************************************************************/
