/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/moon
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { getMeanAnomaly, getMeanGeometricLongitude, getMeanEclipticLongitude } from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

/*****************************************************************************************************************/

describe('getMeanAnomaly', () => {
  it('should be defined', () => {
    expect(getMeanAnomaly).toBeDefined()
  })

  it('should return the correct Lunar mean anomaly for the given date', () => {
    const M = getMeanAnomaly(datetime)
    expect(M).toBe(207.63633585681964)
  })
})

/*****************************************************************************************************************/

describe('getMeanGeometricLongitude', () => {
  it('should be defined', () => {
    expect(getMeanGeometricLongitude).toBeDefined()
  })

  it('should return the correct Lunar mean geometric longitude for the given date', () => {
    const l = getMeanGeometricLongitude(datetime)
    expect(l).toBe(80.32626508452813)
  })
})

/*****************************************************************************************************************/

describe('getMeanEclipticLongitude', () => {
  it('should be defined', () => {
    expect(getMeanEclipticLongitude).toBeDefined()
  })

  it('should return the correct Lunar mean ecliptic longitude for the given date', () => {
    const λ = getMeanEclipticLongitude(datetime)
    expect(λ).toBe(79.88317358099448)
  })
})

/*****************************************************************************************************************/
