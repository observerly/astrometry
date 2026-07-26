/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/temporal
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  convertGreenwichSiderealTimeToUniversalTime,
  convertJulianDateToUTC,
  convertLocalSiderealTimeToGreenwichSiderealTime,
  getGreenwichSiderealTime,
  getJulianDate,
  getLocalSiderealTime
} from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

// For testing we will fix the latitude to be Manua Kea, Hawaii, US
export const latitude = 19.820611

// For testing we will fix the longitude to be Manua Kea, Hawaii, US:
export const longitude = -155.468094

/*****************************************************************************************************************/

describe('convertJulianDateToUTC', () => {
  it('should be defined', () => {
    expect(convertJulianDateToUTC).toBeDefined()
  })

  it('should return the correct UTC for a given Julian Date', () => {
    const JD = getJulianDate(datetime)
    const UTC = convertJulianDateToUTC(JD)

    expect(UTC).toBeInstanceOf(Date)
    // Check that the UTC is the same as the datetime:
    expect(UTC.getTime()).toBe(datetime.getTime())
  })
})

/*****************************************************************************************************************/

describe('convertLocalSiderealTimeToGreenwichSiderealTime', () => {
  it('should be defined', () => {
    expect(convertLocalSiderealTimeToGreenwichSiderealTime).toBeDefined()
  })

  it('should return the correct Local Sidereal Time for a given Greenwich Sidereal Time', () => {
    const LST = getLocalSiderealTime(datetime, longitude)
    const GST = getGreenwichSiderealTime(datetime)
    expect(
      convertLocalSiderealTimeToGreenwichSiderealTime(LST, { latitude, longitude })
    ).toBeCloseTo(GST)
  })
})

/*****************************************************************************************************************/

describe('convertGreenwichSiderealTimeToUniversalTime', () => {
  it('should be defined', () => {
    expect(convertGreenwichSiderealTimeToUniversalTime).toBeDefined()
  })

  it('should return the correct Universal Coordinated Time for a given Greenwich Sidereal Time', () => {
    const GST = getGreenwichSiderealTime(datetime)
    const UTC = convertGreenwichSiderealTimeToUniversalTime(GST, datetime)
    expect(UTC).toBeInstanceOf(Date)
    // Check that the UTC is the same as the datetime:
    expect(UTC.getTime()).toBeCloseTo(datetime.getTime() + datetime.getTimezoneOffset() * 60000, -5)
  })
})

/*****************************************************************************************************************/
