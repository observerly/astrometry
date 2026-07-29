/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/q
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  convertEquatorialToHorizontal,
  type EquatorialCoordinate,
  getAngularSeparation,
  getCorrectionToHorizontalForRefraction,
  getLunarEquatorialCoordinate,
  getQIndex,
  q
} from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

// For testing we will fix the latitude to be Manua Kea, Hawaii, US
export const latitude = 19.820611

// For testing we will fix the longitude to be Manua Kea, Hawaii, US:
export const longitude = -155.468094

// For testing
const betelgeuse: EquatorialCoordinate = { ra: 88.7929583, dec: 7.4070639 }

/*****************************************************************************************************************/

interface Q {
  K: number
  separation: number
  A: number
  alt: number
}

/*****************************************************************************************************************/

describe('q', () => {
  it('should be defined', () => {
    expect(q).toBeDefined()
  })

  it('should return the value of Q = 1 for the best possible set of conditions', () => {
    const Q = q(0, 180, 90, { az: 0, alt: -90 }, { az: 0, alt: -90 })
    expect(Q).toBe(1)
    expect(Q).toBeGreaterThanOrEqual(-1)
    expect(Q).toBeLessThanOrEqual(1)
  })

  it('should return the value of Q = -1 for the worst possible set of conditions', () => {
    const Q = q(100, 0, -90, { az: 0, alt: 90 }, { az: 180, alt: 90 })
    expect(Q).toBe(-1)
    expect(Q).toBeGreaterThanOrEqual(-1)
    expect(Q).toBeLessThanOrEqual(1)
  })

  it('should return the value of Q = -1 when the target is below 6 degrees of the horizon', () => {
    const Q = q(100, 0, 6, { az: 0, alt: 0 }, { az: 180, alt: 90 })
    expect(Q).toBe(-1)
    expect(Q).toBeGreaterThanOrEqual(-1)
    expect(Q).toBeLessThanOrEqual(1)
  })

  it('should return the value of Q = -1 when the Sun is above -18 degrees of the horizon', () => {
    const Q = q(100, 0, -90, { az: 0, alt: 0 }, { az: 180, alt: 90 })
    expect(Q).toBe(-1)
    expect(Q).toBeGreaterThanOrEqual(-1)
    expect(Q).toBeLessThanOrEqual(1)
  })

  it('should return the value of Q = 0 for the base set of conditions', () => {
    const Q = q(50, 90, 6, { az: 0, alt: -18 }, { az: 180, alt: 0.1 })
    expect(Q).toBe(0)
    expect(Q).toBeGreaterThanOrEqual(-1)
    expect(Q).toBeLessThanOrEqual(1)
  })

  const cases: Q[] = [
    { K: 100, separation: 0, A: -90, alt: 90 },
    { K: 80, separation: 45, A: 45, alt: 45 },
    { K: 60, separation: 45, A: 45, alt: 45 },
    { K: 40, separation: 45, A: 45, alt: 45 },
    { K: 20, separation: 45, A: 45, alt: 45 },
    { K: 0, separation: 180, A: 90, alt: -90 }
  ]

  cases.forEach(({ K, separation, A, alt }) => {
    it(`should return a value between -1 and 1 for K=${K}, separation=${separation}, A=${A}, alt=${alt}`, () => {
      const moon = { az: 270, alt: 18 }

      const Q = q(K, separation, A, { az: 0, alt }, moon)
      expect(Q).toBeGreaterThanOrEqual(-1)
      expect(Q).toBeLessThanOrEqual(1)
    })
  })
})

/*****************************************************************************************************************/

describe('getQIndex', () => {
  it('should be defined', () => {
    expect(getQIndex).toBeDefined()
  })

  it('should never return a value that is outside of -1<=Q<=1', () => {
    const q = getQIndex(new Date(), { latitude: 0, longitude: 0 }, { ra: 0, dec: 0 })
    expect(q.Q).toBeGreaterThanOrEqual(-1)
    expect(q.Q).toBeLessThanOrEqual(1)
  })

  it('should never return a value that is outside of -1<=Q<=1', () => {
    const q = getQIndex(datetime, { latitude, longitude }, betelgeuse)
    expect(q.Q).toBeGreaterThanOrEqual(-1)
    expect(q.Q).toBeLessThanOrEqual(1)

    console.log('Q Index', q.Q)
  })

  it('should return the altitude of the target, and not its azimuth', () => {
    const { A, alt, ra, dec } = getQIndex(datetime, { latitude, longitude }, betelgeuse)

    // The altitude of the target, and the altitude of the Sun, are both bounded by the zenith and
    // the nadir, e.g., neither is an azimuth:
    for (const altitude of [A, alt]) {
      expect(altitude).toBeGreaterThanOrEqual(-90)
      expect(altitude).toBeLessThanOrEqual(90)
    }

    const { alt: altitude } = getCorrectionToHorizontalForRefraction(
      convertEquatorialToHorizontal(datetime, { latitude, longitude }, { ra, dec })
    )

    expect(A).toBeCloseTo(altitude)
  })

  it('should return the angular separation between the Moon and the target', () => {
    const { separation, ra, dec, A } = getQIndex(datetime, { latitude, longitude }, betelgeuse)

    // The refracted horizontal coordinate of the Moon for the observation:
    const moon = getCorrectionToHorizontalForRefraction(
      convertEquatorialToHorizontal(
        datetime,
        { latitude, longitude },
        getLunarEquatorialCoordinate(datetime)
      )
    )

    // The refracted horizontal coordinate of the target for the observation:
    const target = getCorrectionToHorizontalForRefraction(
      convertEquatorialToHorizontal(datetime, { latitude, longitude }, { ra, dec })
    )

    // The altitude of the target, as resolved by the Q index:
    expect(A).toBeCloseTo(target.alt)

    // N.B. The altitude of the target is not its azimuth, which is not returned:
    expect(A).not.toBeCloseTo(target.az)

    // N.B. getAngularSeparation() takes the polar angle, θ, to be the altitude, and the azimuthal
    // angle, φ, to be the azimuth:
    expect(separation).toBeCloseTo(
      getAngularSeparation({ θ: moon.alt, φ: moon.az }, { θ: target.alt, φ: target.az })
    )
  })
})

/*****************************************************************************************************************/
