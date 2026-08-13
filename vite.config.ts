/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/typescript-vite-template
// @license        Copyright © 2021-2026 observerly

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
  'constraints',
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
  'observer',
  'occultation',
  'optics',
  'orbit',
  'parallax',
  'planets',
  'precession',
  'projection',
  'quality',
  'refraction',
  'seeing',
  'sun',
  'temporal',
  'time',
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
    // Typecheck the specs alongside running them, such that the type-level assertions, e.g.,
    // expectTypeOf(), are enforced, and are not silently inert:
    typecheck: {
      enabled: true,
      include: ['tests/**/*.spec.ts']
    },
    watch: false
  },
  plugins: [
    typescript({
      declaration: true,
      // N.B. The build is typed from its own tsconfig, which includes only the source. The root
      // tsconfig includes the specs also, so as to typecheck them, which widens the inferred root
      // of the program to the workspace, and emits the declarations to dist/src rather than to
      // dist, where every "types" entry of the package resolves them:
      tsconfig: resolve(__dirname, 'tsconfig.build.json')
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
