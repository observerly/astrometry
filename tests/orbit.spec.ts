/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/orbit
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import { getFOrbitalParameter } from '../src'

/*****************************************************************************************************************/

describe('getFOrbitalParameter', () => {
  it('should be defined', () => {
    expect(getFOrbitalParameter).toBeDefined()
  })

  it('should return the correct value for the given ν and e for the Sun', () => {
    const ν = 43.025813
    const e = 0.016708
    // Test for the Sun:
    const F = getFOrbitalParameter(ν, e)
    expect(F).toBe(1.012496968671173)
  })

  it('should return the correct value for the given ν and e for the Moon', () => {
    const ν = 6.086312
    const e = 0.0549
    // Test for the Moon:
    const F = getFOrbitalParameter(ν, e)
    expect(F).toBe(1.0577787008793529)
  })
})

/*****************************************************************************************************************/
