/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/constants
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { MINUTES_IN_DAY, SECONDS_IN_DAY, TWO_PI } from '../src/constants'

/*****************************************************************************************************************/

describe('MINUTES_IN_DAY', () => {
  it('should be defined', () => {
    expect(MINUTES_IN_DAY).toBeDefined()
  })

  it('should be the number of minutes in a mean solar day', () => {
    expect(MINUTES_IN_DAY).toBe(1440)
    expect(MINUTES_IN_DAY).toBe(24 * 60)
  })

  it('should be the number of seconds in a day in minutes', () => {
    expect(MINUTES_IN_DAY).toBe(SECONDS_IN_DAY / 60)
  })
})

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
