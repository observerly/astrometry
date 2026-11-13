/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/constants
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  ARCSECOND_IN_DEGREES,
  AU_IN_METERS,
  MEAN_OBLIQUITY_OF_THE_ECLIPTIC_AT_J2000,
  MINUTES_IN_DAY,
  SCHWARZSCHILD_RADIUS_OF_THE_SUN,
  SECONDS_IN_DAY,
  SPEED_OF_LIGHT,
  TWO_PI
} from '../src/constants'

import { getObliquityOfTheEcliptic } from '../src/ecliptic'

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

describe('MEAN_OBLIQUITY_OF_THE_ECLIPTIC_AT_J2000', () => {
  it('should be defined', () => {
    expect(MEAN_OBLIQUITY_OF_THE_ECLIPTIC_AT_J2000).toBeDefined()
  })

  it('should be the mean obliquity of the ecliptic at J2000.0 of IAU 2006 (in degrees)', () => {
    expect(MEAN_OBLIQUITY_OF_THE_ECLIPTIC_AT_J2000).toBe(84381.406 / 3600)
    expect(MEAN_OBLIQUITY_OF_THE_ECLIPTIC_AT_J2000).toBeCloseTo(23.439279444444445, 15)
  })

  it('should be 84381.406 arcseconds, e.g., the constant term of the IAU 2006 polynomial', () => {
    expect(MEAN_OBLIQUITY_OF_THE_ECLIPTIC_AT_J2000 * 3600).toBeCloseTo(84381.406, 9)
  })

  it('should be ~23° 26′ 21.406″', () => {
    const degrees = Math.floor(MEAN_OBLIQUITY_OF_THE_ECLIPTIC_AT_J2000)
    const minutes = Math.floor((MEAN_OBLIQUITY_OF_THE_ECLIPTIC_AT_J2000 - degrees) * 60)
    const seconds = ((MEAN_OBLIQUITY_OF_THE_ECLIPTIC_AT_J2000 - degrees) * 60 - minutes) * 60

    expect(degrees).toBe(23)
    expect(minutes).toBe(26)
    expect(seconds).toBeCloseTo(21.406, 9)
  })

  it('should be the mean obliquity of the ecliptic resolved at J2000.0 TT, e.g., 2000-01-01T11:58:55.816Z', () => {
    // J2000.0 is 2000-01-01T12:00:00 TT, where TT - UTC = 32 + 32.184 = 64.184 seconds:
    const datetime = new Date('2000-01-01T11:58:55.816Z')

    expect(getObliquityOfTheEcliptic(datetime)).toBeCloseTo(
      MEAN_OBLIQUITY_OF_THE_ECLIPTIC_AT_J2000,
      12
    )
  })

  it('should be a positive, finite number less than 90°', () => {
    expect(Number.isFinite(MEAN_OBLIQUITY_OF_THE_ECLIPTIC_AT_J2000)).toBe(true)
    expect(MEAN_OBLIQUITY_OF_THE_ECLIPTIC_AT_J2000).toBeGreaterThan(0)
    expect(MEAN_OBLIQUITY_OF_THE_ECLIPTIC_AT_J2000).toBeLessThan(90)
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

describe('ARCSECOND_IN_DEGREES', () => {
  it('should be defined', () => {
    expect(ARCSECOND_IN_DEGREES).toBeDefined()
  })

  it('should be 1/3600 of a degree', () => {
    expect(ARCSECOND_IN_DEGREES).toBe(1 / 3600)
  })

  it('should be 3,600 to the degree', () => {
    expect(ARCSECOND_IN_DEGREES * 3600).toBeCloseTo(1, 15)
  })

  it('should be 1,296,000 to the whole turn', () => {
    expect(360 / ARCSECOND_IN_DEGREES).toBeCloseTo(1296000, 6)
  })

  it('should be a positive, finite number', () => {
    expect(ARCSECOND_IN_DEGREES).toBeGreaterThan(0)
    expect(Number.isFinite(ARCSECOND_IN_DEGREES)).toBe(true)
  })
})

/*****************************************************************************************************************/
