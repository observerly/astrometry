/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/typescript-vite-template
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

/// <reference types="vitest" />

/*****************************************************************************************************************/

import { type BuildOptions, defineConfig } from 'vite'

import typescript from '@rollup/plugin-typescript'

import { resolve } from 'path'

/*****************************************************************************************************************/

const modules = [
  'aberration',
  'astrometry',
  'common',
  'conjunction',
  'constants',
  'constellations',
  'coordinates',
  'earth',
  'eclipse',
  'ecliptic',
  'epoch',
  'galactic',
  'humanize',
  'iers',
  'maths',
  'moon',
  'night',
  'nutation',
  'observation',
  'observation',
  'optics',
  'orbit',
  'planets',
  'precession',
  'projection',
  'q',
  'refraction',
  'seeing',
  'sun',
  'temporal',
  'transit',
  'twilight',
  'wcs'
] as const

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
) satisfies NonNullable<BuildOptions['rollupOptions']>['input']

/*****************************************************************************************************************/

export default defineConfig({
  test: {
    globalSetup: './tests/setup.ts',
    passWithNoTests: true,
    setupFiles: ['./tests/setup.ts'],
    watch: false
  },
  plugins: [
    typescript({
      declaration: true,
      tsconfig: resolve(__dirname, 'tsconfig.json')
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
        preserveModules: false
      }
    },
    sourcemap: true
  }
})

/*****************************************************************************************************************/
