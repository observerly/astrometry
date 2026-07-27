/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/conjunction
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  type Planet,
  convertEclipticToEquatorial,
  convertEquatorialToHorizontal,
  findConjunction,
  findPlanetaryConjunction,
  findPlanetaryConjunctions,
  getLunarEquatorialCoordinate,
  getMidpointEquatorialCoordinate,
  getPlanetaryGeocentricEclipticCoordinate,
  isConjunction,
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

describe('getMidpointEquatorialCoordinate', () => {
  it('should be defined', () => {
    expect(getMidpointEquatorialCoordinate).toBeDefined()
  })

  it('should return the midpoint of two equatorial coordinates', () => {
    const { ra, dec } = getMidpointEquatorialCoordinate(
      { ra: 179, dec: -20 },
      { ra: 181, dec: 20 }
    )

    expect(ra).toBeCloseTo(180, 9)
    expect(dec).toBeCloseTo(0, 9)
  })

  it('should return the midpoint of two equatorial coordinates either side of 0h', () => {
    // The midpoint of 359° and 3° is 1°, and not the arithmetic mean of 181°:
    const { ra, dec } = getMidpointEquatorialCoordinate({ ra: 359, dec: 0 }, { ra: 3, dec: 0 })

    expect(ra).toBeCloseTo(1, 9)
    expect(dec).toBeCloseTo(0, 9)
  })

  it('should return the midpoint of two equatorial coordinates close to the pole', () => {
    const { ra, dec } = getMidpointEquatorialCoordinate({ ra: 0, dec: 89 }, { ra: 180, dec: 89 })

    expect(ra).toBeCloseTo(90, 9)
    expect(dec).toBeCloseTo(90, 9)
  })

  it('should be commutative in the order of the two equatorial coordinates', () => {
    const A = { ra: 359.2, dec: -1.4 }
    const B = { ra: 0.8, dec: -1.7 }

    expect(getMidpointEquatorialCoordinate(A, B)).toEqual(getMidpointEquatorialCoordinate(B, A))
  })
})

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

  it('should return a midpoint on the same side of the sky when the targets straddle 0h', () => {
    // On the 2nd of May 2022 Venus and Jupiter are either side of the vernal equinox at 0h,
    // e.g., Venus is at a right ascension of ~0.5° and Jupiter is at ~358.4°:
    const datetime = new Date('2022-05-02T16:00:00Z')

    const conjunction = isPlanetaryConjunction(datetime, { latitude, longitude }, planets)

    expect(conjunction).not.toBe(false)

    if (!conjunction) {
      throw new Error('Conjunction is not defined')
    }

    // The midpoint must lie between the two targets, and not on the opposite side of the sky:
    expect(conjunction.ra).toBeCloseTo(359.467, 3)
    expect(conjunction.dec).toBeCloseTo(-1.5568, 4)
  })
})

/*****************************************************************************************************************/

describe('isConjunction()', () => {
  it('should be defined', () => {
    expect(isConjunction).toBeDefined()
  })

  it('should return the next conjunction between Jupiter and Venus', () => {
    // We are specifically testing for a conjunction between Jupiter and Venus
    // from the 1st of January 2023 at 10:00 UTC (Coordinated Universal Time).
    const datetime = new Date('2023-01-01T10:00:00Z')

    const jupiter = {
      name: 'Jupiter',
      alt: 64.0599911587097,
      az: 130.91766651820868,
      ra: 8.420871680780856,
      dec: 2.0277241328636877
    }

    const venus = {
      name: 'Venus',
      alt: 65.63530627727039,
      az: 136.9150698751929,
      ra: 5.47961736055115,
      dec: 1.4571416216749102
    }

    const conjunction = isConjunction(datetime, [jupiter, venus])

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

  it('should return true when we have a conjunction between Jupiter and the Moon', () => {
    // We are specifically testing for a conjunction between Jupiter and the Moon
    // on the 27th of August 2024 at 12:45 UTC (Coordinated Universal Time).
    const datetime = new Date('2024-08-27T12:45:00Z')

    const { β, λ } = getPlanetaryGeocentricEclipticCoordinate(datetime, jupiter)

    const { ra, dec } = convertEclipticToEquatorial(datetime, { λ, β })

    const planet = {
      name: 'Jupiter',
      ra,
      dec,
      ...convertEquatorialToHorizontal(datetime, { latitude, longitude }, { ra, dec })
    }

    const lunar = getLunarEquatorialCoordinate(datetime)

    const moon = {
      name: 'Moon',
      ra: lunar.ra,
      dec: lunar.dec,
      ...convertEquatorialToHorizontal(datetime, { latitude, longitude }, lunar)
    }

    const conjunction = isConjunction(datetime, [planet, moon], {
      angularSeparationThreshold: 6
    })

    expect(conjunction).toBeDefined()
    expect(conjunction).not.toBe(false)

    if (conjunction) {
      expect(conjunction.angularSeparation).toBeLessThan(6)
      expect(conjunction.ra).toBeGreaterThan(0)
      expect(conjunction.dec).toBeGreaterThan(0)
    } else {
      throw new Error('Conjunction is not defined')
    }
  })

  it('should return the midpoint of two targets either side of 0h right ascension', () => {
    const datetime = new Date('2021-05-14T00:00:00Z')

    const conjunction = isConjunction(datetime, [
      { name: 'A', alt: 45, az: 180, ra: 359, dec: 0 },
      { name: 'B', alt: 45, az: 182, ra: 3, dec: 0 }
    ])

    expect(conjunction).not.toBe(false)

    if (!conjunction) {
      throw new Error('Conjunction is not defined')
    }

    // The midpoint of 359° and 3° is 1°, and not the arithmetic mean of 181°:
    expect(conjunction.ra).toBeCloseTo(1, 9)
    expect(conjunction.dec).toBeCloseTo(0, 9)
  })

  it('should return the midpoint of two targets which do not straddle 0h right ascension', () => {
    const datetime = new Date('2021-05-14T00:00:00Z')

    const conjunction = isConjunction(datetime, [
      { name: 'A', alt: 45, az: 180, ra: 179, dec: -20 },
      { name: 'B', alt: 45, az: 182, ra: 181, dec: 20 }
    ])

    expect(conjunction).not.toBe(false)

    if (!conjunction) {
      throw new Error('Conjunction is not defined')
    }

    expect(conjunction.ra).toBeCloseTo(180, 9)
    expect(conjunction.dec).toBeCloseTo(0, 9)
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

describe('findConjunction()', () => {
  it('should be defined', () => {
    expect(findConjunction).toBeDefined()
  })

  it('should return the next conjunction between Jupiter and Venus', () => {
    // We are specifically testing for a conjunction between Jupiter and Venus
    // from the 1st of January 2023 at 10:00 UTC (Coordinated Universal Time).
    const datetime = new Date('2023-01-01T10:00:00Z')

    const jupiter = {
      name: 'Jupiter',
      alt: 64.0599911587097,
      az: 130.91766651820868,
      ra: 8.420871680780856,
      dec: 2.0277241328636877
    }

    const venus = {
      name: 'Venus',
      alt: 65.63530627727039,
      az: 136.9150698751929,
      ra: 5.47961736055115,
      dec: 1.4571416216749102
    }

    // Searching for the next conjunction between Jupiter and Venus within a year
    // of the given datetime.
    const conjunction = findConjunction(
      {
        from: datetime,
        to: new Date(datetime.getTime() + 1000 * 60 * 60 * 24 * 365)
      },
      [jupiter, venus]
    )

    expect(conjunction).toBeDefined()
    expect(conjunction).not.toBe(false)

    if (conjunction) {
      expect(conjunction.datetime).toMatchObject(new Date('2023-01-01T10:00:00.000Z'))
      expect(conjunction.angularSeparation).toBeLessThan(3)
      expect(conjunction.ra).toBeGreaterThan(0)
      expect(conjunction.dec).toBeGreaterThan(0)
    } else {
      throw new Error('Conjunction is not defined')
    }
  })
})

/*****************************************************************************************************************/

describe('findPlanetaryConjunctions()', () => {
  it('should be defined', () => {
    expect(findPlanetaryConjunctions).toBeDefined()
  })

  it('should return the next conjunction between Venus and Saturn, and Venus & Jupiter', () => {
    // We are specifically testing for a conjunction between Jupiter and Venus
    // from the 1st of January 2023 at 10:00 UTC (Coordinated Universal Time).
    const datetime = new Date('2023-01-01T10:00:00Z')

    // Searching for the next conjunction between Jupiter and Venus within a year
    // of the given datetime.
    const conjunctions = findPlanetaryConjunctions(
      {
        from: datetime,
        to: new Date(datetime.getTime() + 1000 * 60 * 60 * 24 * 60)
      },
      { latitude, longitude }
    )

    // We should find two conjunctions between Jupiter and Venus, Saturn and Venus,
    // Neptune and Venus, and Mercury and Venus.
    expect(conjunctions).toBeDefined()
    expect(conjunctions).toHaveLength(4)
  })

  it('should return the March 13th 2012 conjunction between Venus and Jupiter', () => {
    const datetime = new Date('2012-03-10T00:00:00Z')

    // Searching for the next conjunction between Mercury, Venus and Jupiter within a week
    // of the given datetime.
    const conjunctions = findPlanetaryConjunctions(
      {
        from: datetime,
        to: new Date(datetime.getTime() + 1000 * 60 * 60 * 24 * 3)
      },
      { latitude, longitude },
      {
        angularSeparationThreshold: 4 // to spot the March 13th 2012 conjunction, we need to increase the threshold to 4 degrees
      }
    )

    expect(conjunctions).toBeDefined()
    expect(conjunctions).toHaveLength(1)

    const conjunction = Array.from(conjunctions.values()).at(0)

    expect(conjunction).toBeDefined()

    if (!conjunction) {
      throw new Error('Conjunction between Venus & Jupiter is not defined')
    }

    expect(conjunction.targets).toHaveLength(2)
    expect(conjunction.targets[0].name).toBe('Venus')
    expect(conjunction.targets[1].name).toBe('Jupiter')
  })
})

/*****************************************************************************************************************/
