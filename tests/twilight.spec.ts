/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/twilight
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { getTwilightBandsForDay, Twilight } from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
const datetime = new Date('2021-05-14T03:00:00.000+00:00')

// For testing we will fix the latitude to be Manua Kea, Hawaii, US
const latitude = 19.820611

// For testing we will fix the longitude to be Manua Kea, Hawaii, US:
const longitude = -155.468094

/*****************************************************************************************************************/

describe('getTwilightBandsForDay', () => {
  it('should be defined', () => {
    expect(getTwilightBandsForDay).toBeDefined()
  })

  it('should return an array of twilight bands sensible for the date and observer given', () => {
    const bands = getTwilightBandsForDay(datetime, { latitude, longitude })
    expect(bands).toBeDefined()
    expect(bands.length).toBeGreaterThan(0)
  })

  it('should start at midnight and end at midnight', () => {
    const bands = getTwilightBandsForDay(datetime, { latitude, longitude })
    expect(bands).toBeDefined()

    expect(bands[0].interval.from).toEqual(
      new Date(
        Date.UTC(
          datetime.getUTCFullYear(),
          datetime.getUTCMonth(),
          datetime.getUTCDate(),
          0,
          0,
          0,
          0
        )
      )
    )

    expect(bands[bands.length - 1].interval.to).toEqual(
      new Date(
        Date.UTC(
          datetime.getUTCFullYear(),
          datetime.getUTCMonth(),
          datetime.getUTCDate(),
          24,
          0,
          0,
          0
        )
      )
    )
  })

  it('should return the same twilight bands irrespective of the host timezone', () => {
    const TZ = process.env.TZ

    // The day boundary is derived in UTC, and the bands are therefore independent of the timezone
    // of the host system the library is running on:
    const expected = getTwilightBandsForDay(datetime, { latitude, longitude })

    try {
      for (const timezone of ['Pacific/Auckland', 'America/New_York', 'Asia/Kolkata']) {
        process.env.TZ = timezone

        const bands = getTwilightBandsForDay(datetime, { latitude, longitude })

        expect(bands.length).toBe(expected.length)

        for (let i = 0; i < bands.length; i++) {
          expect(bands[i].name).toBe(expected[i].name)
          expect(bands[i].interval.from.getTime()).toBe(expected[i].interval.from.getTime())
          expect(bands[i].interval.to.getTime()).toBe(expected[i].interval.to.getTime())
        }
      }
    } finally {
      process.env.TZ = TZ
    }
  })

  it('should always have bands that proceed in the correct order', () => {
    const bands = getTwilightBandsForDay(datetime, { latitude, longitude })

    expect(bands).toBeDefined()

    for (let i = 1; i < bands.length; i++) {
      const previousEnd = bands[i - 1].interval.to
      const currentStart = bands[i].interval.from
      expect(currentStart.getTime()).toBe(previousEnd.getTime())
    }

    // We expect that the datetime was not mutated:
    expect(datetime).toEqual(new Date('2021-05-14T03:00:00.000+00:00'))
  })

  it('should always start during the night for UTC+0 timezones', () => {
    const bands = getTwilightBandsForDay(datetime, { latitude, longitude: 0 }, { stepSeconds: 1 })
    expect(bands).toBeDefined()

    console.log('Twilight Bands for UTC', bands)

    expect(bands[0].name).toBe(Twilight.Night)
  })

  it('should always return bands in the correct order for Hawaii', () => {
    const bands = getTwilightBandsForDay(datetime, { latitude, longitude })
    expect(bands).toBeDefined()

    for (let i = 1; i < bands.length; i++) {
      const previousTwilight = bands[i - 1].name
      const currentTwilight = bands[i].name

      switch (previousTwilight) {
        case Twilight.Day:
          expect(currentTwilight).toBe(Twilight.Civil)
          break
        case Twilight.Civil:
          expect([Twilight.Day, Twilight.Nautical]).toContain(currentTwilight)
          break
        case Twilight.Nautical:
          expect([Twilight.Civil, Twilight.Astronomical]).toContain(currentTwilight)
          break
        case Twilight.Astronomical:
          expect([Twilight.Nautical, Twilight.Night]).toContain(currentTwilight)
          break
        case Twilight.Night:
          expect(currentTwilight).toBe(Twilight.Astronomical)
          break
        default:
          throw new Error(`Unexpected twilight transition from ${previousTwilight}`)
      }
    }
  })

  it('should throw for a step of zero seconds', () => {
    expect(() =>
      getTwilightBandsForDay(datetime, { latitude, longitude }, { stepSeconds: 0 })
    ).toThrow('Invalid step: stepSeconds must be finite and greater than zero')

    expect(() =>
      getTwilightBandsForDay(datetime, { latitude, longitude }, { stepSeconds: -0 })
    ).toThrow('Invalid step: stepSeconds must be finite and greater than zero')
  })

  it('should throw for a step of less than zero seconds', () => {
    for (const stepSeconds of [-0.001, -1, -10, -86400, -Number.MAX_VALUE]) {
      expect(() =>
        getTwilightBandsForDay(datetime, { latitude, longitude }, { stepSeconds })
      ).toThrow('Invalid step: stepSeconds must be finite and greater than zero')
    }
  })

  it('should throw for a step that is not finite', () => {
    for (const stepSeconds of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() =>
        getTwilightBandsForDay(datetime, { latitude, longitude }, { stepSeconds })
      ).toThrow('Invalid step: stepSeconds must be finite and greater than zero')
    }
  })

  it('should throw an Error for an invalid step without mutating the datetime', () => {
    expect(() =>
      getTwilightBandsForDay(datetime, { latitude, longitude }, { stepSeconds: 0 })
    ).toThrow(Error)

    expect(datetime).toEqual(new Date('2021-05-14T03:00:00.000+00:00'))
  })

  it('should fall back to the default step when the step is not specified', () => {
    const expected = getTwilightBandsForDay(datetime, { latitude, longitude }, { stepSeconds: 10 })

    expect(getTwilightBandsForDay(datetime, { latitude, longitude })).toEqual(expected)

    expect(getTwilightBandsForDay(datetime, { latitude, longitude }, {})).toEqual(expected)

    expect(
      getTwilightBandsForDay(datetime, { latitude, longitude }, { stepSeconds: undefined })
    ).toEqual(expected)
  })

  it('should resolve contiguous bands spanning the whole day for a step greater than zero', () => {
    for (const stepSeconds of [2.5, 60, 3600]) {
      const bands = getTwilightBandsForDay(datetime, { latitude, longitude }, { stepSeconds })

      expect(bands.length).toBeGreaterThan(0)

      expect(bands[0].interval.from.getTime()).toBe(Date.UTC(2021, 4, 14, 0, 0, 0, 0))

      expect(bands[bands.length - 1].interval.to.getTime()).toBe(Date.UTC(2021, 4, 15, 0, 0, 0, 0))

      for (let i = 1; i < bands.length; i++) {
        expect(bands[i].interval.from.getTime()).toBe(bands[i - 1].interval.to.getTime())
        expect(bands[i].name).not.toBe(bands[i - 1].name)
      }
    }
  })

  it('should resolve a single band spanning the whole day for a step longer than the day', () => {
    for (const stepSeconds of [86400, 172800, Number.MAX_SAFE_INTEGER]) {
      const bands = getTwilightBandsForDay(datetime, { latitude, longitude }, { stepSeconds })

      expect(bands.length).toBe(1)

      expect(bands[0].interval.from.getTime()).toBe(Date.UTC(2021, 4, 14, 0, 0, 0, 0))

      expect(bands[0].interval.to.getTime()).toBe(Date.UTC(2021, 4, 15, 0, 0, 0, 0))
    }
  })
})

/*****************************************************************************************************************/
