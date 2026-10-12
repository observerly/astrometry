/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/constants
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { TWO_PI } from '../src/constants'

/*****************************************************************************************************************/

describe('TWO_PI', () => {
  it('should be defined', () => {
    expect(TWO_PI).toBeDefined()
  })

  it('should be two pi, e.g., the angle of a whole turn (in radians)', () => {
    expect(TWO_PI).toBe(2 * Math.PI)
    expect(TWO_PI).toBeCloseTo(6.283185307179586, 15)
  })

  it('should be the angle of a whole turn of 360°', () => {
    expect((TWO_PI * 180) / Math.PI).toBe(360)
  })
})

/*****************************************************************************************************************/
