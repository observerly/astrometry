/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/moon
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  getLunarMeanAnomaly,
  getLunarMeanGeometricLongitude,
  getLunarMeanEclipticLongitude
} from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

/*****************************************************************************************************************/

describe('getLunarMeanAnomaly', () => {
  it('should be defined', () => {
    expect(getLunarMeanAnomaly).toBeDefined()
  })

  it('should return the correct Lunar mean anomaly for the given date', () => {
    const M = getLunarMeanAnomaly(datetime)
    expect(M).toBe(207.63633585681964)
  })
})

/*****************************************************************************************************************/

describe('getLunarMeanGeometricLongitude', () => {
  it('should be defined', () => {
    expect(getLunarMeanGeometricLongitude).toBeDefined()
  })

  it('should return the correct Lunar mean geometric longitude for the given date', () => {
    const l = getLunarMeanGeometricLongitude(datetime)
    expect(l).toBe(80.32626508452813)
  })
})

/*****************************************************************************************************************/

describe('getLunarMeanEclipticLongitude', () => {
  it('should be defined', () => {
    expect(getLunarMeanEclipticLongitude).toBeDefined()
  })

  it('should return the correct Lunar mean ecliptic longitude for the given date', () => {
    const λ = getLunarMeanEclipticLongitude(datetime)
    expect(λ).toBe(79.88317358099448)
  })
})

/*****************************************************************************************************************/
