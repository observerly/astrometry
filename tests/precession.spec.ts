/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/precession
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  type EquatorialCoordinate,
  getCorrectionToEquatorialForFrameBias,
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
    expect(ra + polaris.ra).toBeCloseTo(44.745273328264, 9)
    expect(dec + polaris.dec).toBeCloseTo(89.35354192194684, 9)
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

describe('getCorrectionToEquatorialForFrameBias', () => {
  it('should be defined', () => {
    expect(getCorrectionToEquatorialForFrameBias).toBeDefined()
  })

  it.each([
    { name: 'Betelgeuse', ra: 88.7929583, dec: 7.4070639, Δra: 0.0000034608, Δdec: -0.000001991 },
    { name: 'Polaris', ra: 37.95456067, dec: 89.26410897, Δra: -0.00010068472, Δdec: -0.0000048046 },
    { name: 'Canopus', ra: 95.98787778, dec: -52.69566111, Δra: 0.000010340097, Δdec: -0.0000014024 }
  ])('should agree with the frame bias of ERFA for $name', ({ ra, dec, Δra, Δdec }) => {
    // The displacements are those of the frame bias matrix of ERFA (bp06) applied to the catalogue coordinate:
    const correction = getCorrectionToEquatorialForFrameBias({ ra, dec })

    expect(correction.ra).toBeCloseTo(Δra, 9)
    expect(correction.dec).toBeCloseTo(Δdec, 9)
  })

  it.each([{ ra: 0 }, { ra: 359.99 }])(
    'should return a small correction free of any ±360° branch-cut jump for a target at ra $ra',
    ({ ra }) => {
      const correction = getCorrectionToEquatorialForFrameBias({ ra, dec: -10 })

      expect(Math.abs(correction.ra)).toBeLessThan(0.0001)
      expect(Math.abs(correction.dec)).toBeLessThan(0.0001)
    }
  )
})

/*****************************************************************************************************************/
