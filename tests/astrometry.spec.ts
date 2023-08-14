/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  type EquatorialCoordinate,
  getHourAngle,
  getGreenwhichSiderealTime,
  getLocalSiderealTime,
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

/*****************************************************************************************************************/

describe('getGreenwhichSiderealTime', () => {
  it('should be defined', () => {
    expect(getGreenwhichSiderealTime).toBeDefined()
  })

  it('should return the Greenwhich Sidereal Time (GST) of the given date', () => {
    const GST = getGreenwhichSiderealTime(datetime)
    expect(GST).toBe(15.463990399019053)
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
