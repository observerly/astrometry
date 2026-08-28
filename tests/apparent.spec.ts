/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/apparent
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  type EquatorialCoordinate,
  getApparentEquatorialCoordinate,
  getCorrectionToEquatorialForAnnualAberration,
  getCorrectionToEquatorialForAnnualParallax,
  getCorrectionToEquatorialForProperMotion,
  getCorrectionToEquatorialForVelocityAberration
} from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

// For testing
const betelgeuse: EquatorialCoordinate = { ra: 88.7929583, dec: 7.4070639 }

// Proxima Centauri subtends the largest annual parallax of any star, at ~0.7686 arcseconds:
const proxima: EquatorialCoordinate = { ra: 217.42895, dec: -62.67948, parallax: 0.7686 }

// The proper motion of Proxima Centauri, in arcseconds per Julian year:
const proximaProperMotion = { ra: -3.86159, dec: 0.77489 }

// The orbital speed of an observer in a low Earth orbit (in SI metres per second):
const V = 7669

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

    expect(ra).toBeCloseTo(proxima.ra + parallax.ra + annual.ra, 9)
    expect(dec).toBeCloseTo(proxima.dec + parallax.dec + annual.dec, 9)
  })

  it('should carry a target by its proper motion before the displacements of the observer', () => {
    // The proper motion carries the target from the epoch of the catalogue to the datetime of the
    // observation, and the displacements of the observer are resolved about the moved target:
    const motion = getCorrectionToEquatorialForProperMotion(datetime, proxima, proximaProperMotion)

    const moved = { ...proxima, ra: proxima.ra + motion.ra, dec: proxima.dec + motion.dec }

    const parallax = getCorrectionToEquatorialForAnnualParallax(datetime, moved)

    const annual = getCorrectionToEquatorialForAnnualAberration(datetime, moved)

    const { ra, dec } = getApparentEquatorialCoordinate(datetime, proxima, proximaProperMotion)

    expect(ra).toBeCloseTo(moved.ra + parallax.ra + annual.ra, 9)
    expect(dec).toBeCloseTo(moved.dec + parallax.dec + annual.dec, 9)

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

    expect(moving.ra).toBeCloseTo(at.ra + orbital.ra, 9)
    expect(moving.dec).toBeCloseTo(at.dec + orbital.dec, 9)
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
})

/*****************************************************************************************************************/
