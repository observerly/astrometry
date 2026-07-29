/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  convertEquatorialToHorizontal,
  type EquatorialCoordinate,
  getAngularSeparation,
  getAntipodeCoordinate,
  getGreenwichApparentSiderealTime,
  getGreenwichSiderealTime,
  getHourAngle,
  getLocalApparentSiderealTime,
  getLocalSiderealTime,
  getNormalisedSphericalCoordinate,
  getParallacticAngle
} from '../src'

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

const arcturus: EquatorialCoordinate = { ra: 213.9153, dec: 19.182409 }

const spica: EquatorialCoordinate = { ra: 201.2983, dec: -11.1614 }

/*****************************************************************************************************************/

describe('getAngularSeparation', () => {
  it('should be defined', () => {
    expect(getAngularSeparation).toBeDefined()
  })

  it('should return the angular separation between two objects', () => {
    const θ = getAngularSeparation(
      {
        θ: arcturus.dec,
        φ: arcturus.ra
      },
      {
        θ: spica.dec,
        φ: spica.ra
      }
    )
    expect(θ).toBe(32.79290589269233)
  })

  it('should return the greatest possible angular separation for two objects at their antipodes', () => {
    const θ = getAngularSeparation(
      {
        θ: 30,
        φ: 0
      },
      {
        θ: -30,
        φ: 180
      }
    )
    expect(θ).toBe(180)
  })

  it('should return the maximum possible angular separation for two objects at their antipodes', () => {
    const θ = getAngularSeparation(
      {
        θ: 90,
        φ: 0
      },
      {
        θ: -90,
        φ: 180
      }
    )
    expect(θ).toBe(180)
  })
})

/*****************************************************************************************************************/

describe('getAntipodeCoordinate', () => {
  it('should be defined', () => {
    expect(getAntipodeCoordinate).toBeDefined()
  })

  it('should return the antipode of the given object', () => {
    const antipode = getAntipodeCoordinate({
      θ: -30,
      φ: 30
    })

    expect(antipode.θ).toBe(30)
    expect(antipode.φ).toBe(210)
  })

  it('should return the antipode of the given object', () => {
    const antipode = getAntipodeCoordinate({
      θ: 60,
      φ: 90
    })

    expect(antipode.θ).toBe(-60)
    expect(antipode.φ).toBe(270)
  })

  it('should return an azimuthal angle within the range [0, 360) for any coordinate given', () => {
    for (let φ = -720; φ <= 720; φ += 13) {
      const antipode = getAntipodeCoordinate({ θ: 0, φ })

      expect(antipode.φ).toBeGreaterThanOrEqual(0)
      expect(antipode.φ).toBeLessThan(360)
    }
  })

  it('should be diametrically opposite to the coordinate given', () => {
    // The angular separation between a coordinate and its antipode is 180°, e.g., the two points
    // lie at either end of a diameter of the sphere:
    for (const A of [
      { θ: 0, φ: 0 },
      { θ: 45, φ: 30 },
      { θ: -45, φ: 200 },
      { θ: 90, φ: 123 },
      { θ: 19.182409, φ: 213.9153 }
    ]) {
      expect(getAngularSeparation(A, getAntipodeCoordinate(A))).toBeCloseTo(180, 9)
    }
  })
})

/*****************************************************************************************************************/

describe('getNormalisedSphericalCoordinate', () => {
  it('should be defined', () => {
    expect(getNormalisedSphericalCoordinate).toBeDefined()
  })

  it('should return the normalised spherical coordinate when normalisation is not needed', () => {
    const normalised = getNormalisedSphericalCoordinate({
      θ: 60,
      φ: 90
    })

    expect(normalised.θ).toBe(60)
    expect(normalised.φ).toBe(90)
  })

  it('should return the normalised spherical coordinate when positive bounds are exceeded', () => {
    const normalised = getNormalisedSphericalCoordinate({
      θ: 120,
      φ: 450
    })

    // The polar angle is reflected back over the north pole, and so the azimuthal angle is rotated
    // to the antipodal meridian:
    expect(normalised.θ).toBe(60)
    expect(normalised.φ).toBe(270)
  })

  it('should return the normalised spherical coordinate when negative bounds are exceeded', () => {
    const normalised = getNormalisedSphericalCoordinate({
      θ: -120,
      φ: -270
    })

    // The polar angle is reflected back over the south pole, and so the azimuthal angle is rotated
    // to the antipodal meridian:
    expect(normalised.θ).toBe(-60)
    expect(normalised.φ).toBe(270)
  })

  it('should not rotate the azimuthal angle when the polar angle is within the bounds of the poles', () => {
    for (const θ of [-90, -45, 0, 45, 90]) {
      expect(getNormalisedSphericalCoordinate({ θ, φ: 90 })).toEqual({ θ, φ: 90 })
    }
  })

  it('should return the same point on the sphere as the coordinate given', () => {
    // The angular separation between a coordinate and its normalisation is zero if, and only if,
    // both describe the same point on the sphere:
    for (const A of [
      { θ: 92, φ: 45 },
      { θ: -92, φ: 45 },
      { θ: 179, φ: 200 },
      { θ: -179, φ: 200 },
      { θ: 271, φ: -30 },
      { θ: 120, φ: 450 }
    ]) {
      expect(getAngularSeparation(A, getNormalisedSphericalCoordinate(A))).toBeCloseTo(0, 9)
    }
  })

  it('should normalise the polar angle to the range [-90, 90] and the azimuthal angle to the range [0, 360)', () => {
    for (let θ = -720; θ <= 720; θ += 37) {
      for (let φ = -720; φ <= 720; φ += 13) {
        const normalised = getNormalisedSphericalCoordinate({ θ, φ })

        expect(normalised.θ).toBeGreaterThanOrEqual(-90)
        expect(normalised.θ).toBeLessThanOrEqual(90)
        expect(normalised.φ).toBeGreaterThanOrEqual(0)
        expect(normalised.φ).toBeLessThan(360)
      }
    }
  })
})

/*****************************************************************************************************************/

describe('getGreenwichSiderealTime', () => {
  it('should be defined', () => {
    expect(getGreenwichSiderealTime).toBeDefined()
  })

  it('should return the Greenwich Sidereal Time (GST) of the given date', () => {
    const GST = getGreenwichSiderealTime(datetime)
    expect(GST).toBe(15.463990399019053)
  })

  it('should return a target that is directly overhead at for ', () => {
    const GST = getGreenwichSiderealTime(datetime)

    // The observer is at the same latitude as Betelgeuse's declination, and the same longitude as as
    // Betelgeuse's right ascension minus the GST times 15 degrees per hour:
    // This simulates a target directly overhead for the "observer":
    const observer = { latitude: betelgeuse.dec, longitude: betelgeuse.ra - GST * 15 }

    // Convert the target to horizontal coordinates:
    const target = convertEquatorialToHorizontal(datetime, observer, betelgeuse)
    // The target should be directly overhead:
    expect(target.alt).toBe(90)
  })
})

/*****************************************************************************************************************/

describe('getGreenwichApparentSiderealTime', () => {
  it('should be defined', () => {
    expect(getGreenwichApparentSiderealTime).toBeDefined()
  })

  it('should return the Greenwich Apparent Sidereal Time (GAST) of the given date', () => {
    const GAST = getGreenwichApparentSiderealTime(datetime)
    expect(GAST).toBe(15.463691802606913)
  })

  it('should differ from the Greenwich Mean Sidereal Time (GMST) by the equation of the equinoxes', () => {
    const GAST = getGreenwichApparentSiderealTime(datetime)
    const GMST = getGreenwichSiderealTime(datetime)
    // The equation of the equinoxes is always less than around one second of time:
    expect(Math.abs(GAST - GMST) * 3600).toBeLessThan(1.2)
  })

  it('should return the Greenwich Apparent Sidereal Time (GAST) for the Meeus example epoch', () => {
    // Meeus, Astronomical Algorithms, Example 12.a, for 1987 April 10 at 0h UT, for which the
    // apparent sidereal time at Greenwich is 13h 10m 46.1351s:
    const GAST = getGreenwichApparentSiderealTime(new Date('1987-04-10T00:00:00.000+00:00'))
    expect(GAST).toBeCloseTo(13 + 10 / 60 + 46.1351 / 3600, 4)
  })
})

/*****************************************************************************************************************/

describe('getLocalSiderealTime', () => {
  it('should be defined', () => {
    expect(getLocalSiderealTime).toBeDefined()
  })

  it('should return the Local Sidereal Time (LST) of the given date at longitude 0 at Greenwich', () => {
    const LST = getLocalSiderealTime(datetime, 0)
    const GST = getGreenwichSiderealTime(datetime)
    expect(LST).toBe(GST)
  })

  it('should return the Local Sidereal Time (LST) of the given date at longitude 0 at Greenwich', () => {
    const datetime = new Date('2021-05-14T01:06:33.99870+00:00')
    const LST = getLocalSiderealTime(datetime, 0)
    const GST = getGreenwichSiderealTime(datetime)
    expect(LST).toBe(GST)
  })

  it('should return the Local Sidereal Time (LST) of the given date', () => {
    const LST = getLocalSiderealTime(datetime, longitude)
    expect(LST).toBe(5.099450799019053)
  })
})

/*****************************************************************************************************************/

describe('getLocalApparentSiderealTime', () => {
  it('should be defined', () => {
    expect(getLocalApparentSiderealTime).toBeDefined()
  })

  it('should return the Greenwich Apparent Sidereal Time (GAST) of the given date at longitude 0 at Greenwich', () => {
    const LAST = getLocalApparentSiderealTime(datetime, 0)
    const GAST = getGreenwichApparentSiderealTime(datetime)
    expect(LAST).toBe(GAST)
  })

  it('should return the Local Apparent Sidereal Time (LAST) of the given date', () => {
    const LAST = getLocalApparentSiderealTime(datetime, longitude)
    expect(LAST).toBe(5.099152202606913)
  })

  it('should differ from the Local Sidereal Time (LST) by the equation of the equinoxes', () => {
    const LAST = getLocalApparentSiderealTime(datetime, longitude)
    const LST = getLocalSiderealTime(datetime, longitude)
    // The equation of the equinoxes is always less than around one second of time:
    expect(Math.abs(LAST - LST) * 3600).toBeLessThan(1.2)
  })
})

/*****************************************************************************************************************/

describe('getHourAngle', () => {
  it('should be defined', () => {
    expect(getHourAngle).toBeDefined()
  })

  it('should return the Hour Angle (HA) of the given date at longitude 0 at Greenwich', () => {
    const HA = getHourAngle(datetime, 0, betelgeuse.ra)
    expect(HA).toBe(143.1668976852858)
  })

  it('should return the Hour Angle (HA) of the given date', () => {
    const HA = getHourAngle(datetime, longitude, betelgeuse.ra)
    expect(HA).toBe(347.6988036852858)
  })
})

/*****************************************************************************************************************/

describe('getParallacticAngle', () => {
  it('should be defined', () => {
    expect(getParallacticAngle).toBeDefined()
  })

  it('should return the Parallactic Angle (PA) of the given date at longitude 0 at Greenwich', () => {
    const q = getParallacticAngle(datetime, { latitude, longitude }, betelgeuse)
    expect(q).toBe(317.37187353779296)
  })
})

/*****************************************************************************************************************/
