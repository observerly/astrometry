/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/moon
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  convertLocalSiderealTimeToGreenwhichSiderealTime,
  convertGreenwhichSiderealTimeToUniversalTime,
  getInterpolatedSolarTransit,
  getSolarTransit,
  getNight,
  isNight
} from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T03:00:00.000+00:00')

// For testing, we will fix the latitude to be the Isles of Scilly, Cornwall, UK.
export const latitude: number = 49.914425

// For testing, we will fix the longitude to be the Isles of Scilly, Cornwall, UK.
export const longitude: number = -6.315165

/*****************************************************************************************************************/

describe('getInterpolatedSolarTransit', () => {
  it('should be defined', () => {
    expect(getInterpolatedSolarTransit).toBeDefined()
  })

  it('should return the correct solar transit for the observer at a horizon of 0 degrees', () => {
    const datetime = new Date('2015-02-05T04:00:00.000+00:00')

    const observer = {
      latitude: 38,
      longitude: -78
    }

    const { Tr, Ts } = getInterpolatedSolarTransit(datetime, observer)

    expect(Tr).toBeCloseTo(16.120631, 1)
    expect(Ts).toBeCloseTo(2.360268, 1)

    const GSTr = convertLocalSiderealTimeToGreenwhichSiderealTime(Tr, observer)

    const GSTs = convertLocalSiderealTimeToGreenwhichSiderealTime(Ts, observer)

    const LCTr = convertGreenwhichSiderealTimeToUniversalTime(GSTr, datetime)

    const LCTs = convertGreenwhichSiderealTimeToUniversalTime(GSTs, datetime)

    expect(LCTr).toBeInstanceOf(Date)
    expect(LCTr?.toISOString()).toBe('2015-02-05T12:17:10.747Z')

    expect(LCTr.toLocaleString('en-US', { timeZone: 'America/New_York' })).toBe(
      '2/5/2015, 7:17:10 AM'
    )

    expect(LCTs).toBeInstanceOf(Date)
    expect(LCTs?.toISOString()).toBe('2015-02-05T22:29:22.439Z')

    expect(LCTs.toLocaleString('en-US', { timeZone: 'America/New_York' })).toBe(
      '2/5/2015, 5:29:22 PM'
    )
  })
})

/*****************************************************************************************************************/

describe('getSolarTransit', () => {
  it('should return the correct solar transit for the observer at a horizon of 0 degrees', () => {
    const { sunrise, noon, sunset } = getSolarTransit(
      datetime,
      {
        latitude,
        longitude
      },
      0
    )

    expect(sunrise).toBeInstanceOf(Date)
    expect(noon).toBeInstanceOf(Date)
    expect(sunset).toBeInstanceOf(Date)

    expect(sunrise?.toISOString()).toBe('2021-05-14T04:46:00.000Z')
    expect(noon?.toISOString()).toBe('2021-05-14T12:20:00.000Z')
    expect(sunset?.toISOString()).toBe('2021-05-14T19:56:00.000Z')
  })

  it('should return the correct solar transit for the observer at a horizon of -6 degrees', () => {
    const { sunrise, noon, sunset } = getSolarTransit(
      datetime,
      {
        latitude,
        longitude
      },
      -6
    )

    expect(sunrise).toBeInstanceOf(Date)
    expect(noon).toBeInstanceOf(Date)
    expect(sunset).toBeInstanceOf(Date)

    expect(sunrise?.toISOString()).toBe('2021-05-14T04:01:00.000Z')
    expect(noon?.toISOString()).toBe('2021-05-14T12:20:00.000Z')
    expect(sunset?.toISOString()).toBe('2021-05-14T20:41:00.000Z')
  })
})

/*****************************************************************************************************************/

describe('getNight', () => {
  it('should be defined', () => {
    expect(getNight).toBeDefined()
  })

  it('should return the correct night for the observer at a horizon of 0 degrees', () => {
    const { start, end } = getNight(
      datetime,
      {
        latitude,
        longitude
      },
      0
    )

    expect(start).toBeInstanceOf(Date)
    expect(end).toBeInstanceOf(Date)

    expect(start?.toISOString()).toBe('2021-05-14T19:56:00.000Z')
    expect(end?.toISOString()).toBe('2021-05-15T04:45:00.000Z')
  })
})

/*****************************************************************************************************************/

describe('isNight', () => {
  it('should be defined', () => {
    expect(isNight).toBeDefined()
  })

  it('should return true for the observer at a horizon of 0 degrees', () => {
    expect(
      isNight(
        datetime,
        {
          latitude,
          longitude
        },
        0
      )
    ).toBe(true)
  })

  it('should return true for the observer at a horizon of 0 degrees at midnight on the current day', () => {
    expect(
      isNight(
        datetime,
        {
          latitude,
          longitude
        },
        0
      )
    ).toBe(true)
  })

  it('should return false for the observer at a horizon of 0 degrees after sunrise at ~7am on the current day', () => {
    expect(
      isNight(
        new Date('2021-05-14T06:55:00.000+00:00'),
        {
          latitude,
          longitude
        },
        0
      )
    ).toBe(false)
  })

  it('should return false for the observer at a horizon of 0 degrees after sunrise at "noon" on the current day', () => {
    expect(
      isNight(
        new Date('2021-05-14T12:00:00.000+00:00'),
        {
          latitude,
          longitude
        },
        0
      )
    ).toBe(false)
  })

  it('should return true for the observer at a horizon of 0 degrees after sunset at 9pm on the current day', () => {
    expect(
      isNight(
        new Date('2021-05-14T21:00:00.000+00:00'),
        {
          latitude,
          longitude
        },
        0
      )
    ).toBe(true)
  })
})

/*****************************************************************************************************************/
