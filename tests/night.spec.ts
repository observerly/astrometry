/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/moon
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  convertEquatorialToHorizontal,
  DEFAULT_SURFACE_PRESSURE,
  DEFAULT_SURFACE_TEMPERATURE,
  getCorrectionToHorizontalForRefraction,
  getGeneralizedSolarTransit,
  getNight,
  getSolarEquatorialCoordinate,
  getSolarTransit,
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

    expect(sunrise?.toISOString()).toBe('2021-05-14T04:42:45.001Z')
    expect(noon?.toISOString()).toBe('2021-05-14T12:21:40.985Z')
    expect(sunset?.toISOString()).toBe('2021-05-14T20:01:19.574Z')
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

    expect(sunrise?.toISOString()).toBe('2021-05-14T04:01:48.483Z')
    expect(noon?.toISOString()).toBe('2021-05-14T12:21:40.985Z')
    expect(sunset?.toISOString()).toBe('2021-05-14T20:42:29.706Z')
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

        expect(sunrise?.toISOString()).toBe('2021-05-14T04:01:48.483Z')
        expect(noon?.toISOString()).toBe('2021-05-14T12:21:40.985Z')
        expect(sunset?.toISOString()).toBe('2021-05-14T20:42:29.706Z')
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

    expect(start?.toISOString()).toBe('2021-05-14T20:01:19.574Z')
    expect(end?.toISOString()).toBe('2021-05-15T04:41:21.830Z')
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

    expect(start?.toISOString()).toBe('2021-05-14T22:48:58.346Z')
    expect(end?.toISOString()).toBe('2021-05-15T10:33:55.873Z')
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

describe('getSolarTransit at the horizon given by the caller', () => {
  // The apparent altitude of the Sun at a given time, for cross-checking the returned events,
  // sampled at the same default temperature and pressure the function under test resolves at:
  const altitude = (when: Date, observer: { latitude: number; longitude: number }): number =>
    getCorrectionToHorizontalForRefraction(
      convertEquatorialToHorizontal(when, observer, getSolarEquatorialCoordinate(when)),
      DEFAULT_SURFACE_TEMPERATURE,
      DEFAULT_SURFACE_PRESSURE
    ).alt

  it('should resolve the events at the horizon given, and not at the astronomical horizon', () => {
    // The Sun is at the horizon given by the caller at every event returned, e.g., the -18 events
    // are the astronomical dusk and dawn, and not the sunset and sunrise:
    for (const horizon of [-6, -12, -18]) {
      const { sunrise, sunset } = getSolarTransit(datetime, { latitude, longitude }, horizon)

      expect(sunrise).toBeInstanceOf(Date)
      expect(sunset).toBeInstanceOf(Date)

      if (!sunrise || !sunset) return

      expect(altitude(sunrise, { latitude, longitude })).toBeCloseTo(horizon, 3)
      expect(altitude(sunset, { latitude, longitude })).toBeCloseTo(horizon, 3)
    }
  })

  it('should return the start of the night at astronomical dusk, hours after sunset', () => {
    // For London in December the Sun reaches -18° over two hours after it sets, and so the night
    // starts at ~17:55, and not at the ~15:51 of sunset:
    const london = { latitude: 51.4778, longitude: -0.0015 }

    const { start, end } = getNight(new Date('2021-12-15T00:00:00.000+00:00'), london, -18)

    expect(start?.toISOString()).toBe('2021-12-15T17:55:08.636Z')
    expect(end?.toISOString()).toBe('2021-12-16T05:55:50.941Z')
  })

  it('should return no night where the Sun never reaches the horizon given', () => {
    // At a latitude of 60° at midsummer the Sun only reaches ~-6.5° below the horizon, and so
    // there is no astronomical night to return:
    const { start, end } = getNight(
      new Date('2021-06-21T00:00:00.000+00:00'),
      { latitude: 60, longitude: 0 },
      -18
    )

    expect(start).toBeNull()
    expect(end).toBeNull()
  })

  it('should resolve a day the Sun rises by refraction alone', () => {
    // At Alert at the end of February the Sun stays geometrically below the horizon all day, at a
    // maximum of ~-0.2°, but the refraction lifts its apparent altitude to ~+0.3°, and so it does
    // rise and set. Whether the horizon is reachable is therefore decided from the apparent
    // altitude, and not from the geometric hour angle:
    const { sunrise, noon, sunset } = getSolarTransit(
      new Date('2021-02-28T00:00:00.000+00:00'),
      alert,
      0
    )

    expect(sunrise?.toISOString()).toBe('2021-02-28T15:11:19.474Z')
    expect(noon).toBeInstanceOf(Date)
    expect(sunset?.toISOString()).toBe('2021-02-28T17:36:04.929Z')
  })

  it('should resolve a grazing rise the estimated noon samples on the wrong side of', () => {
    // The generalized transit is a lower accuracy estimate, and so the altitude sampled at it
    // falls short of the true maximum. A horizon between the two is reachable, but only where the
    // culmination is refined before deciding, e.g., a grazing rise shorter than twice the error
    // of the estimate would otherwise be rejected. The horizon is resolved at the time of the
    // test, between the sampled altitude and the true maximum, so that the case holds whatever
    // the accuracy of the estimate:
    const day = new Date('2021-02-28T00:00:00.000+00:00')

    const { noon } = getGeneralizedSolarTransit(day, alert)

    expect(noon).toBeInstanceOf(Date)

    if (!noon) return

    const sampled = altitude(noon, alert)

    let maximum = sampled

    for (let second = -2400; second <= 2400; second += 2) {
      maximum = Math.max(maximum, altitude(new Date(noon.getTime() + second * 1000), alert))
    }

    const horizon = (sampled + maximum) / 2

    const { sunrise, sunset } = getSolarTransit(day, alert, horizon)

    expect(sunrise).toBeInstanceOf(Date)
    expect(sunset).toBeInstanceOf(Date)
  })

  it('should resolve a grazing set the estimated lower culmination samples on the wrong side of', () => {
    // The mirror of the case above, at the lower culmination: the altitude sampled half a solar
    // day from the estimated noon sits above the true minimum, and a horizon between the two is
    // crossed, but only where the lower culmination is refined before deciding:
    const day = new Date('2021-04-08T00:00:00.000+00:00')

    const { noon } = getGeneralizedSolarTransit(day, alert)

    expect(noon).toBeInstanceOf(Date)

    if (!noon) return

    const sampled = altitude(new Date(noon.getTime() + 12 * 3600000), alert)

    let minimum = sampled

    for (let second = -2400; second <= 2400; second += 2) {
      minimum = Math.min(
        minimum,
        altitude(new Date(noon.getTime() + 12 * 3600000 + second * 1000), alert)
      )
    }

    const horizon = (sampled + minimum) / 2

    const { sunrise, sunset } = getSolarTransit(day, alert, horizon)

    expect(sunrise).toBeInstanceOf(Date)
    expect(sunset).toBeInstanceOf(Date)
  })

  it('should return the night for an observer in polar civil night', () => {
    // At a latitude of 78° at midwinter the Sun never rises, but it does cross -18° twice a day,
    // and so the astronomical night has a start and an end, e.g., the observer is not gated on
    // whether the Sun crosses the astronomical horizon:
    const { start, end } = getNight(
      new Date('2021-12-21T00:00:00.000+00:00'),
      { latitude: 78, longitude: 0 },
      -18
    )

    expect(start?.toISOString()).toBe('2021-12-21T16:19:00.869Z')
    expect(end?.toISOString()).toBe('2021-12-22T07:37:42.960Z')
  })
})

/*****************************************************************************************************************/

describe('isNight at the poles', () => {
  it('should return true for an observer in polar night, for whom the Sun never rises', () => {
    // At Alert at midwinter the Sun never crosses the horizon at all, and so it is night all day,
    // e.g., the answer does not depend on a sunrise or a sunset existing to compare against:
    expect(isNight(new Date('2021-12-21T00:00:00.000+00:00'), alert, 0)).toBe(true)
    expect(isNight(new Date('2021-12-21T12:00:00.000+00:00'), alert, 0)).toBe(true)
  })

  it('should return true during polar astronomical night at a twilight horizon', () => {
    // At a latitude of 78° at midwinter the Sun never rises, but it is only below -18° for part
    // of the day, e.g., it is astronomical night at local midnight and not at local noon:
    const observer = { latitude: 78, longitude: 0 }

    expect(isNight(new Date('2021-12-21T00:00:00.000+00:00'), observer, -18)).toBe(true)
    expect(isNight(new Date('2021-12-21T12:00:00.000+00:00'), observer, -18)).toBe(false)
  })

  it('should return false for an observer in perpetual daylight', () => {
    expect(isNight(new Date('2021-06-21T00:00:00.000+00:00'), alert, 0)).toBe(false)
    expect(isNight(new Date('2021-06-21T12:00:00.000+00:00'), alert, 0)).toBe(false)
  })

  it('should resolve an observer at exactly a celestial pole', () => {
    // The altitude of the Sun for an observer at a pole is its declination, which the conversion
    // resolves through its ordinary path, e.g., the guard within it against a cosine of exactly
    // zero does not fire at ±90°, where the cosine is ~6.1e-17. It is polar day at the summer
    // pole and polar night at the winter one, whatever the hour:
    for (const hour of ['00', '12']) {
      expect(isNight(new Date(`2021-06-21T${hour}:00:00.000+00:00`), { latitude: 90, longitude: 0 }, 0)).toBe(false)
      expect(isNight(new Date(`2021-06-21T${hour}:00:00.000+00:00`), { latitude: -90, longitude: 0 }, 0)).toBe(true)
      expect(isNight(new Date(`2021-12-21T${hour}:00:00.000+00:00`), { latitude: 90, longitude: 0 }, 0)).toBe(true)
      expect(isNight(new Date(`2021-12-21T${hour}:00:00.000+00:00`), { latitude: -90, longitude: 0 }, 0)).toBe(false)
    }
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
