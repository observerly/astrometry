/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/observer
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import {
  convertGeocentricToGeographic,
  convertGeographicToGeocentric,
  EARTH_FLATTENING,
  EARTH_RADIUS,
  getLocalHorizon,
  type Observer
} from '../src'

import { convertRadiansToDegrees as degrees } from '../src/utilities'

/*****************************************************************************************************************/

// For testing we will fix the latitude to be Manua Kea, Hawaii, US
export const latitude = 19.820611

// For testing we will fix the longitude to be Manua Kea, Hawaii, US:
export const longitude = -155.468094

// For testing we will fix the elevant to be at Sea Level:
export const elevation = 0

/*****************************************************************************************************************/

describe('getLocalHorizon', () => {
  it('should be defined', () => {
    expect(getLocalHorizon).toBeDefined
  })

  it('should return 0 when the observer is at sea level', () => {
    expect(getLocalHorizon(elevation)).toBe(0)
  })

  it('should return a sensible value for an observer at altitude, h, 1000m (with no refraction correction)', () => {
    expect(getLocalHorizon(elevation + 1000, 0)).toBeCloseTo(1.0146012026926674)
  })

  it('should return a sensible value for an observer at 1000m (with no refraction correction)', () => {
    const observer: Observer = {
      datetime: new Date('2021-05-14T00:00:00.000+00:00'),
      latitude,
      longitude,
      elevation: 1000
    }

    expect(getLocalHorizon(observer, 0)).toBeCloseTo(1.0146012026926674)
  })

  it('should return a sensible value for an observer at altitude, h, 1000m', () => {
    expect(getLocalHorizon(elevation + 1000)).toBeCloseTo(0.0293 * Math.sqrt(1000))
  })

  it('should return a sensible value for an observer at 1000m', () => {
    const observer: Observer = {
      datetime: new Date('2021-05-14T00:00:00.000+00:00'),
      latitude,
      longitude,
      elevation: 1000
    }

    expect(getLocalHorizon(observer)).toBeCloseTo(0.0293 * Math.sqrt(1000))
  })
})

/*****************************************************************************************************************/

describe('getLocalHorizon edge cases', () => {
  it('should return no depression for an observer below sea level', () => {
    // An observer below sea level is taken to be at sea level, where the depression vanishes:
    expect(getLocalHorizon(-430)).toBe(0)
    expect(getLocalHorizon(-430, 0)).toBe(0)
  })

  it('should return a depression bounded by the pole for a very large elevation', () => {
    // The small angle approximation of the depression diverges for elevations that are an
    // appreciable fraction of the radius of the Earth, e.g., for an observer at a geostationary
    // altitude, where the exact depression is ~81.3°:
    expect(getLocalHorizon(35786000, 0)).toBeCloseTo(81.3, 1)
    expect(getLocalHorizon(35786000, 0)).toBeLessThan(90)
  })

  it('should increase monotonically with the elevation of the observer', () => {
    let previous = 0

    for (const elevation of [0, 10, 100, 1000, 4207, 8849, 400000]) {
      const depression = getLocalHorizon(elevation)

      expect(depression).toBeGreaterThanOrEqual(previous)

      previous = depression
    }
  })
})

/*****************************************************************************************************************/

describe('convertGeographicToGeocentric', () => {
  it('should be defined', () => {
    expect(convertGeographicToGeocentric).toBeDefined()
  })

  it('should place an observer on the equator at the equatorial radius', () => {
    const { x, y, z } = convertGeographicToGeocentric({ latitude: 0, longitude: 0 })

    expect(x).toBeCloseTo(EARTH_RADIUS, 6)
    expect(y).toBeCloseTo(0, 6)
    expect(z).toBeCloseTo(0, 6)
  })

  it('should place an observer at the north pole at the polar radius', () => {
    const { x, y, z } = convertGeographicToGeocentric({ latitude: 90, longitude: 0 })

    expect(x).toBeCloseTo(0, 6)
    expect(y).toBeCloseTo(0, 6)
    expect(z).toBeCloseTo(EARTH_RADIUS * (1 - EARTH_FLATTENING), 6)
  })

  it('should place an observer on the equator at a longitude of 90 degrees on the y-axis', () => {
    const { x, y, z } = convertGeographicToGeocentric({ latitude: 0, longitude: 90 })

    expect(x).toBeCloseTo(0, 6)
    expect(y).toBeCloseTo(EARTH_RADIUS, 6)
    expect(z).toBeCloseTo(0, 6)
  })

  it('should place an observer at sea level on the surface of the reference ellipsoid', () => {
    // Every point at an elevation of zero satisfies the equation of the ellipsoid, e.g.,
    // x²/a² + y²/a² + z²/b² = 1, whatever its latitude and longitude:
    const b = EARTH_RADIUS * (1 - EARTH_FLATTENING)

    for (const latitude of [-90, -60, -23.5, 0, 23.5, 45, 60, 90]) {
      for (const longitude of [-180, -90, 0, 45, 90, 180]) {
        const { x, y, z } = convertGeographicToGeocentric({ latitude, longitude, elevation: 0 })

        expect((x ** 2 + y ** 2) / EARTH_RADIUS ** 2 + z ** 2 / b ** 2).toBeCloseTo(1, 12)
      }
    }
  })

  it('should displace an observer above the ellipsoid by their elevation along its normal', () => {
    // The normal of an oblate ellipsoid does not pass through its center, and so the geodetic
    // latitude of the observer exceeds their geocentric latitude, by ~11.5 arcminutes at most:
    const { x, y, z } = convertGeographicToGeocentric({ latitude: 45, longitude: 0, elevation: 0 })

    const geocentric = degrees(Math.atan2(z, Math.hypot(x, y)))

    expect((45 - geocentric) * 60).toBeCloseTo(11.5454, 3)
  })
})

/*****************************************************************************************************************/

describe('convertGeocentricToGeographic', () => {
  it('should be defined', () => {
    expect(convertGeocentricToGeographic).toBeDefined()
  })

  it('should recover the geographic coordinate of an observer at the surface', () => {
    const observer = { latitude, longitude, elevation: 4207 }

    const recovered = convertGeocentricToGeographic(convertGeographicToGeocentric(observer))

    expect(recovered.latitude).toBeCloseTo(observer.latitude, 9)
    expect(recovered.longitude).toBeCloseTo(observer.longitude, 9)
    expect(recovered.elevation).toBeCloseTo(observer.elevation, 6)
  })

  it('should recover the geographic coordinate of an observer in low Earth orbit', () => {
    // The observer is at the altitude of the International Space Station, e.g., an observer for
    // whom the horizon is depressed far below the astronomical horizon:
    const observer = { latitude: 51.6, longitude: -0.1276, elevation: 4.08e5 }

    const recovered = convertGeocentricToGeographic(convertGeographicToGeocentric(observer))

    expect(recovered.latitude).toBeCloseTo(observer.latitude, 9)
    expect(recovered.longitude).toBeCloseTo(observer.longitude, 9)
    expect(recovered.elevation).toBeCloseTo(observer.elevation, 6)
  })

  it('should recover the geographic coordinate of an observer at a geostationary altitude', () => {
    // A single pass of Bowring's method degrades with height, and so the observer is recovered at
    // an altitude at which the refinement of the auxiliary angle is required:
    const observer = { latitude: -33.8688, longitude: 151.2093, elevation: 3.5786e7 }

    const recovered = convertGeocentricToGeographic(convertGeographicToGeocentric(observer))

    expect(recovered.latitude).toBeCloseTo(observer.latitude, 9)
    expect(recovered.longitude).toBeCloseTo(observer.longitude, 9)
    expect(recovered.elevation).toBeCloseTo(observer.elevation, 6)
  })

  it('should recover an observer on the axis of rotation, where the longitude is degenerate', () => {
    const b = EARTH_RADIUS * (1 - EARTH_FLATTENING)

    const recovered = convertGeocentricToGeographic({ x: 0, y: 0, z: b + 1000 })

    expect(recovered.latitude).toBeCloseTo(90, 9)
    expect(recovered.elevation).toBeCloseTo(1000, 6)
  })
})

/*****************************************************************************************************************/
