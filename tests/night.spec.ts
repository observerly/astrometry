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
  getGeneralizedSolarTransit,
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

describe('getGeneralizedSolarTransit', () => {
  it('should be defined', () => {
    expect(getGeneralizedSolarTransit).toBeDefined()
  })

  it('should return the correct solar transit for the observer at a horizon of 0 degrees', () => {
    const { sunrise, noon, sunset } = getGeneralizedSolarTransit(
      new Date('2021-01-01T12:00:00.000+00:00'),
      {
        latitude: 56.130366,
        longitude
      }
    )

    expect(sunrise).toBeInstanceOf(Date)
    expect(sunrise).toStrictEqual(new Date('2021-01-01T08:29:40.902Z'))
    expect(noon).toBeInstanceOf(Date)
    expect(noon).toStrictEqual(new Date('2021-01-01T12:28:42.861Z'))
    expect(sunset).toBeInstanceOf(Date)
    expect(sunset).toStrictEqual(new Date('2021-01-01T16:27:44.821Z'))
  })

  it('should return the correct solar transit for the observer at a horizon of 0 degrees', () => {
    const { sunrise, noon, sunset } = getGeneralizedSolarTransit(datetime, {
      latitude,
      longitude
    })

    expect(sunrise).toBeInstanceOf(Date)
    expect(sunrise).toStrictEqual(new Date('2021-05-14T04:52:57.636Z'))
    expect(noon).toBeInstanceOf(Date)
    expect(noon).toStrictEqual(new Date('2021-05-14T12:21:40.985Z'))
    expect(sunset).toBeInstanceOf(Date)
    expect(sunset).toStrictEqual(new Date('2021-05-14T19:50:24.334Z'))
  })

  it('should return the correct solar transit for the observer at a horizon of 0 degrees', () => {
    const { sunrise, noon, sunset } = getGeneralizedSolarTransit(datetime, {
      latitude: -34.209327109,
      longitude: -71.240122387
    })

    expect(sunrise).toBeInstanceOf(Date)
    expect(sunrise).toStrictEqual(new Date('2021-05-14T11:24:59.334Z'))
    expect(noon).toBeInstanceOf(Date)
    expect(noon).toStrictEqual(new Date('2021-05-14T16:41:23.153Z'))
    expect(sunset).toBeInstanceOf(Date)
    expect(sunset).toStrictEqual(new Date('2021-05-14T21:57:46.972Z'))
  })
})

/*****************************************************************************************************************/

describe('getSolarTransit', () => {
  it('should be defined', () => {
    expect(getSolarTransit).toBeDefined()
  })

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

    expect(sunrise?.toISOString()).toBe('2021-05-14T04:45:57.636Z')
    expect(noon?.toISOString()).toBe('2021-05-14T12:21:40.985Z')
    expect(sunset?.toISOString()).toBe('2021-05-14T19:55:24.334Z')
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

    expect(sunrise?.toISOString()).toBe('2021-05-14T04:00:57.636Z')
    expect(noon?.toISOString()).toBe('2021-05-14T12:21:40.985Z')
    expect(sunset?.toISOString()).toBe('2021-05-14T20:41:24.334Z')
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

    expect(start?.toISOString()).toBe('2021-05-14T19:55:24.334Z')
    expect(end?.toISOString()).toBe('2021-05-15T04:45:03.311Z')
  })

  it('should return the correct night for the observer at a horizon of -18 degrees', () => {
    const { start, end } = getNight(
      datetime,
      {
        latitude: -34.209327109,
        longitude: -71.240122387
      },
      -12
    )

    expect(start).toBeInstanceOf(Date)
    expect(end).toBeInstanceOf(Date)

    expect(start?.toISOString()).toBe('2021-05-14T22:47:46.972Z')
    expect(end?.toISOString()).toBe('2021-05-15T10:32:31.677Z')
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
