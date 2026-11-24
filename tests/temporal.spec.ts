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
const datetime = new Date('2021-05-14T00:00:00.000+00:00')

// For testing we will fix the latitude to be Manua Kea, Hawaii, US
const latitude = 19.820611

// For testing we will fix the longitude to be Manua Kea, Hawaii, US:
const longitude = -155.468094

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

  it('should return the Unix epoch for the Julian Date of J1970', () => {
    expect(convertJulianDateToUTC(2440587.5).getTime()).toBe(0)
  })

  it('should return the J2000.0 epoch for the Julian Date of J2000', () => {
    expect(convertJulianDateToUTC(2451545.0).toISOString()).toBe('2000-01-01T12:00:00.000Z')
  })

  it('should round to the nearest millisecond rather than truncate towards the Unix epoch', () => {
    // The Julian Date of this instant resolves to 1620950415839.9866 ms, just under the millisecond:
    const instant = new Date('2021-05-14T00:00:15.840Z')
    const UTC = convertJulianDateToUTC(getJulianDate(instant))

    expect(UTC.toISOString()).toBe('2021-05-14T00:00:15.840Z')
    expect(UTC.getTime()).toBe(1620950415840)
  })

  it('should round to the nearest millisecond for a Julian Date before the Unix epoch', () => {
    // The Julian Date of this instant resolves to -2208988792079.987 ms, just above the millisecond:
    const instant = new Date('1900-01-01T00:00:07.920Z')
    const UTC = convertJulianDateToUTC(getJulianDate(instant))

    expect(UTC.toISOString()).toBe('1900-01-01T00:00:07.920Z')
    expect(UTC.getTime()).toBe(-2208988792080)
  })

  it('should round trip every millisecond of a second through the Julian Date', () => {
    for (let ms = 0; ms < 1000; ms++) {
      const t = datetime.getTime() + 15000 + ms
      expect(convertJulianDateToUTC(getJulianDate(new Date(t))).getTime()).toBe(t)
    }
  })

  it('should round trip to the millisecond for instants across eight centuries', () => {
    for (let year = 1600; year <= 2400; year += 10) {
      for (let i = 0; i < 50; i++) {
        // Step through the year by a prime number of milliseconds, to sample every millisecond phase:
        const t = Date.UTC(year, 0, 1) + i * 604800000 + i * 7919
        expect(convertJulianDateToUTC(getJulianDate(new Date(t))).getTime()).toBe(t)
      }
    }
  })

  it('should round a Julian Date under half a millisecond past an instant down to that instant', () => {
    const JD = getJulianDate(datetime) + 0.3 / 86400000
    expect(convertJulianDateToUTC(JD).getTime()).toBe(datetime.getTime())
  })

  it('should round a Julian Date over half a millisecond past an instant up to the next millisecond', () => {
    const JD = getJulianDate(datetime) + 0.7 / 86400000
    expect(convertJulianDateToUTC(JD).getTime()).toBe(datetime.getTime() + 1)
  })

  it('should return the same instant irrespective of the host timezone', () => {
    const JD = getJulianDate(new Date('2021-05-14T00:00:15.840Z'))

    const TZ = process.env.TZ

    try {
      process.env.TZ = 'Pacific/Auckland'
      expect(convertJulianDateToUTC(JD).getTime()).toBe(1620950415840)

      process.env.TZ = 'America/New_York'
      expect(convertJulianDateToUTC(JD).getTime()).toBe(1620950415840)
    } finally {
      process.env.TZ = TZ
    }
  })

  it('should return an invalid Date for a non-finite Julian Date', () => {
    expect(convertJulianDateToUTC(Number.NaN).getTime()).toBeNaN()
    expect(convertJulianDateToUTC(Number.POSITIVE_INFINITY).getTime()).toBeNaN()
    expect(convertJulianDateToUTC(Number.NEGATIVE_INFINITY).getTime()).toBeNaN()
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

  it.each([
    {
      name: 'the March equinox of 1990',
      datetime: '1990-03-21T06:15:00.000Z',
      GST: 18.150429177682845
    },
    {
      name: 'J2000.0',
      datetime: '2000-01-01T12:00:00.000Z',
      GST: 18.697374558333337
    },
    {
      name: 'the 10th of October 2010',
      datetime: '2010-10-10T10:10:10.000Z',
      GST: 11.42996649688136
    },
    {
      name: 'the 14th of May 2021',
      datetime: '2021-05-14T12:34:56.000Z',
      GST: 4.080661799429016
    },
    {
      name: 'the 15th of November 2026',
      datetime: '2026-11-15T05:00:00.000Z',
      GST: 8.620137733614225
    },
    {
      name: 'the 28th of February 2030',
      datetime: '2030-02-28T18:45:00.000Z',
      GST: 5.325283599727118
    },
    {
      name: 'the 31st of December 2040',
      datetime: '2040-12-31T03:21:09.000Z',
      GST: 10.030823510045012
    },
    {
      name: 'the 15th of June 2050',
      datetime: '2050-06-15T21:00:00.000Z',
      GST: 14.622666720779515
    }
  ])('should invert the Greenwich mean sidereal time of ERFA gmst82 for ', ({ datetime, GST }) => {
    // The Greenwich mean sidereal time of ERFA gmst82 (in hours), with UT1 taken to be UTC:
    const UTC = convertGreenwichSiderealTimeToUniversalTime(GST, new Date(datetime))

    expect(Math.abs(UTC.getTime() - new Date(datetime).getTime())).toBeLessThan(10)
  })
})

/*****************************************************************************************************************/
