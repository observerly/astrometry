/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/twilight
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { getTwilightBandsForDay, Twilight } from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T03:00:00.000+00:00')

// For testing we will fix the latitude to be Manua Kea, Hawaii, US
export const latitude = 19.820611

// For testing we will fix the longitude to be Manua Kea, Hawaii, US:
export const longitude = -155.468094

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
    expect(bands[0].interval.from).toEqual(new Date(datetime.setHours(0, 0, 0, 0)))
    expect(bands[bands.length - 1].interval.to).toEqual(new Date(datetime.setHours(24, 0, 0, 0)))
  })

  it('should always have bands that proceed in the correct order', () => {
    const bands = getTwilightBandsForDay(datetime, { latitude, longitude })

    expect(bands).toBeDefined()

    for (let i = 1; i < bands.length; i++) {
      const previousEnd = bands[i - 1].interval.to
      const currentStart = bands[i].interval.from
      expect(currentStart.getTime()).toBe(previousEnd.getTime())
    }
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
})

/*****************************************************************************************************************/
