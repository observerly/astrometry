/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/parallax
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { type EquatorialCoordinate, getCorrectionToEquatorialForAnnualParallax } from '../src'

import {
  convertDegreesToRadians as radians,
  convertRadiansToDegrees as degrees
} from '../src/utilities'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

/*****************************************************************************************************************/

describe('getCorrectionToEquatorialForAnnualParallax', () => {
  // Proxima Centauri subtends the largest annual parallax of any star, at ~0.7686 arcseconds:
  const proxima: EquatorialCoordinate = { ra: 217.42895, dec: -62.67948, parallax: 0.7686 }

  // The unit vector of an equatorial coordinate, in the equatorial frame:
  const getUnitVector = (ra: number, dec: number): [number, number, number] => [
    Math.cos(radians(dec)) * Math.cos(radians(ra)),
    Math.cos(radians(dec)) * Math.sin(radians(ra)),
    Math.sin(radians(dec))
  ]

  // The great circle displacement of a target, in arcseconds, e.g., the displacement in right
  // ascension is taken along the parallel of the target, which shortens as cos δ:
  const displacement = (correction: EquatorialCoordinate, dec: number): number =>
    Math.hypot(correction.ra * Math.cos(radians(dec)), correction.dec) * 3600

  it('should be defined', () => {
    expect(getCorrectionToEquatorialForAnnualParallax).toBeDefined()
  })

  it('should not displace a target of no parallax', () => {
    // A target that carries no parallax is at an infinite distance:
    expect(
      getCorrectionToEquatorialForAnnualParallax(datetime, {
        ra: 10,
        dec: 20
      })
    ).toEqual({ ra: 0, dec: 0 })
  })

  it('should displace a target by no more than its parallax over a year', () => {
    // The displacement traces an ellipse whose semi-major axis is the parallax of the target:
    let maximum = 0

    for (let day = 0; day < 366; day++) {
      const when = new Date(Date.UTC(2021, 0, 1 + day))

      maximum = Math.max(
        maximum,
        displacement(getCorrectionToEquatorialForAnnualParallax(when, proxima), proxima.dec)
      )
    }

    expect(maximum).toBeGreaterThan(0.7686 * 0.98)
    expect(maximum).toBeLessThan(0.7686 * 1.02)
  })

  it('should trace a circle for a target at the pole of the ecliptic', () => {
    // A target at the pole of the ecliptic is displaced equally in every direction over the year,
    // to within the eccentricity of the orbit of the Earth, e ~ 0.0167:
    const target: EquatorialCoordinate = { ra: 270, dec: 66.56, parallax: 1 }

    const displacements: number[] = []

    for (let day = 0; day < 365; day += 5) {
      const when = new Date(Date.UTC(2021, 0, 1 + day))

      displacements.push(
        displacement(getCorrectionToEquatorialForAnnualParallax(when, target), target.dec)
      )
    }

    expect(Math.min(...displacements)).toBeCloseTo(1 - 0.0167, 2)
    expect(Math.max(...displacements)).toBeCloseTo(1 + 0.0167, 2)
  })

  it('should reverse the displacement half a year later', () => {
    // The observer is carried to the other side of the orbit of the Earth:
    const january = getCorrectionToEquatorialForAnnualParallax(
      new Date('2021-01-01T00:00:00.000+00:00'),
      proxima
    )

    const july = getCorrectionToEquatorialForAnnualParallax(
      new Date('2021-07-04T00:00:00.000+00:00'),
      proxima
    )

    expect(Math.sign(july.ra)).toBe(-Math.sign(january.ra))
    expect(Math.sign(july.dec)).toBe(-Math.sign(january.dec))
  })

  it('should scale with the parallax of the target, to the first order', () => {
    // The displacement carries the second order of the parallax as well as the first, and so a
    // target of ten times the parallax is displaced ten times as far to within ~1e-9 degrees:
    const near = getCorrectionToEquatorialForAnnualParallax(datetime, { ...proxima, parallax: 1 })

    const far = getCorrectionToEquatorialForAnnualParallax(datetime, { ...proxima, parallax: 0.1 })

    expect(far.ra * 10).toBeCloseTo(near.ra, 8)
    expect(far.dec * 10).toBeCloseTo(near.dec, 8)
  })

  it('should resolve a target at a celestial pole', () => {
    // Every meridian meets at a pole, and so the displaced target takes a right ascension of its
    // own, which may be far from the one it was given. It is resolved, and not guarded against:
    for (const dec of [90, -90]) {
      const correction = getCorrectionToEquatorialForAnnualParallax(datetime, {
        ra: 123,
        dec,
        parallax: 1
      })

      expect(Number.isFinite(correction.ra)).toBe(true)
      expect(Number.isFinite(correction.dec)).toBe(true)

      // The displacement in right ascension is the shorter of the two ways about the sphere:
      expect(correction.ra).toBeGreaterThanOrEqual(-180)
      expect(correction.ra).toBeLessThan(180)
    }
  })

  it('should bound the displacement of a target by its parallax, wherever it lies', () => {
    // The displacement is the position of the observer across the line of sight, as a fraction of
    // the distance to the target, and so it is bounded by its parallax at the aphelion distance of
    // the Earth, e.g., by ~1.017 times it. The bound holds at a pole as it does anywhere:
    for (const parallax of [0.0001, 0.7686, 10, 1000]) {
      for (const offset of [40, 1, 1e-3, 1e-6, 1e-9, 1e-12, 0]) {
        for (const sign of [1, -1]) {
          const dec = sign * (90 - offset)

          for (let ra = 0; ra < 360; ra += 45) {
            const correction = getCorrectionToEquatorialForAnnualParallax(datetime, {
              ra,
              dec,
              parallax
            })

            expect(Number.isFinite(correction.ra)).toBe(true)
            expect(Number.isFinite(correction.dec)).toBe(true)

            // The great circle angle between the target and its apparent position:
            const a = getUnitVector(ra, dec)

            const b = getUnitVector(ra + correction.ra, dec + correction.dec)

            const separation = degrees(
              Math.atan2(
                Math.hypot(
                  a[1] * b[2] - a[2] * b[1],
                  a[2] * b[0] - a[0] * b[2],
                  a[0] * b[1] - a[1] * b[0]
                ),
                a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
              )
            )

            expect(separation * 3600).toBeLessThanOrEqual(parallax * 1.017)
          }
        }
      }
    }
  })
})

/*****************************************************************************************************************/
