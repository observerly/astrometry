/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/precession
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  type EquatorialCoordinate,
  getCorrectionToEquatorialForPrecessionOfEquinoxes
} from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

// For testing
const polaris: EquatorialCoordinate = { ra: 37.95454961, dec: 89.264113893 }

/*****************************************************************************************************************/

describe('getCorrectionToEquatorialForPrecessionOfEquinoxes', () => {
  it('should be defined', () => {
    expect(getCorrectionToEquatorialForPrecessionOfEquinoxes).toBeDefined()
  })

  it('should return the correct precession correction for the J2000 default epoch', () => {
    const { ra, dec } = getCorrectionToEquatorialForPrecessionOfEquinoxes(
      new Date('2000-01-01T12:00:00+00:00'),
      polaris
    )
    expect(ra + polaris.ra).toBeCloseTo(37.95454961)
    expect(dec + polaris.dec).toBeCloseTo(89.264113893)
  })

  it('should return the correct precession correction for the designated epoch', () => {
    const { ra, dec } = getCorrectionToEquatorialForPrecessionOfEquinoxes(datetime, polaris)
    expect(ra + polaris.ra).toBe(44.745635372429454)
    expect(dec + polaris.dec).toBe(89.35354802815961)
  })

  it.each([{ ra: 10 }, { ra: 200 }, { ra: 359.9 }])(
    'should return a small correction free of any ±360° branch-cut jump for a target at ra $ra',
    ({ ra: targetRA }) => {
      const target: EquatorialCoordinate = { ra: targetRA, dec: 45 }

      const { ra, dec } = getCorrectionToEquatorialForPrecessionOfEquinoxes(
        new Date('2026-07-22T00:00:00.000+00:00'),
        target
      )

      // Precession accumulates ~0.36° over the ~26 years since J2000, so the
      // correction magnitude must be well under 1°:
      expect(Math.abs(ra)).toBeLessThan(1)
      expect(Math.abs(dec)).toBeLessThan(1)

      // Applying the correction (wrapped into [0, 360)) should move the target
      // by only that small amount:
      const corrected = (((target.ra + ra) % 360) + 360) % 360

      let delta = corrected - target.ra
      delta -= 360 * Math.round(delta / 360)

      expect(Math.abs(delta)).toBeLessThan(1)
    }
  )
})

/*****************************************************************************************************************/
