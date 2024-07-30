/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/q
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { type EquatorialCoordinate, getQIndex, q } from '../src'

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
  φ: number
  A: number
  alt: number
}

/*****************************************************************************************************************/

describe('q', () => {
  it('should be defined', () => {
    expect(q).toBeDefined()
  })

  it('should return the value of Q = 1 for the best possible set of conditions', () => {
    const Q = q(0, 180, 90, -90)
    expect(Q).toBe(1)
    expect(Q).toBeGreaterThanOrEqual(-1)
    expect(Q).toBeLessThanOrEqual(1)
  })

  it('should return the value of Q = -1 for the worst possible set of conditions', () => {
    const Q = q(100, 0, -90, 90)
    expect(Q).toBe(-1)
    expect(Q).toBeGreaterThanOrEqual(-1)
    expect(Q).toBeLessThanOrEqual(1)
  })

  it('should return the value of Q = 0 for the base set of conditions', () => {
    const Q = q(50, 90, 6, -18)
    expect(Q).toBe(0)
    expect(Q).toBeGreaterThanOrEqual(-1)
    expect(Q).toBeLessThanOrEqual(1)
  })

  const cases: Q[] = [
    { K: 100, φ: 0, A: -90, alt: 90 },
    { K: 80, φ: 45, A: 45, alt: 45 },
    { K: 60, φ: 45, A: 45, alt: 45 },
    { K: 40, φ: 45, A: 45, alt: 45 },
    { K: 20, φ: 45, A: 45, alt: 45 },
    { K: 0, φ: 180, A: 90, alt: -90 }
  ]

  cases.forEach(({ K, φ, A, alt }) => {
    it(`should return a value between -1 and 1 for K=${K}, φ=${φ}, A=${A}, alt=${alt}`, () => {
      const Q = q(K, φ, A, alt)
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
})

/*****************************************************************************************************************/
