/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/moon
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { getNight, getSolarTransit, isNight } from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T03:00:00.000+00:00')

// For testing, we will fix the latitude to be the Isles of Scilly, Cornwall, UK.
export const latitude: number = 49.914425

// For testing, we will fix the longitude to be the Isles of Scilly, Cornwall, UK.
export const longitude: number = -6.315165

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

    expect(sunrise?.toISOString()).toBe('2021-05-14T04:46:57.636Z')
    expect(noon?.toISOString()).toBe('2021-05-14T12:21:40.985Z')
    expect(sunset?.toISOString()).toBe('2021-05-14T19:57:24.334Z')
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

    expect(sunrise?.toISOString()).toBe('2021-05-14T04:01:57.636Z')
    expect(noon?.toISOString()).toBe('2021-05-14T12:21:40.985Z')
    expect(sunset?.toISOString()).toBe('2021-05-14T20:43:24.334Z')
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

    expect(start?.toISOString()).toBe('2021-05-14T19:57:24.334Z')
    expect(end?.toISOString()).toBe('2021-05-15T04:46:03.311Z')
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

    expect(start?.toISOString()).toBe('2021-05-14T22:49:46.972Z')
    expect(end?.toISOString()).toBe('2021-05-15T10:34:31.677Z')
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
