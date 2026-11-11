/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/constellations
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { constellations, type EquatorialCoordinate, getConstellation } from '../src'

/*****************************************************************************************************************/

// For testing
const betelgeuse: EquatorialCoordinate = { ra: 88.7929583, dec: 7.4070639 }

// For testing
const polaris: EquatorialCoordinate = { ra: 37.9528333, dec: 89.2641083 }

// For testing
const alphaCentauri: EquatorialCoordinate = { ra: 219.9009167, dec: -60.8339722 }

/*****************************************************************************************************************/

describe('constellations', () => {
  it('should be defined', () => {
    expect(constellations).toBeDefined()
  })

  it('should contain all 87+2 modern constellations', () => {
    // We have 89 constellations in total, as we split Serpens into two separate constellations:
    // e.g., Serpens Caput and Serpens Cauda:
    expect(constellations.size).toBe(89)
  })
})

/*****************************************************************************************************************/

describe('getConstellation', () => {
  it('should be defined', () => {
    expect(getConstellation).toBeDefined()
  })

  it('should give the correct constellation of Orion for the star Betelgeuse', () => {
    const constellation = getConstellation(betelgeuse)

    expect(constellation).toBeDefined()

    if (!constellation) {
      throw new Error('Constellation not defined')
    }

    expect(constellation.name).toBe('Orion')
    expect(constellation.abbreviation).toBe('Ori')
  })

  it('should give the correct constellation of Ursa Minor for the star Polaris', () => {
    const constellation = getConstellation(polaris)

    expect(constellation).toBeDefined()

    if (!constellation) {
      throw new Error('Constellation not defined')
    }

    expect(constellation.name).toBe('Ursa Minor')
    expect(constellation.abbreviation).toBe('UMi')
  })

  it('should give the correct constellation of Centaurus for the star Alpha Centauri', () => {
    const constellation = getConstellation(alphaCentauri)

    expect(constellation).toBeDefined()

    if (!constellation) {
      throw new Error('Constellation not defined')
    }

    expect(constellation.name).toBe('Centaurus')
    expect(constellation.abbreviation).toBe('Cen')
  })

  it.each([
    ['Unukalhai (α Serpentis)', 236.067, 6.4256, 'Serpens Caput', 'SerCap'],
    ['M5', 229.6384, 2.081, 'Serpens Caput', 'SerCap'],
    ['Alya (θ¹ Serpentis)', 284.0549, 4.2036, 'Serpens Cauda', 'SerCad'],
    ['M16', 274.7, -13.807, 'Serpens Cauda', 'SerCad']
  ])('should give the correct part of Serpens for %s', (_, ra, dec, name, abbreviation) => {
    // The Nancy Roman lookup table gives Serpens as the one constellation, and so the part either side of
    // Ophiuchus is resolved from the right ascension of the target:
    const constellation = getConstellation({ ra, dec })

    expect(constellation).toBeDefined()

    if (!constellation) {
      throw new Error('Constellation not defined')
    }

    expect(constellation.name).toBe(name)
    expect(constellation.abbreviation).toBe(abbreviation)
  })

  it.each([
    ['NGC 7814', 0.8121, 16.1453, 'Pegasus', 'Peg'],
    ['30 Piscium', 0.49, -6.0141, 'Pisces', 'Psc'],
    ['a target at 0.1° and the celestial equator', 0.1, 0, 'Pisces', 'Psc']
  ])(
    'should give the correct constellation for %s, just east of 0h',
    (_, ra, dec, name, abbreviation) => {
      // The precession to 1875 carries a target just east of 0h to just west of it, e.g., to a right
      // ascension of ~359°, and not to a negative right ascension that lies outside of every boundary:
      const constellation = getConstellation({ ra, dec })

      expect(constellation).toBeDefined()

      if (!constellation) {
        throw new Error('Constellation not defined')
      }

      expect(constellation.name).toBe(name)
      expect(constellation.abbreviation).toBe(abbreviation)
    }
  )
})

/*****************************************************************************************************************/
