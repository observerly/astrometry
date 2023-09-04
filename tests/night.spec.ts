/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/moon
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { getSolarTransit, getNight } from '../src'

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
