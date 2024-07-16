/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/conjunction
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  type Planet,
  findPlanetaryConjunction,
  isPlanetaryConjunction,
  jupiter,
  saturn,
  venus
} from '../src'

/*****************************************************************************************************************/

// We are specifically testing for conjunctions between Jupiter and Venus:
const planets = [jupiter, venus] as [Planet, Planet]

// For testing we will fix the latitude to be Manua Kea, Hawaii, US
export const latitude = 19.820611

// For testing we will fix the longitude to be Manua Kea, Hawaii, US:
export const longitude = -155.468094

/*****************************************************************************************************************/

describe('isPlanetaryConjunction(datetime)', () => {
  it('should be defined', () => {
    expect(isPlanetaryConjunction).toBeDefined()
  })

  it('should return true when we know we do have a conjunction between Jupiter and Venus', () => {
    // We are specifically testing for a conjunction between Jupiter and Venus
    // on the 2nd of March 2023 at 10:00 UTC (Coordinated Universal Time).
    const datetime = new Date('2023-03-02T23:00:00Z')

    const conjunction = isPlanetaryConjunction(datetime, { latitude, longitude }, planets)

    expect(conjunction).toBeDefined()
    expect(conjunction).not.toBe(false)

    if (conjunction) {
      expect(conjunction.angularSeparation).toBeLessThan(3)
      expect(conjunction.ra).toBeGreaterThan(0)
      expect(conjunction.dec).toBeGreaterThan(0)
    } else {
      throw new Error('Conjunction is not defined')
    }
  })

  it('should return false when we know we do not have a conjunction between Jupiter and Venus', () => {
    // We are specifically testing for a conjunction between Jupiter and Venus
    // on the 2nd of March 2023 at 10:00 UTC (Coordinated Universal Time).
    const datetime = new Date('2023-07-02T10:00:00Z')

    const conjunction = isPlanetaryConjunction(datetime, { latitude, longitude }, planets)
    expect(conjunction).toBe(false)
  })
})

/*****************************************************************************************************************/

describe('findPlanetaryConjunction()', () => {
  it('should be defined', () => {
    expect(findPlanetaryConjunction).toBeDefined()
  })

  it('should return the next conjunction between Jupiter and Venus', () => {
    // We are specifically testing for a conjunction between Jupiter and Venus
    // from the 1st of January 2023 at 10:00 UTC (Coordinated Universal Time).
    const datetime = new Date('2023-01-01T10:00:00Z')

    // Searching for the next conjunction between Jupiter and Venus within a year
    // of the given datetime.
    const conjunction = findPlanetaryConjunction(
      {
        from: datetime,
        to: new Date(datetime.getTime() + 1000 * 60 * 60 * 24 * 365)
      },
      { latitude, longitude },
      planets
    )

    expect(conjunction).toBeDefined()
    expect(conjunction).not.toBe(false)

    if (conjunction) {
      expect(conjunction.datetime).toMatchObject(new Date('2023-02-24T23:20:00Z'))
      expect(conjunction.angularSeparation).toBeLessThan(3)
      expect(conjunction.ra).toBeGreaterThan(0)
      expect(conjunction.dec).toBeGreaterThan(0)
    } else {
      throw new Error('Conjunction is not defined')
    }
  })

  it('should return the next conjunction between Saturn and Venus', () => {
    // We are specifically testing for a conjunction between Saturn and Venus
    // from the 1st of January 2023 at 10:00 UTC (Coordinated Universal Time).
    const datetime = new Date('2023-01-01T10:00:00Z')

    // Searching for the next conjunction between Saturn and Venus within a year
    // of the given datetime.
    const conjunction = findPlanetaryConjunction(
      {
        from: datetime,
        to: new Date(datetime.getTime() + 1000 * 60 * 60 * 24 * 365)
      },
      { latitude, longitude },
      [saturn, venus]
    )

    expect(conjunction).toBeDefined()
    expect(conjunction).not.toBe(false)

    if (conjunction) {
      expect(conjunction.datetime).toMatchObject(new Date('2023-01-19T19:20:00.000Z'))
      expect(conjunction.angularSeparation).toBeLessThan(3)
      expect(conjunction.ra).toBeGreaterThan(0)
      expect(conjunction.dec).toBeLessThan(0)
    } else {
      throw new Error('Conjunction is not defined')
    }
  })
})

/*****************************************************************************************************************/
