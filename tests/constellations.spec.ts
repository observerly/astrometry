/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/constellations
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { type EquatorialCoordinate, constellations, getConstellation } from '../src'

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

  it('should contain all 88 modern constellations', () => {
    expect(constellations.size).toBe(88)
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
})

/*****************************************************************************************************************/
