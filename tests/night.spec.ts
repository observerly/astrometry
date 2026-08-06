/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/moon
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { getGeneralizedSolarTransit, getNight, getSolarTransit, isNight } from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T03:00:00.000+00:00')

// For testing, we will fix the latitude to be the Isles of Scilly, Cornwall, UK.
export const latitude: number = 49.914425

// For testing, we will fix the longitude to be the Isles of Scilly, Cornwall, UK.
export const longitude: number = -6.315165

// For testing the poles, we will fix the observer to be at Alert, Nunavut, Canada, which is within
// the Arctic Circle, and therefore experiences both perpetual daylight and perpetual night:
const alert = { latitude: 82.501944, longitude: -62.348056 }

/*****************************************************************************************************************/

describe('getGeneralizedSolarTransit', () => {
  it('should be defined', () => {
    expect(getGeneralizedSolarTransit).toBeDefined()
  })

  it('should return the sunrise, noon and sunset for an observer for whom the Sun crosses the horizon', () => {
    const { sunrise, noon, sunset, ha } = getGeneralizedSolarTransit(datetime, {
      latitude,
      longitude
    })

    expect(sunrise).toBeInstanceOf(Date)
    expect(noon).toBeInstanceOf(Date)
    expect(sunset).toBeInstanceOf(Date)

    expect(Number.isNaN(sunrise?.getTime())).toBe(false)
    expect(Number.isNaN(noon?.getTime())).toBe(false)
    expect(Number.isNaN(sunset?.getTime())).toBe(false)

    expect(Number.isFinite(ha)).toBe(true)
  })

  it('should return no sunrise or sunset for an observer in perpetual daylight', () => {
    const { sunrise, noon, sunset } = getGeneralizedSolarTransit(
      new Date('2021-06-21T00:00:00.000+00:00'),
      alert
    )

    expect(sunrise).toBeNull()
    expect(sunset).toBeNull()

    // The Sun still culminates at local noon, even when it does not cross the horizon:
    expect(noon).toBeInstanceOf(Date)
    expect(Number.isNaN(noon?.getTime())).toBe(false)
  })

  it('should return no sunrise or sunset for an observer in perpetual night', () => {
    const { sunrise, noon, sunset } = getGeneralizedSolarTransit(
      new Date('2021-12-21T00:00:00.000+00:00'),
      alert
    )

    expect(sunrise).toBeNull()
    expect(sunset).toBeNull()

    expect(noon).toBeInstanceOf(Date)
    expect(Number.isNaN(noon?.getTime())).toBe(false)
  })

  it('should return no sunrise or sunset for an observer at the north pole', () => {
    const { sunrise, sunset } = getGeneralizedSolarTransit(
      new Date('2021-06-21T00:00:00.000+00:00'),
      { latitude: 90, longitude: 0 }
    )

    expect(sunrise).toBeNull()
    expect(sunset).toBeNull()
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

    expect(sunrise?.toISOString()).toBe('2021-05-14T04:42:58.540Z')
    expect(noon?.toISOString()).toBe('2021-05-14T12:21:40.985Z')
    expect(sunset?.toISOString()).toBe('2021-05-14T20:01:23.430Z')
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

    expect(sunrise?.toISOString()).toBe('2021-05-14T04:01:58.540Z')
    expect(noon?.toISOString()).toBe('2021-05-14T12:21:40.985Z')
    expect(sunset?.toISOString()).toBe('2021-05-14T20:43:23.430Z')
  })

  it('should not modify the datetime given by the caller', () => {
    const when = new Date('2021-05-14T12:34:56.000+00:00')

    getSolarTransit(when, {
      latitude,
      longitude
    })

    expect(when.toISOString()).toBe('2021-05-14T12:34:56.000Z')
  })

  it('should return the same solar transit irrespective of the host timezone', () => {
    const TZ = process.env.TZ

    try {
      // The day boundary is derived in UTC, and is therefore independent of the timezone
      // of the host system the library is running on:
      for (const timezone of ['Pacific/Auckland', 'America/New_York']) {
        process.env.TZ = timezone

        const { sunrise, noon, sunset } = getSolarTransit(
          datetime,
          {
            latitude,
            longitude
          },
          -6
        )

        expect(sunrise?.toISOString()).toBe('2021-05-14T04:01:58.540Z')
        expect(noon?.toISOString()).toBe('2021-05-14T12:21:40.985Z')
        expect(sunset?.toISOString()).toBe('2021-05-14T20:43:23.430Z')
      }
    } finally {
      process.env.TZ = TZ
    }
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

    expect(start?.toISOString()).toBe('2021-05-14T20:01:23.430Z')
    expect(end?.toISOString()).toBe('2021-05-15T04:41:35.447Z')
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

    expect(start?.toISOString()).toBe('2021-05-14T22:49:28.606Z')
    expect(end?.toISOString()).toBe('2021-05-15T10:34:02.830Z')
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

  it('should return the same answer for an ambiguous local time irrespective of the host timezone', () => {
    const TZ = process.env.TZ

    try {
      // At the end of daylight saving in America/New_York, the local time 01:30 occurs twice, at
      // 05:30Z as EDT and again at 06:30Z as EST, and so it does not identify an instant. The Sun
      // has risen for the observer by 06:30Z, and so it is not night, whichever timezone the
      // library is running in:
      for (const timezone of ['UTC', 'America/New_York', 'Pacific/Auckland']) {
        process.env.TZ = timezone

        expect(
          isNight(
            new Date('2021-11-07T06:30:00.000+00:00'),
            {
              latitude,
              longitude
            },
            -12
          )
        ).toBe(false)
      }
    } finally {
      process.env.TZ = TZ
    }
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

describe('getSolarTransit for an elevated observer', () => {
  it('should return an earlier sunrise and a later sunset than at sea level', () => {
    // The local horizon of an elevated observer is depressed below the astronomical horizon, and
    // so the Sun crosses it earlier at sunrise, and later at sunset:
    const sea = getSolarTransit(datetime, { latitude, longitude }, 0)

    const elevated = getSolarTransit(datetime, { latitude, longitude, elevation: 4000 }, 0)

    expect(elevated.sunrise?.getTime()).toBeLessThan(sea.sunrise?.getTime() as number)
    expect(elevated.sunset?.getTime()).toBeGreaterThan(sea.sunset?.getTime() as number)
  })
})

/*****************************************************************************************************************/

describe('perpetual daylight and perpetual night', () => {
  it('should return a null solar transit for an observer in perpetual daylight', () => {
    const { sunrise, noon, sunset } = getSolarTransit(
      new Date('2021-06-21T00:00:00.000+00:00'),
      alert,
      0
    )

    expect(sunrise).toBeNull()
    expect(noon).toBeNull()
    expect(sunset).toBeNull()
  })

  it('should return a null night for an observer in perpetual daylight', () => {
    const { start, end } = getNight(new Date('2021-06-21T00:00:00.000+00:00'), alert)

    expect(start).toBeNull()
    expect(end).toBeNull()
  })

  it('should return a null night for an observer in perpetual night', () => {
    const { start, end } = getNight(new Date('2021-12-21T00:00:00.000+00:00'), alert)

    expect(start).toBeNull()
    expect(end).toBeNull()
  })
})

/*****************************************************************************************************************/
