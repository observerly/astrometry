/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/aberration
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  EARTH_RADIUS,
  type EquatorialCoordinate,
  SPEED_OF_LIGHT,
  getCorrectionToEquatorialForAberration,
  getCorrectionToEquatorialForAnnualAberration,
  getCorrectionToEquatorialForDiurnalAberration,
  getHourAngle
} from '../src'

import { convertDegreesToRadians as radians } from '../src/utilities'

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

describe('getCorrectionToEquatorialForAnnualAberration', () => {
  it('should be defined', () => {
    expect(getCorrectionToEquatorialForAnnualAberration).toBeDefined()
  })

  it('should return the correct aberration correction for the J2000 default epoch', () => {
    const { ra, dec } = getCorrectionToEquatorialForAnnualAberration(
      new Date('2000-01-01T00:00:00+00:00'),
      betelgeuse
    )
    expect(ra + betelgeuse.ra).toBe(88.79868732900594)
    expect(dec + betelgeuse.dec).toBe(7.406803914569333)
  })

  it('should return the correct aberration correction for the designated epoch', () => {
    const { ra, dec } = getCorrectionToEquatorialForAnnualAberration(datetime, betelgeuse)
    expect(ra + betelgeuse.ra).toBe(88.78837512114313)
    expect(dec + betelgeuse.dec).toBe(7.406109156361687)
  })
})

/*****************************************************************************************************************/

describe('getCorrectionToEquatorialForDiurnalAberration', () => {
  it('should be defined', () => {
    expect(getCorrectionToEquatorialForDiurnalAberration).toBeDefined()
  })

  it('should return the correct aberration correction for the J2000 default epoch', () => {
    const { ra, dec } = getCorrectionToEquatorialForDiurnalAberration(
      new Date('2000-01-01T00:00:00+00:00'),
      {
        latitude,
        longitude
      },
      betelgeuse
    )
    expect(ra + betelgeuse.ra).toBe(88.7928898251804)
    expect(dec + betelgeuse.dec).toBe(7.407057608077356)
  })

  it('should return the correct aberration correction for the designated epoch', () => {
    const { ra, dec } = getCorrectionToEquatorialForDiurnalAberration(datetime, {
      latitude,
      longitude
    }, betelgeuse)
    expect(ra + betelgeuse.ra).toBe(88.793040690999)
    expect(dec + betelgeuse.dec).toBe(7.407061603196344)
  })

  it('should never exceed the constant of diurnal aberration for the observer', () => {
    // The constant of diurnal aberration is ~0.32 arcseconds at the equator, and it is scaled by
    // the cosine of the observer's latitude, and, in right ascension, by the secant of the
    // declination of the target:
    const k = ((7.292115e-5 * EARTH_RADIUS) / SPEED_OF_LIGHT) * (180 / Math.PI) * 3600

    const bound =
      (k * Math.cos(radians(latitude))) / Math.cos(radians(betelgeuse.dec))

    // Sample the correction over a whole rotation of the Earth, e.g., every minute for 24 hours:
    for (let minute = 0; minute < 1440; minute++) {
      const { ra, dec } = getCorrectionToEquatorialForDiurnalAberration(
        new Date(datetime.getTime() + minute * 60000),
        { latitude, longitude },
        betelgeuse
      )

      expect(Math.abs(ra) * 3600).toBeLessThanOrEqual(bound)
      expect(Math.abs(dec) * 3600).toBeLessThanOrEqual(bound)
    }
  })

  it('should vanish for an observer at the poles', () => {
    // The observer is not carried by the rotation of the Earth at the poles, and so there is no
    // diurnal aberration for such an observer:
    for (const latitude of [90, -90]) {
      const { ra, dec } = getCorrectionToEquatorialForDiurnalAberration(
        datetime,
        { latitude, longitude },
        betelgeuse
      )

      expect(ra).toBeCloseTo(0, 12)
      expect(dec).toBeCloseTo(0, 12)
    }
  })

  it('should be at a maximum in right ascension for a target on the observer meridian', () => {
    // The target is displaced towards the east point of the observer's horizon, which is at right
    // angles to the meridian, and so the displacement is wholly in right ascension there:
    const meridian = getHourAngle(datetime, longitude, betelgeuse.ra)

    // The datetime at which the target culminates, e.g., ~4 minutes of time per degree of the
    // hour angle still to be traversed:
    const culmination = new Date(
      datetime.getTime() + ((360 - meridian) % 360) * 3.9934469 * 60000
    )

    const { ra, dec } = getCorrectionToEquatorialForDiurnalAberration(
      culmination,
      { latitude, longitude },
      betelgeuse
    )

    const k = ((7.292115e-5 * EARTH_RADIUS) / SPEED_OF_LIGHT) * (180 / Math.PI) * 3600

    // The correction in right ascension is at its bound, and the correction in declination, which
    // scales with the sine of the hour angle, vanishes:
    expect(Math.abs(ra) * 3600).toBeCloseTo(
      (k * Math.cos(radians(latitude))) / Math.cos(radians(betelgeuse.dec)),
      3
    )

    expect(Math.abs(dec) * 3600).toBeCloseTo(0, 3)
  })
})

/*****************************************************************************************************************/

describe('getCorrectionToEquatorialForAberration', () => {
  it('should be defined', () => {
    expect(getCorrectionToEquatorialForAberration).toBeDefined()
  })

  it('should return the correct aberration correction for the J2000 default epoch', () => {
    const { ra, dec } = getCorrectionToEquatorialForAberration(
      new Date('2000-01-01T00:00:00+00:00'),
      {
        latitude,
        longitude
      },
      betelgeuse
    )
    expect(ra + betelgeuse.ra).toBe(88.79861885418633)
    expect(dec + betelgeuse.dec).toBe(7.406797622646689)
  })

  it('should return the correct aberration correction for the designated epoch', () => {
    const { ra, dec } = getCorrectionToEquatorialForAberration(datetime, {
      latitude,
      longitude
    }, betelgeuse)
    expect(ra + betelgeuse.ra).toBe(88.78845751214214)
    expect(dec + betelgeuse.dec).toBe(7.406106859558032)
  })
})

/*****************************************************************************************************************/