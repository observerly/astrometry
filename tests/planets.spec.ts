/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/orbit
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import {
  getPlanetaryEquationOfCenter,
  getPlanetaryMeanAnomaly,
  getPlanetaryTrueAnomaly,
  getPlanetaryHeliocentricEclipticLongitude,
  planets
} from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

/*****************************************************************************************************************/

describe('getPlanetaryMeanAnomaly', () => {
  it('should be defined', () => {
    expect(getPlanetaryMeanAnomaly).toBeDefined()
  })

  it('should return the correct value for Venus at the datetime prescribed', () => {
    const venus = planets.find(planet => planet.name === 'Venus')
    expect(venus).toBeDefined()
    const M = getPlanetaryMeanAnomaly(new Date('2016-01-04T03:00:00+00:00'), venus)
    expect(M).toBeCloseTo(57.636998)
  })
})

/*****************************************************************************************************************/

describe('getPlanetaryEquationOfCenter', () => {
  it('should be defined', () => {
    expect(getPlanetaryEquationOfCenter).toBeDefined()
  })

  it('should return the correct value for Venus at the datetime prescribed', () => {
    const venus = planets.find(planet => planet.name === 'Venus')
    expect(venus).toBeDefined()
    const E = getPlanetaryEquationOfCenter(new Date('2016-01-04T03:00:00+00:00'), venus)
    expect(E).toBeCloseTo(0.655907)
  })
})

/*****************************************************************************************************************/

describe('getPlanetaryTrueAnomaly', () => {
  it('should be defined', () => {
    expect(getPlanetaryTrueAnomaly).toBeDefined()
  })

  it('should return the correct value for Venus at the datetime prescribed', () => {
    const venus = planets.find(planet => planet.name === 'Venus')
    expect(venus).toBeDefined()
    const E = getPlanetaryTrueAnomaly(new Date('2016-01-04T03:00:00+00:00'), venus)
    expect(E).toBeCloseTo(58.288946)
  })
})

/*****************************************************************************************************************/

describe('getPlanetaryHeliocentricEclipticLongitude', () => {
  it('should be defined', () => {
    expect(getPlanetaryHeliocentricEclipticLongitude).toBeDefined()
  })

  it('should return the correct value for Venus at the datetime prescribed', () => {
    const venus = planets.find(planet => planet.name === 'Venus')
    expect(venus).toBeDefined()
    const L = getPlanetaryHeliocentricEclipticLongitude(
      new Date('2016-01-04T03:00:00+00:00'),
      venus
    )
    expect(L).toBeCloseTo(189.891413)
  })
})

/*****************************************************************************************************************/
