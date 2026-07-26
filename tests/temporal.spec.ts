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
    expect(UTC.getTime()).toBeCloseTo(datetime.getTime(), -5)
  })

  it('should return the correct Universal Coordinated Time for a given Greenwich Sidereal Time at midday', () => {
    const midday = new Date('2021-05-14T12:34:56.000+00:00')
    const GST = getGreenwichSiderealTime(midday)
    const UTC = convertGreenwichSiderealTimeToUniversalTime(GST, midday)
    expect(UTC.getUTCHours()).toBe(12)
    expect(UTC.getUTCMinutes()).toBe(34)
    expect(UTC.getUTCSeconds()).toBe(56)
  })

  it('should return the same Universal Coordinated Time irrespective of the host timezone', () => {
    const midday = new Date('2021-05-14T12:34:56.000+00:00')
    const GST = getGreenwichSiderealTime(midday)

    const TZ = process.env.TZ

    try {
      // The conversion is performed in UTC, and is therefore independent of the
      // timezone of the host system the library is running on:
      process.env.TZ = 'Pacific/Auckland'
      expect(convertGreenwichSiderealTimeToUniversalTime(GST, midday).getUTCHours()).toBe(12)

      process.env.TZ = 'America/New_York'
      expect(convertGreenwichSiderealTimeToUniversalTime(GST, midday).getUTCHours()).toBe(12)
    } finally {
      process.env.TZ = TZ
    }
  })
})

/*****************************************************************************************************************/
