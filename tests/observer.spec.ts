/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/observer
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import {
  getCorrectionToEquatorialForDiurnalAberration,
  getCorrectionToEquatorialForVelocityAberration,
  getGeocentricRotationalVelocity,
  getGeographicCoordinate,
  getLocalHorizon,
  getLocalSiderealTime,
  type GeographicCoordinateAtEpoch,
  type Observer
} from '../src'

import { convertDegreesToRadians as radians } from '../src/utilities'

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

describe('getGeocentricRotationalVelocity', () => {
  const datetime = new Date('2021-05-14T00:00:00.000+00:00')

  it('should be defined', () => {
    expect(getGeocentricRotationalVelocity).toBeDefined()
  })

  it('should carry an observer at the equator at ~465 metres per second', () => {
    const velocity = getGeocentricRotationalVelocity(datetime, { latitude: 0, longitude: 0 })

    expect(Math.hypot(velocity.x, velocity.y, velocity.z)).toBeCloseTo(465.1, 1)

    // The rotation carries the observer about the axis, and not along it:
    expect(velocity.z).toBe(0)
  })

  it('should vanish for an observer at the poles', () => {
    for (const latitude of [90, -90]) {
      const velocity = getGeocentricRotationalVelocity(datetime, { latitude, longitude: 0 })

      expect(Math.hypot(velocity.x, velocity.y, velocity.z)).toBeCloseTo(0, 9)
    }
  })

  it('should scale with the distance of the observer from the axis of rotation', () => {
    const surface = getGeocentricRotationalVelocity(datetime, { latitude, longitude })

    const elevated = getGeocentricRotationalVelocity(datetime, { latitude, longitude, elevation: 400000 })

    const ratio = Math.hypot(elevated.x, elevated.y) / Math.hypot(surface.x, surface.y)

    expect(ratio).toBeCloseTo((6.3781378e6 + 400000) / 6.3781378e6, 9)
  })

  it('should carry the observer towards the east of their meridian', () => {
    // The velocity is perpendicular to the direction to the observer, along the direction of
    // increasing right ascension at their meridian:
    const velocity = getGeocentricRotationalVelocity(datetime, { latitude, longitude })

    const α = radians(getLocalSiderealTime(datetime, longitude) * 15)

    const φ = radians(latitude)

    // The unit vector of the direction to the observer, in the geocentric equatorial frame:
    const direction = [Math.cos(φ) * Math.cos(α), Math.cos(φ) * Math.sin(α), Math.sin(φ)]

    const dot = velocity.x * direction[0] + velocity.y * direction[1] + velocity.z * direction[2]

    expect(dot).toBeCloseTo(0, 6)

    // The east at the meridian is the direction of increasing right ascension:
    const east = [-Math.sin(α), Math.cos(α), 0]

    const along = velocity.x * east[0] + velocity.y * east[1] + velocity.z * east[2]

    expect(along).toBeCloseTo(Math.hypot(velocity.x, velocity.y, velocity.z), 6)
  })

  it('should resolve the diurnal aberration as the aberration of the velocity', () => {
    // The diurnal aberration is the aberration of the velocity of the rotation of the Earth
    // carrying the observer, and so the velocity aberration of this velocity agrees with the
    // diurnal correction, to within the second order of the two formulations:
    const observer = { latitude, longitude }

    const betelgeuse = { ra: 88.7929583, dec: 7.4070639 }

    const velocity = getGeocentricRotationalVelocity(datetime, observer)

    const resolved = getCorrectionToEquatorialForVelocityAberration(betelgeuse, velocity)

    const diurnal = getCorrectionToEquatorialForDiurnalAberration(datetime, observer, betelgeuse)

    expect(resolved.ra).toBeCloseTo(diurnal.ra, 8)
    expect(resolved.dec).toBeCloseTo(diurnal.dec, 8)
  })
})

/*****************************************************************************************************************/

describe('getGeographicCoordinate', () => {
  const datetime = new Date('2021-05-14T00:00:00.000+00:00')

  const observer = { latitude, longitude, elevation }

  it('should be defined', () => {
    expect(getGeographicCoordinate).toBeDefined()
  })

  it('should return an observer given as a coordinate as they are', () => {
    expect(getGeographicCoordinate(datetime, observer)).toBe(observer)
  })

  it('should resolve an observer given as a coordinate at an epoch for the datetime', () => {
    const ephemeris: GeographicCoordinateAtEpoch = when => ({
      latitude: when.getUTCFullYear() === 2021 ? latitude : 0,
      longitude
    })

    expect(getGeographicCoordinate(datetime, ephemeris)).toEqual({ latitude, longitude })
  })

  it('should not carry a mutation of the datetime by the function into the caller', () => {
    // The function is the caller's code, and a Date is mutable, and so a function that mutates
    // the one it is given must not change the datetime of the caller:
    const hostile: GeographicCoordinateAtEpoch = when => {
      when.setTime(0)

      return observer
    }

    const when = new Date(datetime.getTime())

    getGeographicCoordinate(when, hostile)

    expect(when.getTime()).toBe(datetime.getTime())
  })
})

/*****************************************************************************************************************/
