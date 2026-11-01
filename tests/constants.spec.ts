/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/constants
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  AU_IN_METERS,
  MINUTES_IN_DAY,
  SCHWARZSCHILD_RADIUS_OF_THE_SUN,
  SECONDS_IN_DAY,
  SPEED_OF_LIGHT,
  TWO_PI
} from '../src/constants'

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

describe('SCHWARZSCHILD_RADIUS_OF_THE_SUN', () => {
  it('should be defined', () => {
    expect(SCHWARZSCHILD_RADIUS_OF_THE_SUN).toBeDefined()
  })

  it('should be the Schwarzschild radius of the Sun (in astronomical units)', () => {
    expect(SCHWARZSCHILD_RADIUS_OF_THE_SUN).toBe(1.97412574336e-8)
  })

  it('should be ~2953.25 meters, e.g., the Schwarzschild radius of the Sun (in meters)', () => {
    expect(SCHWARZSCHILD_RADIUS_OF_THE_SUN * AU_IN_METERS).toBeCloseTo(2953.25, 2)
  })

  it('should be 2GM☉/c² for the TDB-compatible heliocentric gravitational constant of the IAU 2009 system', () => {
    // The TDB-compatible heliocentric gravitational constant of the IAU 2009 system (in m³ s⁻²):
    const GM = 1.32712440041e20

    expect(SCHWARZSCHILD_RADIUS_OF_THE_SUN).toBeCloseTo(
      (2 * GM) / SPEED_OF_LIGHT ** 2 / AU_IN_METERS,
      18
    )
  })

  it('should be a positive, finite number', () => {
    expect(Number.isFinite(SCHWARZSCHILD_RADIUS_OF_THE_SUN)).toBe(true)
    expect(SCHWARZSCHILD_RADIUS_OF_THE_SUN).toBeGreaterThan(0)
  })
})

/*****************************************************************************************************************/
