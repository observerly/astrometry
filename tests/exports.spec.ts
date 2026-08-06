/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/exports
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { existsSync, readFileSync } from 'node:fs'

import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

const root = join(__dirname, '..')

// The subpaths of the package, e.g., "./aberration", without the root export:
const exports = Object.keys(
  JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8')).exports as Record<string, unknown>
)
  .filter(key => key !== '.')
  .map(key => key.slice(2))

// The modules the build is configured to emit, parsed from the vite configuration:
const vite = readFileSync(join(root, 'vite.config.ts'), 'utf-8')

const modules = [...vite.matchAll(/^ {2}'([a-z0-9]+)',?$/gm)].map(([, module]) => module)

// The modules the root index re-exports:
const index = [...readFileSync(join(root, 'src/index.ts'), 'utf-8').matchAll(/from '\.\/([a-z0-9]+)'/g)].map(
  ([, module]) => module
)

/*****************************************************************************************************************/

describe('the subpath exports of the package', () => {
  it('should have a source module for every subpath', () => {
    for (const subpath of exports) {
      expect(existsSync(join(root, `src/${subpath}.ts`)), `src/${subpath}.ts`).toBe(true)
    }
  })

  it('should build every subpath, e.g., every subpath is a module of the vite configuration', () => {
    // A subpath that the build does not emit resolves to a file that does not exist for every
    // consumer of the published package:
    for (const subpath of exports) {
      expect(modules, subpath).toContain(subpath)
    }
  })

  it('should declare a subpath for every module the build emits', () => {
    for (const module of modules) {
      expect(exports, module).toContain(module)
    }
  })

  it('should declare a subpath for every module the root index re-exports', () => {
    for (const module of index) {
      expect(exports, module).toContain(module)
    }
  })

  it('should not build any module twice', () => {
    expect(new Set(modules).size).toBe(modules.length)
  })
})

/*****************************************************************************************************************/
