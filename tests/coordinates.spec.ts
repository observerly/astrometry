/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  EARTH_RADIUS,
  type EquatorialCoordinate,
  convertEclipticToEquatorial,
  convertEquatorialToHorizontal,
  convertGeocentricToGeographic,
  convertGalacticToEquatorial,
  convertHorizontalToEquatorial,
  getGreenwichSiderealTime
} from '../src'

import {
  convertDegreesToRadians as radians,
  convertRadiansToDegrees as degrees
} from '../src/utilities'

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

describe('convertEclipticToEquatorial', () => {
  it('should be defined', () => {
    expect(convertEclipticToEquatorial).toBeDefined()
  })

  it('should return the correct equatorial coodinate for the planet Venus for the datetime provided', () => {
    const venus = {
      λ: 245.79403406596947,
      β: 1.8937944394473665
    }

    const { ra, dec } = convertEclipticToEquatorial(new Date('2016-01-04T03:00:00+00:00'), venus)
    expect(ra).toBe(244.24840810235008)
    expect(dec).toBe(-19.403239194263925)
  })
})

/*****************************************************************************************************************/

describe('convertEquatorialToHorizontal', () => {
  it('should be defined', () => {
    expect(convertEquatorialToHorizontal).toBeDefined()
  })

  it('should return the correct horizontal coodinate for the star Betelgeuse for the datetime provided', () => {
    const { alt, az } = convertEquatorialToHorizontal(datetime, { latitude, longitude }, betelgeuse)
    expect(alt).toBe(72.78539444063765)
    expect(az).toBe(134.44877920325155)
  })

  it('should return the correct horizontal coodinate for a target directly overhead for the datetime provided', () => {
    const GST = getGreenwichSiderealTime(datetime)

    // The observer is at the same latitude as Betelgeuse's declination, and the same longitude as as
    // Betelgeuse's right ascension minus the GST times 15 degrees per hour:
    // This simulates a target directly overhead for the "observer":
    const observer = { latitude: betelgeuse.dec, longitude: betelgeuse.ra - GST * 15 }

    // Convert the target to horizontal coordinates:
    const target = convertEquatorialToHorizontal(datetime, observer, betelgeuse)
    // The target should be directly overhead:
    expect(target.alt).toBe(90)
    // The target should be at the observer's meridian:
    expect(target.az).toBe(270)
  })

  it('should not displace a distant target for an observer at an elevation greater than 0', () => {
    // The elevation of the observer does not change where a distant target is on the celestial
    // sphere: it depresses the observer's horizon, which the horizon-relative predicates apply:
    const { alt, az } = convertEquatorialToHorizontal(datetime, { latitude, longitude, elevation: 100 }, betelgeuse)
    expect(alt).toBe(72.78539444063765)
    expect(az).toBe(134.44877920325155)
  })

  it('should return a target at the zenith at an altitude of 90 degrees for an elevated observer', () => {
    const GST = getGreenwichSiderealTime(datetime)

    // The observer is directly beneath the target, at the elevation of Mauna Kea:
    const observer = {
      latitude: betelgeuse.dec,
      longitude: betelgeuse.ra - GST * 15,
      elevation: 4207
    }

    const target = convertEquatorialToHorizontal(datetime, observer, betelgeuse)

    // The altitude of a target is bounded by the zenith, whatever the observer's elevation:
    expect(target.alt).toBe(90)
  })

  it('should return the correct horizontal coordinate for an observer below sea level', () => {
    // The dip of the horizon vanishes at sea level, and so an observer below sea level resolves
    // the same horizontal coordinate as an observer at sea level:
    const { alt, az } = convertEquatorialToHorizontal(
      datetime,
      { latitude, longitude, elevation: -430 },
      betelgeuse
    )

    expect(alt).toBe(72.78539444063765)
    expect(az).toBe(134.44877920325155)
  })

  it('should not displace a distant target for an observer at a very large elevation', () => {
    // The altitude of a distant target is the same for an observer in low Earth orbit as it is at
    // sea level, as the depression of the horizon belongs to the horizon, and not to the target:
    const { alt } = convertEquatorialToHorizontal(
      datetime,
      { latitude, longitude, elevation: 400000 },
      betelgeuse
    )

    const { alt: sea } = convertEquatorialToHorizontal(datetime, { latitude, longitude }, betelgeuse)

    expect(alt).toBeCloseTo(sea, 9)
  })

  it('should correct the altitude of a nearby target for its diurnal parallax', () => {
    // The geocentric horizontal coordinate of the target, e.g., with no distance to the target:
    const geocentric = convertEquatorialToHorizontal(datetime, { latitude, longitude }, betelgeuse)

    // The topocentric horizontal coordinate of the target, at the mean distance of the Moon:
    const topocentric = convertEquatorialToHorizontal(datetime, { latitude, longitude }, {
      ...betelgeuse,
      distance: 384400000
    })

    // The horizontal parallax at the mean distance of the Moon is ~0.95°, and the parallax at the
    // altitude of the target is that parallax projected onto the vertical circle of the target:
    const p = degrees(Math.asin(EARTH_RADIUS / 384400000)) * Math.cos(radians(geocentric.alt))

    expect(p).toBeCloseTo(0.28, 2)

    // The parallax displaces the target towards the horizon, and so the topocentric altitude is
    // always lower than the geocentric altitude:
    expect(topocentric.alt).toBeCloseTo(geocentric.alt - p, 6)
    expect(topocentric.alt).toBeLessThan(geocentric.alt)

    // The parallax acts along the vertical circle of the target, and so the azimuth is unchanged:
    expect(topocentric.az).toBe(geocentric.az)
  })

  it('should not correct the altitude of a distant target for its diurnal parallax', () => {
    const geocentric = convertEquatorialToHorizontal(datetime, { latitude, longitude }, betelgeuse)

    // At the distance of Betelgeuse, e.g., ~548 light years, the parallax is negligible:
    const topocentric = convertEquatorialToHorizontal(datetime, { latitude, longitude }, {
      ...betelgeuse,
      distance: 5.18e18
    })

    expect(topocentric.alt).toBeCloseTo(geocentric.alt, 9)
    expect(topocentric.az).toBe(geocentric.az)
  })
})

/*****************************************************************************************************************/

describe('convertHorizontalToEquatorial', () => {
  it('should be defined', () => {
    expect(convertHorizontalToEquatorial).toBeDefined()
  })

  it('should return the correct equatorial coodinate for the given horizontal coordinate at the datetime provided', () => {
    const { ra, dec } = convertHorizontalToEquatorial(
      datetime,
      { latitude, longitude },
      { alt: 72.78539444063765, az: 134.44877920325155 }
    )
    expect(ra).toBeCloseTo(88.7929583)
    expect(dec).toBeCloseTo(7.4070639)
  })
})

/*****************************************************************************************************************/

describe('convertGalacticToEquatorial', () => {
  it('should be defined', () => {
    expect(convertGalacticToEquatorial).toBeDefined()
  })

  it('should return the correct equatorial coodinate for the given galactic coordinate at J2000.0 epoch', () => {
    const { ra, dec } = convertGalacticToEquatorial({
      l: 180.0,
      b: 55.33333333
    })
    expect(ra).toBe(153.92856024361822)
    expect(dec).toBe(40.55960513183074)
  })
})

/*****************************************************************************************************************/

describe('convertEquatorialToHorizontal for an observer at a celestial pole', () => {
  it('should resolve the altitude of a target to its declination at either pole', () => {
    // Every target circles the horizon of an observer at a pole at a constant altitude, e.g., its
    // declination, which the conversion resolves through its ordinary path, and does not intercept
    // with a sentinel coordinate:
    for (const target of [betelgeuse, { ra: 21.07875, dec: -88.9569444 }]) {
      const north = convertEquatorialToHorizontal(datetime, { latitude: 90, longitude: 0 }, target)

      expect(north.alt).toBeCloseTo(target.dec, 9)
      expect(Number.isFinite(north.az)).toBe(true)

      const south = convertEquatorialToHorizontal(datetime, { latitude: -90, longitude: 0 }, target)

      expect(south.alt).toBeCloseTo(-target.dec, 9)
      expect(Number.isFinite(south.az)).toBe(true)
    }
  })

  it('should return NaN for a latitude that is not finite', () => {
    // A latitude of NaN or of ±Infinity does not name an observer, and so the coordinate returned
    // is NaN, rather than a sentinel a caller would take for a real coordinate:
    for (const latitude of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const coordinate = convertEquatorialToHorizontal(datetime, { latitude, longitude: 0 }, betelgeuse)

      expect(Number.isNaN(coordinate.alt)).toBe(true)
      expect(Number.isNaN(coordinate.az)).toBe(true)
    }
  })
})

/*****************************************************************************************************************/

describe('convertGeocentricToGeographic', () => {
  // The position of an observer above the given geographic coordinate, at the given distance from
  // the center of the Earth, e.g., the inverse of the conversion under test, resolved from the
  // sidereal rotation of the Earth:
  const getGeocentricPosition = (
    datetime: Date,
    { latitude, longitude }: { latitude: number; longitude: number },
    distance: number
  ) => {
    const α = radians(longitude + getGreenwichSiderealTime(datetime) * 15)

    const φ = radians(latitude)

    return {
      x: distance * Math.cos(φ) * Math.cos(α),
      y: distance * Math.cos(φ) * Math.sin(α),
      z: distance * Math.sin(φ)
    }
  }

  it('should be defined', () => {
    expect(convertGeocentricToGeographic).toBeDefined()
  })

  it('should resolve a position above the meridian of Greenwich at the equator', () => {
    const distance = EARTH_RADIUS + 420000

    const position = getGeocentricPosition(datetime, { latitude: 0, longitude: 0 }, distance)

    const { latitude, longitude, elevation } = convertGeocentricToGeographic(datetime, position)

    expect(latitude).toBeCloseTo(0, 9)
    expect(longitude).toBeCloseTo(0, 9)
    expect(elevation).toBeCloseTo(420000, 6)
  })

  it('should resolve a position above the observer at Mauna Kea', () => {
    const distance = EARTH_RADIUS + 550000

    const position = getGeocentricPosition(datetime, { latitude, longitude }, distance)

    const geographic = convertGeocentricToGeographic(datetime, position)

    expect(geographic.latitude).toBeCloseTo(latitude, 9)
    expect(geographic.longitude).toBeCloseTo(longitude, 9)
    expect(geographic.elevation).toBeCloseTo(550000, 6)
  })

  it('should resolve a position above either pole', () => {
    for (const sign of [1, -1]) {
      const { latitude, longitude, elevation } = convertGeocentricToGeographic(datetime, {
        x: 0,
        y: 0,
        z: sign * (EARTH_RADIUS + 420000)
      })

      expect(latitude).toBeCloseTo(sign * 90, 9)
      expect(Number.isFinite(longitude)).toBe(true)
      expect(elevation).toBeCloseTo(420000, 6)
    }
  })

  it('should resolve the longitude the shorter way about the sphere', () => {
    const distance = EARTH_RADIUS + 420000

    for (const meridian of [179.5, -179.5, 90, -90]) {
      const position = getGeocentricPosition(datetime, { latitude: 0, longitude: meridian }, distance)

      const { longitude } = convertGeocentricToGeographic(datetime, position)

      expect(longitude).toBeCloseTo(meridian, 9)
      expect(longitude).toBeGreaterThanOrEqual(-180)
      expect(longitude).toBeLessThan(180)
    }
  })

  it('should take the elevation above the radius given', () => {
    // An observer of a different figure of the Earth gives the radius of it, e.g., the WGS84
    // equatorial radius, and the elevation is taken above that radius:
    const radius = 6378137

    const position = getGeocentricPosition(datetime, { latitude: 0, longitude: 0 }, radius + 420000)

    const { elevation } = convertGeocentricToGeographic(datetime, position, radius)

    expect(elevation).toBeCloseTo(420000, 6)
  })

  it('should resolve the elevation of a geostationary observer', () => {
    const distance = 42164000

    const position = getGeocentricPosition(datetime, { latitude: 0, longitude: 100 }, distance)

    const { elevation } = convertGeocentricToGeographic(datetime, position)

    expect(elevation).toBeCloseTo(distance - EARTH_RADIUS, 6)
  })

  it('should throw for a position with a component that is not finite', () => {
    for (const position of [
      { x: Number.NaN, y: 0, z: 0 },
      { x: 0, y: Number.POSITIVE_INFINITY, z: 0 },
      { x: 0, y: 0, z: Number.NEGATIVE_INFINITY }
    ]) {
      expect(() => convertGeocentricToGeographic(datetime, position)).toThrow(
        'Invalid position: each of the x, y and z components must be finite'
      )
    }
  })

  it('should throw for a position at the center of the Earth', () => {
    expect(() => convertGeocentricToGeographic(datetime, { x: 0, y: 0, z: 0 })).toThrow(
      'Invalid position: the position must not be at the center of the Earth'
    )
  })

  it('should throw for a radius that is not finite', () => {
    expect(() =>
      convertGeocentricToGeographic(datetime, { x: EARTH_RADIUS, y: 0, z: 0 }, Number.NaN)
    ).toThrow('Invalid radius: the radius must be finite')
  })

  it('should throw for a radius that is not greater than zero', () => {
    for (const radius of [0, -6378137]) {
      expect(() =>
        convertGeocentricToGeographic(datetime, { x: EARTH_RADIUS, y: 0, z: 0 }, radius)
      ).toThrow('Invalid radius: the radius must be greater than zero')
    }
  })
})

/*****************************************************************************************************************/
