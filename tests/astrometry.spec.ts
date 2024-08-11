/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  convertEquatorialToHorizontal,
  type EquatorialCoordinate,
  getAngularSeparation,
  getAntipodeCoordinate,
  getGreenwhichSiderealTime,
  getHourAngle,
  getLocalSiderealTime,
  getNormalisedSphericalCoordinate,
  getObliquityOfTheEcliptic,
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
      θ: 30,
      φ: -30
    })

    expect(antipode.θ).toBe(210)
    expect(antipode.φ).toBe(30)
  })

  it('should return the antipode of the given object', () => {
    const antipode = getAntipodeCoordinate({
      θ: 90,
      φ: 60
    })

    expect(antipode.θ).toBe(270)
    expect(antipode.φ).toBe(-60)
  })
})

/*****************************************************************************************************************/

describe('getNormalisedSphericalCoordinate', () => {
  it('should be defined', () => {
    expect(getNormalisedSphericalCoordinate).toBeDefined()
  })

  it('should return the normalised spherical coordinate when normalisation is not needed', () => {
    const normalised = getNormalisedSphericalCoordinate({
      θ: 90,
      φ: 60
    })

    expect(normalised.θ).toBe(90)
    expect(normalised.φ).toBe(60)
  })

  it('should return the normalised spherical coordinate when positive bounds are exceeded', () => {
    const normalised = getNormalisedSphericalCoordinate({
      θ: 450,
      φ: 120
    })

    expect(normalised.θ).toBe(90)
    expect(normalised.φ).toBe(60)
  })

  it('should return the normalised spherical coordinate when negative bounds are exceeded', () => {
    const normalised = getNormalisedSphericalCoordinate({
      θ: -270,
      φ: -120
    })

    expect(normalised.θ).toBe(90)
    expect(normalised.φ).toBe(-60)
  })
})

/*****************************************************************************************************************/

describe('getGreenwhichSiderealTime', () => {
  it('should be defined', () => {
    expect(getGreenwhichSiderealTime).toBeDefined()
  })

  it('should return the Greenwhich Sidereal Time (GST) of the given date', () => {
    const GST = getGreenwhichSiderealTime(datetime)
    expect(GST).toBe(15.463990399019053)
  })

  it('should return a target that is directly overhead at for ', () => {
    const GST = getGreenwhichSiderealTime(datetime)

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

describe('getLocalSiderealTime', () => {
  it('should be defined', () => {
    expect(getLocalSiderealTime).toBeDefined()
  })

  it('should return the Local Sidereal Time (LST) of the given date at longitude 0 at Greenwhich', () => {
    const LST = getLocalSiderealTime(datetime, 0)
    const GST = getGreenwhichSiderealTime(datetime)
    expect(LST).toBe(GST)
  })

  it('should return the Local Sidereal Time (LST) of the given date at longitude 0 at Greenwhich', () => {
    const datetime = new Date('2021-05-14T01:06:33.99870+00:00')
    const LST = getLocalSiderealTime(datetime, 0)
    const GST = getGreenwhichSiderealTime(datetime)
    expect(LST).toBe(GST)
  })

  it('should return the Local Sidereal Time (LST) of the given date', () => {
    const LST = getLocalSiderealTime(datetime, longitude)
    expect(LST).toBe(5.099450799019053)
  })
})

/*****************************************************************************************************************/

describe('getHourAngle', () => {
  it('should be defined', () => {
    expect(getHourAngle).toBeDefined()
  })

  it('should return the Hour Angle (HA) of the given date at longitude 0 at Greenwhich', () => {
    const HA = getHourAngle(datetime, 0, betelgeuse.ra)
    expect(HA).toBe(143.1668976852858)
  })

  it('should return the Hour Angle (HA) of the given date', () => {
    const HA = getHourAngle(datetime, longitude, betelgeuse.ra)
    expect(HA).toBe(347.6988036852858)
  })
})

/*****************************************************************************************************************/

describe('getObliquityOfTheEcliptic', () => {
  it('should be defined', () => {
    expect(getObliquityOfTheEcliptic).toBeDefined()
  })

  it('should return the Obliquity of the Ecliptic (e) of the given date', () => {
    const ε = getObliquityOfTheEcliptic(datetime)
    expect(ε).toBe(23.436511890585354)
  })
})

/*****************************************************************************************************************/

describe('getParallacticAngle', () => {
  it('should be defined', () => {
    expect(getParallacticAngle).toBeDefined()
  })

  it('should return the Parallactic Angle (PA) of the given date at longitude 0 at Greenwhich', () => {
    const q = getParallacticAngle(datetime, { latitude, longitude }, betelgeuse)
    expect(q).toBe(-42.62812646220704)
  })
})

/*****************************************************************************************************************/
