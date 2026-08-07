/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/occultation
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import {
  EARTH_RADIUS,
  getEarthLimbAngularRadius,
  getLocalHorizon,
  isBodyOccultedByEarth
} from '../src'

/*****************************************************************************************************************/

describe('getEarthLimbAngularRadius', () => {
  it('should be defined', () => {
    expect(getEarthLimbAngularRadius).toBeDefined()
  })

  it('should span a hemisphere for an observer at the surface', () => {
    expect(getEarthLimbAngularRadius(0)).toBe(90)
  })

  it('should occult a third of the sky for an observer in low Earth orbit', () => {
    // At the altitude of the International Space Station the Earth is a disc of ~70° in angular
    // radius, e.g., it occults ~33% of the sky:
    expect(getEarthLimbAngularRadius(4.08e5)).toBeCloseTo(70.031, 3)
  })

  it('should occult a small disc for an observer at a geostationary altitude', () => {
    expect(getEarthLimbAngularRadius(3.5786e7)).toBeCloseTo(8.7, 2)
  })

  it('should be the complement of the horizon depression of the same observer', () => {
    // Both are resolved from the same right triangle, and so, in the absence of refraction and of
    // a grazing height, the angular radius and the depression sum to 90°:
    for (let elevation = 1; elevation < 4e7; elevation *= 2) {
      expect(getEarthLimbAngularRadius(elevation) + getLocalHorizon(elevation, 0)).toBeCloseTo(90, 9)
    }
  })

  it('should be raised by the grazing height of the atmospheric shell to clear', () => {
    // An observer that must not look through the upper atmosphere avoids a larger cone:
    const bare = getEarthLimbAngularRadius(4.08e5)

    const grazed = getEarthLimbAngularRadius(4.08e5, 1e5)

    expect(grazed).toBeGreaterThan(bare)
    expect(grazed - bare).toBeCloseTo(2.64, 2)
  })

  it('should decrease monotonically with the elevation of the observer', () => {
    let previous = 90

    for (let elevation = 0; elevation < 4e7; elevation += 1e5) {
      const radius = getEarthLimbAngularRadius(elevation)

      expect(radius).toBeLessThanOrEqual(previous)
      expect(radius).toBeGreaterThanOrEqual(0)

      previous = radius
    }
  })

  it('should span a hemisphere for an observer at or below the shell they are to clear', () => {
    // The observer is enclosed by the shell, and so it spans the whole of the sky beneath them,
    // rather than resolving to an angular radius that is not a number:
    expect(getEarthLimbAngularRadius(-1000)).toBe(90)
    expect(getEarthLimbAngularRadius(1e5, 1e5)).toBe(90)
    expect(getEarthLimbAngularRadius(5e4, 1e5)).toBe(90)
  })

  it('should span a hemisphere for an observer at or beneath the center of the Earth', () => {
    // The ratio of the shell to the distance is negative, rather than greater than one, for such an
    // observer, and so the limb is resolved from the distances and not from their ratio:
    expect(getEarthLimbAngularRadius(-EARTH_RADIUS)).toBe(90)
    expect(getEarthLimbAngularRadius(-2 * EARTH_RADIUS)).toBe(90)
    expect(getEarthLimbAngularRadius(Number.NEGATIVE_INFINITY)).toBe(90)
  })

  it('should vanish for an observer at an infinite distance', () => {
    expect(getEarthLimbAngularRadius(Number.POSITIVE_INFINITY)).toBe(0)
  })

  it('should not resolve to an angular radius for an elevation, grazing height or radius that is not a number', () => {
    // The limb is not resolvable, and so it is not reported as an angular radius that would be
    // taken for one, e.g., as a hemisphere or as a vanishing disc:
    expect(getEarthLimbAngularRadius(Number.NaN)).toBeNaN()
    expect(getEarthLimbAngularRadius(4.08e5, Number.NaN)).toBeNaN()
    expect(getEarthLimbAngularRadius(4.08e5, 0, Number.NaN)).toBeNaN()
    expect(getEarthLimbAngularRadius(4.08e5, 0, -EARTH_RADIUS)).toBeNaN()
  })

  it('should resolve the limb of any body of the radius given', () => {
    // The geometry is not particular to the Earth, and so an observer above another body resolves
    // its limb by giving its radius, e.g., the Moon at an elevation of 100 km:
    expect(getEarthLimbAngularRadius(1e5, 0, 1.7374e6)).toBeCloseTo(71.01, 2)
  })

  it('should resolve the limb against the radius given by the caller', () => {
    // An observer that resolves the oblateness of the Earth passes the radius local to the point
    // the limb is grazed, which, at a fixed distance from the center of the Earth, is half a degree
    // of angular radius between the equatorial and the polar radius of the ellipsoid:
    const polar = EARTH_RADIUS * (1 - 1 / 298.257223563)

    const distance = EARTH_RADIUS + 4.08e5

    const equatorial = getEarthLimbAngularRadius(distance - EARTH_RADIUS)

    expect(equatorial - getEarthLimbAngularRadius(distance - polar, 0, polar)).toBeCloseTo(0.522, 3)
  })
})

/*****************************************************************************************************************/

describe('isBodyOccultedByEarth', () => {
  // For testing we need to specify a date because most calculations are differential w.r.t a time
  // component. We set it to the author's birthday:
  const datetime = new Date('2021-05-14T00:00:00.000+00:00')

  // For testing, the observer is at the altitude of the International Space Station:
  const observer = { latitude: 0, longitude: 0, elevation: 4.08e5 }

  it('should be defined', () => {
    expect(isBodyOccultedByEarth).toBeDefined()
  })

  it('should occult a target below the limb of the Earth', () => {
    // The limb is ~70.03° in angular radius from the altitude of the observer, and so it reaches to
    // an altitude of ~-19.97°, beneath which a target is behind the Earth:
    expect(isBodyOccultedByEarth(datetime, observer, { alt: -20.1, az: 0 })).toBe(true)
    expect(isBodyOccultedByEarth(datetime, observer, { alt: -90, az: 0 })).toBe(true)
  })

  it('should not occult a target above the limb of the Earth', () => {
    expect(isBodyOccultedByEarth(datetime, observer, { alt: -19.9, az: 0 })).toBe(false)
    expect(isBodyOccultedByEarth(datetime, observer, { alt: 45, az: 0 })).toBe(false)
    expect(isBodyOccultedByEarth(datetime, observer, { alt: 90, az: 0 })).toBe(false)
  })

  it('should occult at the altitude the angular radius of the limb reaches to', () => {
    // The nadir of the observer is at an altitude of -90°, and so the limb reaches to an altitude
    // of its angular radius less 90°:
    const limb = getEarthLimbAngularRadius(observer.elevation)

    expect(isBodyOccultedByEarth(datetime, observer, { alt: limb - 90 - 1e-6, az: 0 })).toBe(true)
    expect(isBodyOccultedByEarth(datetime, observer, { alt: limb - 90 + 1e-6, az: 0 })).toBe(false)
  })

  it('should occult a larger cone for an observer clearing a grazing height', () => {
    // The shell raises the limb by ~2.64°, and so a target that clears the solid Earth is occulted
    // where the observer must not look through the upper atmosphere:
    expect(isBodyOccultedByEarth(datetime, observer, { alt: -18, az: 0 })).toBe(false)
    expect(isBodyOccultedByEarth(datetime, observer, { alt: -18, az: 0 }, 1e5)).toBe(true)
  })

  it('should reduce to the horizon for an observer at the surface', () => {
    // The limb spans a hemisphere for an observer at the surface, and so a target is occulted by
    // the Earth exactly where it is below the horizon:
    const surface = { latitude: 0, longitude: 0 }

    expect(isBodyOccultedByEarth(datetime, surface, { alt: -0.1, az: 0 })).toBe(true)
    expect(isBodyOccultedByEarth(datetime, surface, { alt: 0, az: 0 })).toBe(false)
    expect(isBodyOccultedByEarth(datetime, surface, { alt: 0.1, az: 0 })).toBe(false)
  })

  it('should accept an equatorial coordinate as well as a horizontal one', () => {
    const target = { ra: 88.7929583, dec: 7.4070639 }

    expect(typeof isBodyOccultedByEarth(datetime, observer, target)).toBe('boolean')
  })

  it('should not report a target that is not resolvable as occulted', () => {
    // The Earth is not known to hide a target whose altitude is not a number, and so it is not
    // reported as one that it does:
    expect(isBodyOccultedByEarth(datetime, observer, { alt: Number.NaN, az: 0 })).toBe(false)
  })

  it('should resolve the limb against the radius given by the caller', () => {
    const polar = EARTH_RADIUS * (1 - 1 / 298.257223563)

    // The polar limb is smaller at the same distance from the center of the Earth, and so it
    // reaches to a lower altitude, and occults less of the sky:
    const alt = getEarthLimbAngularRadius(observer.elevation) - 90 - 1e-6

    expect(isBodyOccultedByEarth(datetime, observer, { alt, az: 0 })).toBe(true)
    expect(isBodyOccultedByEarth(datetime, observer, { alt, az: 0 }, 0, polar)).toBe(false)
  })
})

/***************************************************************************************************************/
