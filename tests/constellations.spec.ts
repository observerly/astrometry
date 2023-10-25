/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/constellations
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { constellations } from '../src'

/*****************************************************************************************************************/

describe('constellations', () => {
  it('should be defined', () => {
    expect(constellations).toBeDefined()
  })

  it('should contain all 88 modern constellations', () => {
    expect(constellations.size).toBe(88)
  })
})

/*****************************************************************************************************************/
