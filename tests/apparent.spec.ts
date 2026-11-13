/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/apparent
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  convertCartesianToEquatorial,
  convertEquatorialToCartesian,
  doVectorDifference,
  doVectorSum,
  type EquatorialCoordinate,
  getAngularSeparation,
  getApparentEquatorialCoordinate,
  getCorrectionToEquatorialForAnnualAberration,
  getCorrectionToEquatorialForAnnualParallax,
  getCorrectionToEquatorialForProperMotion,
  getCorrectionToEquatorialForVelocityAberration
} from '../src'

import { MICROARCSECOND_IN_DEGREES, MILLIARCSECOND_IN_DEGREES } from '../src/constants'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
const datetime = new Date('2021-05-14T00:00:00.000+00:00')

// For testing
const betelgeuse: EquatorialCoordinate = { ra: 88.7929583, dec: 7.4070639 }

// Proxima Centauri subtends the largest annual parallax of any star, at ~0.7686 arcseconds:
const proxima: EquatorialCoordinate = { ra: 217.42895, dec: -62.67948, parallax: 0.7686 }

// The proper motion of Proxima Centauri, in arcseconds per Julian year:
const proximaProperMotion = { ra: -3.86159, dec: 0.77489 }

// The orbital speed of an observer in a low Earth orbit (in SI metres per second):
const V = 7669

/*****************************************************************************************************************/

// The declinations of targets closing on either celestial pole, and at the poles themselves:
const polar = [89, 89.9, 89.99, 89.999, 89.9999, 89.999999, 90].flatMap(dec => [dec, -dec])

/*****************************************************************************************************************/

describe('getApparentEquatorialCoordinate', () => {
  it('should be defined', () => {
    expect(getApparentEquatorialCoordinate).toBeDefined()
  })

  it('should reduce to the annual aberration alone for a distant target and an observer at rest', () => {
    // A target of no parallax and no proper motion is displaced by the aberration of the motion
    // of the Earth alone:
    const { ra, dec } = getApparentEquatorialCoordinate(datetime, betelgeuse)

    const annual = getCorrectionToEquatorialForAnnualAberration(datetime, betelgeuse)

    expect(ra).toBeCloseTo(betelgeuse.ra + annual.ra, 9)
    expect(dec).toBeCloseTo(betelgeuse.dec + annual.dec, 9)
  })

  it('should displace a nearby target by its annual parallax as well', () => {
    const { ra, dec } = getApparentEquatorialCoordinate(datetime, proxima)

    const parallax = getCorrectionToEquatorialForAnnualParallax(datetime, proxima)

    const annual = getCorrectionToEquatorialForAnnualAberration(datetime, proxima)

    // N.B. The displacements are summed as vectors, and so they agree with the sum of their
    // differences of right ascension and of declination to the order of the cross terms between
    // them, e.g., to below ~2 milliarcseconds away from the celestial poles:
    expect(ra).toBeCloseTo(proxima.ra + parallax.ra + annual.ra, 6)
    expect(dec).toBeCloseTo(proxima.dec + parallax.dec + annual.dec, 6)
  })

  it('should carry a target by its proper motion before the displacements of the observer', () => {
    // The proper motion carries the target from the epoch of the catalogue to the datetime of the
    // observation, and the displacements of the observer are resolved about the moved target:
    const motion = getCorrectionToEquatorialForProperMotion(datetime, proxima, proximaProperMotion)

    const moved = { ...proxima, ra: proxima.ra + motion.ra, dec: proxima.dec + motion.dec }

    const parallax = getCorrectionToEquatorialForAnnualParallax(datetime, moved)

    const annual = getCorrectionToEquatorialForAnnualAberration(datetime, moved)

    const { ra, dec } = getApparentEquatorialCoordinate(datetime, proxima, proximaProperMotion)

    // N.B. The displacements are summed as vectors, and so they agree with the sum of their
    // differences of right ascension and of declination to the order of the cross terms between
    // them, e.g., to below ~2 milliarcseconds away from the celestial poles:
    expect(ra).toBeCloseTo(moved.ra + parallax.ra + annual.ra, 6)
    expect(dec).toBeCloseTo(moved.dec + parallax.dec + annual.dec, 6)

    // The proper motion of Proxima Centauri is ~4 arcseconds per year, and so the target has moved
    // appreciably over the two decades from the standard epoch:
    expect(Math.abs(ra - proxima.ra) * 3600).toBeGreaterThan(10)
  })

  it('should displace a target by the aberration of the velocity of the observer', () => {
    // An observer in a low Earth orbit is displaced by up to ~5.3 arcseconds over and above the
    // annual aberration every observer of the Earth shares:
    const velocity = { x: 0, y: V, z: 0 }

    const at = getApparentEquatorialCoordinate(datetime, betelgeuse)

    const moving = getApparentEquatorialCoordinate(datetime, betelgeuse, undefined, velocity)

    const orbital = getCorrectionToEquatorialForVelocityAberration(betelgeuse, velocity)

    // N.B. The displacements are summed as vectors, and so they agree with the sum of their
    // differences of right ascension and of declination to the order of the cross terms between
    // them, e.g., to below ~2 milliarcseconds away from the celestial poles:
    expect(moving.ra).toBeCloseTo(at.ra + orbital.ra, 6)
    expect(moving.dec).toBeCloseTo(at.dec + orbital.dec, 6)
  })

  it('should take an observer that gives no z component to travel in the plane of the equator', () => {
    // The z component of a cartesian coordinate is optional, and so a consumer that omits it is
    // not returned a displacement that is not a number:
    const partial = getApparentEquatorialCoordinate(datetime, betelgeuse, undefined, {
      x: V,
      y: V
    })

    expect(Number.isFinite(partial.ra)).toBe(true)
    expect(Number.isFinite(partial.dec)).toBe(true)

    expect(partial).toEqual(
      getApparentEquatorialCoordinate(datetime, betelgeuse, undefined, { x: V, y: V, z: 0 })
    )
  })

  it('should return a coordinate within the range of the sphere for a target about the equinox', () => {
    // A target close to the zero of right ascension is displaced across it, and so the coordinate
    // is normalised onto the sphere, e.g., it is not returned beyond 360°:
    for (const ra of [0.0001, 359.9999]) {
      const apparent = getApparentEquatorialCoordinate(datetime, { ra, dec: 0 })

      expect(apparent.ra).toBeGreaterThanOrEqual(0)
      expect(apparent.ra).toBeLessThan(360)
      expect(apparent.dec).toBeGreaterThanOrEqual(-90)
      expect(apparent.dec).toBeLessThanOrEqual(90)
    }
  })
  it('should compose the displacements as vectors for a target near either celestial pole', () => {
    // The displacement of each correction is a vector at right angles to the target, and the
    // vectors sum, where the differences of their right ascensions do not, e.g., a displacement
    // of a few arcseconds at a pole is a difference of tens of degrees in right ascension:
    const velocity = { x: V / 2, y: -V / 2, z: V / Math.SQRT2 }

    for (const dec of polar) {
      for (const ra of [0, 88.7929583, 180, 271.5]) {
        const target = { ra, dec, parallax: 0.7686 }

        const p = convertEquatorialToCartesian(target)

        const corrections = [
          getCorrectionToEquatorialForAnnualParallax(datetime, target),
          getCorrectionToEquatorialForAnnualAberration(datetime, target),
          getCorrectionToEquatorialForVelocityAberration(target, velocity)
        ]

        const expected = convertCartesianToEquatorial(
          corrections.reduce(
            (sum, { ra: Δra, dec: Δdec }) =>
              doVectorSum(
                sum,
                doVectorDifference(
                  convertEquatorialToCartesian({ ra: ra + Δra, dec: dec + Δdec }),
                  p
                )
              ),
            p
          )
        )

        const apparent = getApparentEquatorialCoordinate(datetime, target, undefined, velocity)

        expect(
          getAngularSeparation(
            { θ: apparent.dec, φ: apparent.ra },
            { θ: expected.dec, φ: expected.ra }
          )
        ).toBeLessThan(MICROARCSECOND_IN_DEGREES)
      }
    }
  })

  it('should displace a target near either celestial pole by no more than its corrections', () => {
    // The displacement of the target on the sky is bounded by the sum of the displacements of its
    // corrections, each taken on the sky, whatever the declination of the target:
    const velocity = { x: 0, y: V, z: 0 }

    for (const dec of polar) {
      const target = { ra: 88.7929583, dec, parallax: 0.7686 }

      const at = { θ: target.dec, φ: target.ra }

      const bound = [
        getCorrectionToEquatorialForAnnualParallax(datetime, target),
        getCorrectionToEquatorialForAnnualAberration(datetime, target),
        getCorrectionToEquatorialForVelocityAberration(target, velocity)
      ].reduce(
        (sum, { ra, dec }) =>
          sum + getAngularSeparation(at, { θ: target.dec + dec, φ: target.ra + ra }),
        0
      )

      const apparent = getApparentEquatorialCoordinate(datetime, target, undefined, velocity)

      expect(getAngularSeparation(at, { θ: apparent.dec, φ: apparent.ra })).toBeLessThanOrEqual(
        bound + MICROARCSECOND_IN_DEGREES
      )
    }
  })

  it('should displace a target near either celestial pole by the velocity of the observer as it does at the equator', () => {
    // The aberration of the velocity of the observer displaces the target on the sky by the same
    // arc whether it is resolved alone or over and above the annual aberration, to the order of
    // the cross term between the two:
    const velocity = { x: V, y: 0, z: 0 }

    for (const dec of polar) {
      const target = { ra: 88.7929583, dec }

      const orbital = getCorrectionToEquatorialForVelocityAberration(target, velocity)

      const alone = getAngularSeparation(
        { θ: target.dec, φ: target.ra },
        { θ: target.dec + orbital.dec, φ: target.ra + orbital.ra }
      )

      const at = getApparentEquatorialCoordinate(datetime, target)

      const moving = getApparentEquatorialCoordinate(datetime, target, undefined, velocity)

      const over = getAngularSeparation({ θ: at.dec, φ: at.ra }, { θ: moving.dec, φ: moving.ra })

      expect(Math.abs(over - alone)).toBeLessThan(MILLIARCSECOND_IN_DEGREES)
    }
  })

  it('should resolve two targets either side of a celestial pole as close as they lie on the sky', () => {
    // Two targets on opposite meridians at the same declination lie twice their polar distance
    // apart, and the displacements of the observer carry the two together, e.g., the apparent
    // coordinate is continuous over the pole:
    const velocity = { x: 0, y: V, z: 0 }

    for (const dec of [89.99, 89.9999, 89.999999, -89.99, -89.9999, -89.999999]) {
      const near = { ra: 30, dec, parallax: 0.7686 }

      const far = { ra: 210, dec, parallax: 0.7686 }

      const a = getApparentEquatorialCoordinate(datetime, near, undefined, velocity)

      const b = getApparentEquatorialCoordinate(datetime, far, undefined, velocity)

      const separation = getAngularSeparation({ θ: a.dec, φ: a.ra }, { θ: b.dec, φ: b.ra })

      const expected = 2 * (90 - Math.abs(dec))

      // The displacements differ between the two targets by no more than the arc between them
      // scaled by the displacements themselves, e.g., by ~10⁻⁴ of it for the annual aberration:
      expect(Math.abs(separation - expected)).toBeLessThan(
        expected * 2e-4 + MICROARCSECOND_IN_DEGREES
      )
    }
  })

  it('should resolve the same coordinate for a target at a celestial pole whatever its right ascension', () => {
    // The right ascension of a target at a pole is degenerate, and so the apparent coordinate of
    // the pole is the one point on the sky whichever meridian it is given on:
    const velocity = { x: V, y: V, z: 0 }

    for (const dec of [90, -90]) {
      const reference = getApparentEquatorialCoordinate(
        datetime,
        { ra: 0, dec },
        undefined,
        velocity
      )

      for (const ra of [45, 90, 180, 270, 359.9999]) {
        const apparent = getApparentEquatorialCoordinate(datetime, { ra, dec }, undefined, velocity)

        expect(
          getAngularSeparation(
            { θ: apparent.dec, φ: apparent.ra },
            { θ: reference.dec, φ: reference.ra }
          )
        ).toBeLessThan(MICROARCSECOND_IN_DEGREES)
      }
    }
  })

  it('should return a finite coordinate within the range of the sphere for a target near either celestial pole', () => {
    const velocity = { x: V, y: -V, z: V }

    for (const dec of polar) {
      for (const ra of [0, 0.0001, 120, 359.9999]) {
        const apparent = getApparentEquatorialCoordinate(
          datetime,
          { ra, dec, parallax: 0.7686 },
          proximaProperMotion,
          velocity
        )

        expect(Number.isFinite(apparent.ra)).toBe(true)
        expect(Number.isFinite(apparent.dec)).toBe(true)
        expect(apparent.ra).toBeGreaterThanOrEqual(0)
        expect(apparent.ra).toBeLessThan(360)
        expect(apparent.dec).toBeGreaterThanOrEqual(-90)
        expect(apparent.dec).toBeLessThanOrEqual(90)
      }
    }
  })
})

/*****************************************************************************************************************/
