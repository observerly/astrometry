/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/propermotion
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { type EquatorialCoordinate, getCorrectionToEquatorialForProperMotion } from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

// For testing, Barnard's Star has the largest proper motion of any known star, at J2000.0:
const barnard: EquatorialCoordinate = { ra: 269.45207917, dec: 4.69339722 }

// The proper motion of Barnard's Star, in arcseconds per Julian year:
const barnardProperMotion: EquatorialCoordinate = { ra: -0.79858, dec: 10.32812 }

// For testing, Betelgeuse has a proper motion that is negligible over the interval under test:
const betelgeuse: EquatorialCoordinate = { ra: 88.7929583, dec: 7.4070639 }

// The J2000.0 epoch, e.g., the 1st January 2000 at 12:00, from which proper motion is resolved:
const J2000 = Date.UTC(2000, 0, 1, 12, 0, 0, 0)

// N.B. A Julian year is exactly 365.25 days, and so it is not a calendar year:
const at = (years: number): Date => new Date(J2000 + years * 365.25 * 86400000)

/*****************************************************************************************************************/

describe('getCorrectionToEquatorialForProperMotion', () => {
  it('should be defined', () => {
    expect(getCorrectionToEquatorialForProperMotion).toBeDefined()
  })

  it('should return no correction at the epoch of the coordinate', () => {
    const { ra, dec } = getCorrectionToEquatorialForProperMotion(at(0), barnard, barnardProperMotion)

    expect(ra).toBeCloseTo(0, 9)
    expect(dec).toBeCloseTo(0, 9)
  })

  it('should return no correction for a target with no proper motion', () => {
    const { ra, dec } = getCorrectionToEquatorialForProperMotion(datetime, betelgeuse, {
      ra: 0,
      dec: 0
    })

    expect(ra).toBe(0)
    expect(dec).toBe(0)
  })

  it('should return the correction for the proper motion of Barnard’s Star', () => {
    const { ra, dec } = getCorrectionToEquatorialForProperMotion(
      datetime,
      barnard,
      barnardProperMotion
    )

    // The interval between the J2000.0 epoch and the datetime, in Julian years:
    const t = (datetime.getTime() - J2000) / (365.25 * 86400000)

    // The declination moves north at the rate given, e.g., ~10.3" per year:
    expect(dec * 3600).toBeCloseTo(barnardProperMotion.dec * t, 9)

    // The right ascension moves west at the rate given, divided through by the cosine of the
    // declination, as the rate given is the great-circle rate:
    expect(ra * 3600).toBeCloseTo(
      (barnardProperMotion.ra * t) / Math.cos((barnard.dec * Math.PI) / 180),
      9
    )

    // Barnard's Star moves ~10.3" per year, and so it has moved ~3.7' over the interval:
    expect(dec * 60).toBeCloseTo(3.68, 1)
  })

  it('should scale linearly with the interval since the epoch of the coordinate', () => {
    const decade = getCorrectionToEquatorialForProperMotion(at(10), barnard, barnardProperMotion)

    const century = getCorrectionToEquatorialForProperMotion(at(100), barnard, barnardProperMotion)

    expect(century.ra / decade.ra).toBeCloseTo(10, 6)
    expect(century.dec / decade.dec).toBeCloseTo(10, 6)
  })

  it('should reverse the correction for a datetime before the epoch of the coordinate', () => {
    const before = getCorrectionToEquatorialForProperMotion(at(-10), barnard, barnardProperMotion)

    const after = getCorrectionToEquatorialForProperMotion(at(10), barnard, barnardProperMotion)

    expect(before.ra).toBeCloseTo(-after.ra, 9)
    expect(before.dec).toBeCloseTo(-after.dec, 9)
  })

  it('should scale the proper motion in right ascension by the secant of the declination', () => {
    // The same great-circle rate corresponds to a greater rate of change of the right ascension at
    // a greater declination, e.g., the meridians converge towards the poles:
    const equator = getCorrectionToEquatorialForProperMotion(
      datetime,
      { ra: 0, dec: 0 },
      { ra: 1, dec: 0 }
    )

    const sixty = getCorrectionToEquatorialForProperMotion(
      datetime,
      { ra: 0, dec: 60 },
      { ra: 1, dec: 0 }
    )

    expect(sixty.ra / equator.ra).toBeCloseTo(2, 6)
  })

  it('should not resolve a right ascension for a target at a celestial pole', () => {
    // The right ascension of a target at either pole is degenerate, and so it is left uncorrected:
    for (const dec of [90, -90]) {
      const correction = getCorrectionToEquatorialForProperMotion(
        datetime,
        { ra: 0, dec },
        { ra: 1, dec: 1 }
      )

      expect(correction.ra).toBe(0)
      expect(Number.isFinite(correction.dec)).toBe(true)
    }
  })
})

/*****************************************************************************************************************/
